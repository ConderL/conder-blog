import { useUserStore } from "@/store";

/**
 * 检查用户是否拥有某个或某些权限
 * @param {string|string[]} permissions - 权限或权限数组
 * @returns {boolean} - 是否有权限
 */
export function checkPermission(permissions: string | string[]): boolean {
  if (!permissions || permissions.length === 0) {
    return false;
  }

  const userStore = useUserStore();

  // 管理员角色直接返回true (角色ID为1的是管理员)
  if (userStore.roleList?.some((role) => String(role) === "1")) {
    return true;
  }

  // 转换单个权限为数组形式
  const permArray = Array.isArray(permissions) ? permissions : [permissions];

  // 用户无权限列表，直接返回false
  if (!userStore.permissionList || userStore.permissionList.length === 0) {
    return false;
  }

  // 检查用户是否有权限列表中的任意一个权限
  return permArray.some((perm) => userStore.permissionList.includes(perm));
}

/**
 * 检查用户是否拥有某个或某些角色
 * @param {string|string[]} roles - 角色或角色数组
 * @returns {boolean} - 是否有角色
 */
export function checkRole(roles: string | string[]): boolean {
  if (!roles || roles.length === 0) {
    return false;
  }

  const userStore = useUserStore();

  // 管理员角色直接返回true
  if (userStore.roleList?.some((role) => String(role) === "1")) {
    return true;
  }

  // 转换单个角色为数组形式
  const roleArray = Array.isArray(roles) ? roles : [roles];

  // 用户无角色列表，直接返回false
  if (!userStore.roleList || userStore.roleList.length === 0) {
    return false;
  }

  // 检查用户是否有角色列表中的任意一个角色
  return roleArray.some((role) => userStore.roleList.includes(role));
}
