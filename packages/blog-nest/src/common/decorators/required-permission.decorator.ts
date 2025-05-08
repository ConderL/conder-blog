import { SetMetadata } from '@nestjs/common';

export const PERMISSION_KEY = 'permission';

/**
 * 设置接口所需权限
 * @param permission 权限标识
 */
export const RequiredPermission = (permission: string) => SetMetadata(PERMISSION_KEY, permission);
