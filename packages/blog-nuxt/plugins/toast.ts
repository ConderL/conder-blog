/**
 * Toast通知插件 - 基于Nuxt UI的Toast组件
 */
import { defineNuxtPlugin } from '#app';

export default defineNuxtPlugin((nuxtApp) => {
  const toast = useToast();

  // 创建全局消息方法
  const message = {
    success: (content: string) => {
      toast.add({
        title: content,
        color: 'success',
        duration: 30000000,
        progress: true
      });
    },
    error: (content: string) => {
      toast.add({
        title: content,
        color: 'error',
        timeout: 5000,
        progress: true
      });
    },
    warning: (content: string) => {
      toast.add({
        title: content,
        color: 'warning',
        timeout: 4000,
        progress: true
      });
    },
    info: (content: string) => {
      toast.add({
        title: content,
        color: 'info',
        timeout: 3000,
        progress: true
      });
    }
  };

  // 设置默认配置
  toast.options = {
    position: 'top-right',
    timeout: 3000,
    progress: true
  };

  if (process.client) {
    window.$message = message;
  }

  // 添加到nuxtApp实例，使其可通过inject访问
  nuxtApp.provide('toast', toast);
  nuxtApp.provide('message', message);
}); 