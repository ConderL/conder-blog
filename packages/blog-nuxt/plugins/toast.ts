/**
 * Toast通知插件 - 基于Nuxt UI的Toast组件
 */
import { defineNuxtPlugin } from '#app';

export default defineNuxtPlugin((nuxtApp) => {
  const toast = useToast();

  // 为了兼容原项目，在全局提供message和notification方法
  const message = {
    success: (content: string) => toast.add({ title: content, color: 'green' }),
    warning: (content: string) => toast.add({ title: content, color: 'yellow' }),
    error: (content: string) => toast.add({ title: content, color: 'red' }),
    info: (content: string) => toast.add({ title: content, color: 'blue' })
  };

  // 提供类似原项目的notification方法
  const notification = {
    success: (options: any) => toast.add({ 
      title: options.title || '成功', 
      description: options.content, 
      color: 'green',
      timeout: options.duration || 4500
    }),
    warning: (options: any) => toast.add({ 
      title: options.title || '警告', 
      description: options.content, 
      color: 'yellow',
      timeout: options.duration || 4500
    }),
    error: (options: any) => toast.add({ 
      title: options.title || '错误', 
      description: options.content, 
      color: 'red',
      timeout: options.duration || 4500
    }),
    info: (options: any) => toast.add({ 
      title: options.title || '信息', 
      description: options.content, 
      color: 'blue',
      timeout: options.duration || 4500
    })
  };

  // 在客户端挂载到window上，保持与原项目兼容
  if (process.client) {
    window.$message = message;
    window.$notification = notification;
  }

  // 添加到nuxtApp实例，使其可通过inject访问
  nuxtApp.provide('toast', toast);
  nuxtApp.provide('message', message);
  nuxtApp.provide('notification', notification);
}); 