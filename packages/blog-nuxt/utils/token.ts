/**
 * token前缀
 */
export const token_prefix = "Bearer ";

/**
 * 存储本地token的key
 */
export const storage_token_key = "_cdt";

/**
 * 从localStorage获取token
 * @returns token
 */
export function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(storage_token_key);
  }
  return null;
}

/**
 * 设置token到localStorage
 * @param token token
 */
export function setToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(storage_token_key, token);
  }
}

/**
 * 从localStorage删除token
 */
export function removeToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(storage_token_key);
  }
} 