import { defineNuxtPlugin } from 'nuxt/app';

// 全局错误处理
export default defineNuxtPlugin((nuxtApp) => {
  // 处理组件级错误
  nuxtApp.vueApp.config.errorHandler = (error, instance, info) => {
    console.error('Vue错误:', error);
    console.error('错误位置:', info);
  };

  // 处理未捕获的Promise错误
  if (import.meta.client) {
    window.addEventListener('unhandledrejection', (event) => {
      console.error('未捕获的Promise错误:', event.reason);
    });
  }

  // 注入错误处理方法
  return {
    provide: {
      handleError: (error: any) => {
        console.error('应用错误:', error);
      }
    }
  };
});
