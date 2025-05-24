import { useToast } from '#imports';

export default defineNuxtPlugin(() => {
  const toast = useToast();

  // 将toast挂载到window对象上
  if (process.client) {
    window.$message = {
      success: (content: string) => toast.add({ title: content, color: 'green' }),
      warning: (content: string) => toast.add({ title: content, color: 'yellow' }),
      error: (content: string) => toast.add({ title: content, color: 'red' }),
      info: (content: string) => toast.add({ title: content, color: 'blue' })
    };
  }
});

// 为TypeScript添加全局类型
declare global {
  interface Window {
    $message?: {
      success: (content: string) => void;
      warning: (content: string) => void;
      error: (content: string) => void;
      info: (content: string) => void;
    };
  }
} 