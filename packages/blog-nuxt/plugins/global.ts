import { defineNuxtPlugin } from '#app';

// 定义全局变量类型
declare global {
  interface Window {
    $message: {
      success: (content: string) => void;
      warning: (content: string) => void;
      error: (content: string) => void;
      info: (content: string) => void;
    };
    $notification: {
      success: (options: any) => void;
      warning: (options: any) => void;
      error: (options: any) => void;
      info: (options: any) => void;
    };
  }
}

export default defineNuxtPlugin((nuxtApp) => {
  if (process.client) {
    // 全局消息提示
    window.$message = {
      success: (content: string) => {
        nuxtApp.$toast.add({ 
          title: content, 
          color: 'green'
        });
      },
      warning: (content: string) => {
        nuxtApp.$toast.add({ 
          title: content, 
          color: 'yellow'
        });
      },
      error: (content: string) => {
        nuxtApp.$toast.add({ 
          title: content, 
          color: 'red'
        });
      },
      info: (content: string) => {
        nuxtApp.$toast.add({ 
          title: content, 
          color: 'blue'
        });
      }
    };

    // 全局通知
    window.$notification = {
      success: (options: any) => {
        nuxtApp.$toast.add({ 
          title: options.title || '成功', 
          description: options.content, 
          color: 'green',
          timeout: options.duration || 4500
        });
      },
      warning: (options: any) => {
        nuxtApp.$toast.add({ 
          title: options.title || '警告', 
          description: options.content, 
          color: 'yellow',
          timeout: options.duration || 4500
        });
      },
      error: (options: any) => {
        nuxtApp.$toast.add({ 
          title: options.title || '错误', 
          description: options.content, 
          color: 'red',
          timeout: options.duration || 4500
        });
      },
      info: (options: any) => {
        nuxtApp.$toast.add({ 
          title: options.title || '信息', 
          description: options.content, 
          color: 'blue',
          timeout: options.duration || 4500
        });
      }
    };
  }
}); 