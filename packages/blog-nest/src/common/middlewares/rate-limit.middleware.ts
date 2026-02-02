import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NextFunction, Request, Response } from 'express';
import { RedisService } from '../../redis/redis.service';

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private readonly logger = new Logger('RateLimitMiddleware');

  private readonly defaultMaxRequests = 100; // per time window
  private readonly defaultTimeWindow = 60; // seconds

  private readonly redisErrorBackoffMs = 30_000;
  private readonly redisErrorLogThrottleMs = 5_000;
  private redisUnavailableUntilMs = 0;
  private lastRedisErrorLogAtMs = 0;

  private maxRequests: number;
  private timeWindow: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {
    this.maxRequests =
      this.configService.get<number>('RATE_LIMIT_MAX_REQUESTS') ?? this.defaultMaxRequests;
    this.timeWindow =
      this.configService.get<number>('RATE_LIMIT_TIME_WINDOW') ?? this.defaultTimeWindow;
  }

  async use(req: Request, res: Response, next: NextFunction) {
    const now = Date.now();
    if (now < this.redisUnavailableUntilMs) return next();

    const clientIp = this.getClientIp(req);
    const key = `rate_limit:${clientIp}`;

    try {
      const client = this.redisService.getClient();
      const count = await client.incr(key);
      if (count === 1) {
        await client.expire(key, this.timeWindow);
      }

      if (count > this.maxRequests) {
        res.header('Retry-After', String(this.timeWindow));
        res.header('X-RateLimit-Limit', String(this.maxRequests));
        res.header('X-RateLimit-Remaining', '0');
        return res.status(429).json({
          statusCode: 429,
          message: '请求过于频繁，请稍后再试',
          retryAfter: this.timeWindow,
        });
      }

      res.header('X-RateLimit-Limit', String(this.maxRequests));
      res.header('X-RateLimit-Remaining', String(Math.max(0, this.maxRequests - count)));

      return next();
    } catch (error: any) {
      this.redisUnavailableUntilMs = Date.now() + this.redisErrorBackoffMs;

      const logNow = Date.now();
      if (logNow - this.lastRedisErrorLogAtMs >= this.redisErrorLogThrottleMs) {
        this.lastRedisErrorLogAtMs = logNow;
        this.logger.error(`Rate limit skipped due to Redis error: ${error?.message ?? error}`);
      }

      return next();
    }
  }

  private getClientIp(req: Request): string {
    const xForwardedFor = req.header('x-forwarded-for');
    if (xForwardedFor) return xForwardedFor.split(',')[0].trim();
    return req.header('x-real-ip') || req.ip || (req.socket?.remoteAddress as any) || 'unknown';
  }
}
