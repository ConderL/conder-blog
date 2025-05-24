<template>
  <div>
    <!-- 仅注入Provider，不渲染任何内容 -->
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
// 移除手动导入，使用Nuxt UI自动导入功能

// 在客户端挂载后注入全局方法
onMounted(() => {
  try {
    // 直接使用 Nuxt UI 的 composables，通过自动导入机制
    const toast = useToast();
    
    // 注意这里使用的是我们自定义的useConfirm
    const confirm = useConfirm();
    
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
      
      // 对话框，使用我们自定义的useConfirm
      window.$dialog = {
        info: (options) => confirm.info({
          title: options.title || '信息',
          message: options.content,
          confirmLabel: options.positiveText || '确定',
          onConfirm: options.onPositiveClick
        }),
        success: (options) => confirm.success({
          title: options.title || '成功',
          message: options.content,
          confirmLabel: options.positiveText || '确定',
          onConfirm: options.onPositiveClick
        }),
        warning: (options) => confirm.warning({
          title: options.title || '警告',
          message: options.content,
          confirmLabel: options.positiveText || '确定',
          onConfirm: options.onPositiveClick
        }),
        error: (options) => confirm.danger({
          title: options.title || '错误',
          message: options.content,
          confirmLabel: options.positiveText || '确定',
          onConfirm: options.onPositiveClick
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