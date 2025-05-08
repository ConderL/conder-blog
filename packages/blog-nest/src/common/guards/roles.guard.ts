import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { PERMISSION_KEY } from '../decorators/require-permission.decorator';
import { Logger } from '@nestjs/common';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const requiredPermission = this.reflector.getAllAndOverride<string>(PERMISSION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // 如果没有设置角色要求和权限要求，则允许访问
    if (!requiredRoles && !requiredPermission) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    this.logger.debug(
      `权限检查: 用户: ${JSON.stringify(user)}, 需要角色: ${requiredRoles}, 需要权限: ${requiredPermission}`,
    );

    // 确保用户对象存在
    if (!user) {
      this.logger.warn('用户对象不存在，拒绝访问');
      return false;
    }

    // 检查角色
    if (requiredRoles) {
      // 使用用户名判断是否为管理员
      if (requiredRoles.includes('admin')) {
        const isAdmin = user.username === 'admin';
        this.logger.debug(`请求需要管理员角色，用户名: ${user.username}, 是否是管理员: ${isAdmin}`);

        // 如果不是管理员，直接拒绝
        if (!isAdmin) {
          return false;
        }
      } else {
        // TODO: 实现其他角色的检查逻辑
        // 可以根据user.roles检查用户是否拥有所需角色
        this.logger.warn('暂不支持非管理员角色检查');
        return false;
      }
    }

    // 检查权限
    if (requiredPermission) {
      // 管理员默认拥有所有权限
      if (user.username === 'admin') {
        this.logger.debug(`管理员用户具有所有权限，允许访问`);
        return true;
      }

      // TODO: 实现更细粒度的权限检查逻辑
      // 可以根据user.permissions检查用户是否拥有所需权限
      this.logger.debug(`需要检查权限: ${requiredPermission}，暂时只有管理员拥有此权限`);
      return false;
    }

    return true;
  }
}
