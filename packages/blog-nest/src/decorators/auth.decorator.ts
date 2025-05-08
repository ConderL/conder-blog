import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

// 认证守卫在此处先创建一个导入占位符，后续需要实现
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

/**
 * 权限常量KEY
 */
export const ROLE_KEY = 'role';

/**
 * 角色权限
 */
export enum Role {
  USER = 'user', // 普通用户
  ADMIN = 'admin', // 管理员
}

/**
 * 认证装饰器
 * @param roles 所需角色
 * @returns
 */
export function Auth(...roles: Role[]) {
  return applyDecorators(SetMetadata(ROLE_KEY, roles), UseGuards(JwtAuthGuard), ApiBearerAuth());
}
