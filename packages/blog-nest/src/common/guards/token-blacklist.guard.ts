import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class TokenBlacklistGuard implements CanActivate {
  private readonly logger = new Logger(TokenBlacklistGuard.name);

  constructor(
    private reflector: Reflector,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return true; // 让JWT守卫处理没有令牌的情况
    }

    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer' || !token) {
      return true; // 让JWT守卫处理无效的令牌
    }

    // 检查令牌是否在黑名单中
    const blacklistKey = `token:blacklist:${token}`;
    const isBlacklisted = await this.cacheManager.get(blacklistKey);

    if (isBlacklisted) {
      this.logger.warn(`令牌在黑名单中: ${token.substring(0, 15)}...`);
      throw new UnauthorizedException('令牌已失效，请重新登录');
    }

    return true;
  }
}
