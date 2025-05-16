import { defineEventHandler, proxyRequest, getRequestURL } from 'h3';
import { useRuntimeConfig } from '#imports';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const url = getRequestURL(event);
  
  // 只处理API请求
  if (!url.pathname.startsWith('/api/')) {
    return;
  }

  // 转发请求到后端API
  return proxyRequest(event, config.public.apiBase, {
    fetch: fetch,
    headers: {
      // 传递原始请求的cookie
      cookie: event.node.req.headers.cookie || ''
    }
  });
});