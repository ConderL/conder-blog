import { defineEventHandler, proxyRequest } from 'h3';
import { parseURL } from 'ufo';
import { useRuntimeConfig } from '#imports';

export default defineEventHandler(async (event) => {
  // 获取配置
  const config = useRuntimeConfig();
  
  // 解析URL
  const url = parseURL(event.node.req.url || '');
  
  // 只处理API请求
  if (!url.pathname || !url.pathname.startsWith('/api/')) {
    return;
  }

  // 转发请求到后端API
  return proxyRequest(event, config.public.apiBase, {
    fetch,
    headers: {
      // 传递原始请求的cookie
      cookie: event.node.req.headers.cookie || ''
    }
  });
});