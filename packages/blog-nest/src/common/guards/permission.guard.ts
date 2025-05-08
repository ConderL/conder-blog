import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { MenuService } from '../../modules/user/services/menu.service';
import { RoleService } from '../../modules/user/services/role.service';
import { Menu } from '../../modules/user/entities/menu.entity';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly roleService: RoleService,
    private readonly menuService: MenuService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 获取需要的权限
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>('permissions', [
      context.getHandler(),
      context.getClass(),
    ]);

    // 如果没有设置权限要求，则默认放行
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    // 获取用户信息
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;

    if (!userId) {
      return false;
    }

    // 获取用户角色
    const roles = await this.roleService.findByUserId(userId);
    const roleIds = roles.map((role) => role.id);

    // 超级管理员角色ID为1，可以访问所有接口
    if (roleIds.includes(1)) {
      return true;
    }

    // 获取用户权限列表
    const menus: Menu[] = await this.menuService.findByRoleIds(roleIds);
    const permissions = menus
      .filter((menu) => menu.perms)
      .map((menu) => menu.perms.split(','))
      .flat();

    // 检查是否有权限
    const hasPermission = requiredPermissions.some((permission) =>
      permissions.includes(permission),
    );

    if (!hasPermission) {
      throw new ForbiddenException('没有权限访问该资源');
    }

    return true;
  }
}
