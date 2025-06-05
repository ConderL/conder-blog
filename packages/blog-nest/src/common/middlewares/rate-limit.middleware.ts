import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../../redis/redis.service';

/**
 * 速率限制中间件
 * 用于限制API请求频率，防止DoS攻击
 */
@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private readonly logger = new Logger('RateLimitMiddleware');

  // 默认配置
  private readonly defaultMaxRequests = 100; // 默认每个IP每分钟最大请求数
  private readonly defaultTimeWindow = 60; // 默认时间窗口（秒）
  private maxRequests: number;
  private timeWindow: number;

  constructor(
    private configService: ConfigService,
    private redisService: RedisService,
  ) {
    // 从配置中读取速率限制设置
    this.maxRequests =
      this.configService.get<number>('RATE_LIMIT_MAX_REQUESTS') || this.defaultMaxRequests;
    this.timeWindow =
      this.configService.get<number>('RATE_LIMIT_TIME_WINDOW') || this.defaultTimeWindow;
  }

  async use(req: Request, res: Response, next: NextFunction) {
    // 获取客户端IP
    const clientIp = this.getClientIp(req);

    // 为API路径创建Redis键
    const key = `rate_limit:${clientIp}:${req.path}`;

    try {
      // 获取当前请求计数
      const currentCount = await this.redisService.get(key);
      const count = currentCount ? parseInt(currentCount, 10) : 0;

      // 如果超过限制，返回429状态码
      if (count >= this.maxRequests) {
        this.logger.warn(`IP ${clientIp} 请求过于频繁: ${req.method} ${req.path}`);

        // 设置响应头
        res.header('Retry-After', String(this.timeWindow));
        res.status(429).json({
          statusCode: 429,
          message: '请求过于频繁，请稍后再试',
          retryAfter: this.timeWindow,
        });
        return;
      }

      // 增加请求计数
      if (count === 0) {
        await this.redisService.set(key, '1', this.timeWindow);
      } else {
        await this.redisService.set(key, String(count + 1), this.timeWindow);
      }

      // 添加剩余请求数到响应头
      res.header('X-RateLimit-Limit', String(this.maxRequests));
      res.header('X-RateLimit-Remaining', String(this.maxRequests - count - 1));

      next();
    } catch (error) {
      this.logger.error(`速率限制检查失败: ${error.message}`);
      // 如果Redis出错，允许请求通过但记录错误
      next();
    }
  }

  /**
   * 获取客户端真实IP地址
   */
  private getClientIp(req: Request): string {
    // 尝试从各种HTTP头中获取真实IP
    const xForwardedFor = req.header('x-forwarded-for');
    if (xForwardedFor) {
      // 取第一个IP（最初的客户端IP）
      return xForwardedFor.split(',')[0].trim();
    }

    return req.header('x-real-ip') || req.ip || req.connection.remoteAddress || 'unknown';
  }
}
