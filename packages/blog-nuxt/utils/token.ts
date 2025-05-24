/**
 * token相关工具函数
 */

// token前缀
export const token_prefix = 'Bearer ';

// 存储token的key
export const token_key = 'token';

/**
 * 设置token
 * @param token token值
 */
export const setToken = (token: string) => {
  if (process.client) {
    localStorage.setItem(token_key, token);
  }
};

/**
 * 获取token
 * @returns token值
 */
export const getToken = (): string => {
  if (process.client) {
    return localStorage.getItem(token_key) || '';
  }
  return '';
};

/**
 * 移除token
 */
export const removeToken = () => {
  if (process.client) {
    localStorage.removeItem(token_key);
  }
}; 