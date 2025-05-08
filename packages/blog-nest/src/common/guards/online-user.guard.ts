import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { OnlineService } from '../../modules/online/online.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

/**
 * 在线用户守卫
 * 用于验证用户是否在线
 */
@Injectable()
export class OnlineUserGuard implements CanActivate {
  constructor(
    private readonly onlineService: OnlineService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();

    // 从请求头中获取令牌
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('未提供有效的认证令牌');
    }

    const token = authHeader.substring(7);

    // 验证用户是否存在于在线用户列表中
    return this.validateOnlineUser(token, request);
  }

  /**
   * 验证用户是否在线
   * @param token JWT令牌
   * @param request 请求对象
   */
  private async validateOnlineUser(token: string, request: any): Promise<boolean> {
    try {
      // 获取会话信息
      const session = await this.onlineService.getSessionInfo(token);
      if (!session) {
        throw new UnauthorizedException('用户会话不存在或已过期，请重新登录');
      }

      // 验证JWT令牌
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('jwt.secret', 'blog_jwt_secret'),
      });

      // 确保令牌中的用户ID与会话中的用户ID一致
      if (payload.id !== session.userId) {
        throw new UnauthorizedException('无效的用户会话');
      }

      // 将用户信息添加到请求对象中
      request.user = {
        id: session.userId,
        username: session.username,
        nickname: session.nickname,
      };

      // 将令牌ID添加到请求对象中
      request.tokenId = token;

      // 更新最后访问时间
      await this.onlineService.updateLastAccessTime(token);

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('无效的认证令牌或会话已过期');
    }
  }
}
