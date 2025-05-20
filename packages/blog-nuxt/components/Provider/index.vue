<template>
  <div>
    <!-- 仅注入Provider，不渲染任何内容 -->
  </div>
</template>

<script setup>
import { onMounted } from 'vue';

// 在客户端挂载后注入全局方法
onMounted(() => {
  try {
    // 获取 Nuxt UI 的全局方法
    const { toast, confirm } = useUI();
    
    // 在 window 对象上注册全局方法，保持与原项目一致的 API
    if (typeof window !== 'undefined') {
      // 消息提示
      window.$message = {
        success: (content) => toast.add({ title: content, color: 'green' }),
        warning: (content) => toast.add({ title: content, color: 'yellow' }),
        error: (content) => toast.add({ title: content, color: 'red' }),
        info: (content) => toast.add({ title: content, color: 'blue' })
      };
      
      // 通知
      window.$notification = {
        success: (options) => toast.add({ 
          title: options.title || '成功', 
          description: options.content, 
          color: 'green',
          timeout: options.duration || 4500
        }),
        warning: (options) => toast.add({ 
          title: options.title || '警告', 
          description: options.content, 
          color: 'yellow',
          timeout: options.duration || 4500
        }),
        error: (options) => toast.add({ 
          title: options.title || '错误', 
          description: options.content, 
          color: 'red',
          timeout: options.duration || 4500
        }),
        info: (options) => toast.add({ 
          title: options.title || '信息', 
          description: options.content, 
          color: 'blue',
          timeout: options.duration || 4500
        })
      };
      
      // 对话框
      window.$dialog = {
        info: (options) => confirm(options.content, { 
          ...options,
          type: 'info' 
        }),
        success: (options) => confirm(options.content, { 
          ...options,
          type: 'success' 
        }),
        warning: (options) => confirm(options.content, { 
          ...options,
          type: 'warning' 
        }),
        error: (options) => confirm(options.content, { 
          ...options,
          type: 'danger' 
        })
      };
    }
  } catch (error) {
    console.error('初始化全局方法失败：', error);
  }
});

// 默认导出
defineExpose({
  name: 'Provider'
});
</script>

<script>
export default {
  name: 'Provider'
}
</script> 