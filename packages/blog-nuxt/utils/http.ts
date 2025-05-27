import type { AxiosPromise } from 'axios';

/**
 * 简单的 HTTP 请求函数，用于 APlayer 组件
 * @param options 请求选项
 * @returns Promise
 */
export default function request<T>(options: {
  url: string;
  method?: 'get' | 'post' | 'put' | 'delete';
  data?: any;
  params?: any;
}): Promise<{ data: T }> {
  const { url, method = 'get', data, params } = options;
  
  // 使用 Nuxt 的 $fetch 函数
  return $fetch(url, {
    method,
    body: data,
    params,
    headers: {
      'Content-Type': 'application/json',
    },
  }).then((response) => {
    return { data: response as T };
  }).catch((error) => {
    console.error('请求出错:', error);
    throw error;
  });
} 