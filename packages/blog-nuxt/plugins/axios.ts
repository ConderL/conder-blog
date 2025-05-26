import { defineNuxtPlugin } from '#app';
import { setupAxios } from '~/utils/request';

export default defineNuxtPlugin(() => {
  // 获取运行时配置
  const config = useRuntimeConfig();
  
  // 设置API基础URL
  const baseUrl = config.public.serviceBaseUrl || 'http://localhost:3000';
  
  // 初始化axios配置
  setupAxios(baseUrl);
}); 