import { Injectable, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { ROLE_KEY, Role } from '../decorators/auth.decorator';

/**
 * JWT认证守卫
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(private reflector: Reflector) {
    super();
  }

  /**
   * 权限验证
   * @param context 上下文
   * @returns 是否通过认证
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 调用父类方法验证token
    const result = (await super.canActivate(context)) as boolean;
    if (!result) {
      throw new UnauthorizedException('认证失败，请重新登录');
    }

    // 获取角色
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // 如果没有设置角色，直接通过
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // 获取请求对象
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // 验证用户角色是否符合要求
    const hasRole = requiredRoles.some((role) => user.roles?.includes(role));

    if (!hasRole) {
      this.logger.warn(`用户 ${user.username} 权限不足，需要角色: ${requiredRoles.join(',')}`);
      throw new UnauthorizedException('权限不足，请联系管理员');
    }

    return true;
  }
}
