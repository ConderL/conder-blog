import { SetMetadata } from '@nestjs/common';

export const PERMISSION_KEY = 'permission';

/**
 * 权限校验装饰器
 * @param permission 权限标识
 */
export const RequirePermission = (permission: string) => SetMetadata(PERMISSION_KEY, permission);
