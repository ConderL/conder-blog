// 客户端插件：模拟naive-ui的全局API
// 通过定义类似的API保持与原有项目代码的兼容性

// 声明Window类型扩展
declare global {
  interface Window {
    $message?: {
      success: (content: string) => void;
      error: (content: string) => void;
      warning: (content: string) => void;
      info: (content: string) => void;
    };
    $dialog?: {
      success: (options: any) => void;
      warning: (options: any) => void;
      error: (options: any) => void;
      info: (options: any) => void;
    };
    $notification?: {
      success: (options: any) => void;
      error: (options: any) => void;
      warning: (options: any) => void;
      info: (options: any) => void;
    };
  }
}

export default defineNuxtPlugin(() => {
  if (process.client) {
    // 创建全局消息对象
    window.$message = {
      success: (content: string) => {
        // 使用Nuxt自动导入的useUI组合式API
        const { toast } = useUI();
        toast.add({ title: content, color: 'green' });
      },
      error: (content: string) => {
        const { toast } = useUI();
        toast.add({ title: content, color: 'red' });
      },
      warning: (content: string) => {
        const { toast } = useUI();
        toast.add({ title: content, color: 'yellow' });
      },
      info: (content: string) => {
        const { toast } = useUI();
        toast.add({ title: content, color: 'blue' });
      }
    };

    // 创建全局对话框对象
    window.$dialog = {
      success: (options: any) => {
        const { confirm } = useUI();
        if (options.content && options.positiveText) {
          confirm(options.content, {
            type: 'success',
            confirmLabel: options.positiveText,
            onConfirm: options.onPositiveClick
          });
        }
      },
      warning: (options: any) => {
        const { confirm } = useUI();
        if (options.content && options.positiveText) {
          confirm(options.content, {
            type: 'warning',
            confirmLabel: options.positiveText,
            onConfirm: options.onPositiveClick
          });
        }
      },
      error: (options: any) => {
        const { confirm } = useUI();
        if (options.content) {
          confirm(options.content, {
            type: 'danger',
            confirmLabel: '确定'
          });
        }
      },
      info: (options: any) => {
        const { confirm } = useUI();
        if (options.content) {
          confirm(options.content, {
            type: 'info',
            confirmLabel: '确定'
          });
        }
      }
    };

    // 创建全局通知对象
    window.$notification = {
      success: (options: any) => {
        const { toast } = useUI();
        toast.add({ 
          title: options.title || '成功', 
          description: options.content, 
          color: 'green',
          timeout: options.duration || 4500
        });
      },
      error: (options: any) => {
        const { toast } = useUI();
        toast.add({ 
          title: options.title || '错误', 
          description: options.content, 
          color: 'red',
          timeout: options.duration || 4500
        });
      },
      warning: (options: any) => {
        const { toast } = useUI();
        toast.add({ 
          title: options.title || '警告', 
          description: options.content, 
          color: 'yellow',
          timeout: options.duration || 4500
        });
      },
      info: (options: any) => {
        const { toast } = useUI();
        toast.add({ 
          title: options.title || '信息', 
          description: options.content, 
          color: 'blue',
          timeout: options.duration || 4500
        });
      }
    };
  }
}); 