<template>
  <!-- 使用Nuxt UI的Modal组件 -->
  <UModal v-model:open="app.loginFlag" :ui="modalUI" close-icon="close">
    <template #body>
      <!-- 使用Dialog/Login组件 -->
      <Login 
        @close="app.setLoginFlag(false)"
        @register="handleRegister"
        @forget="handleForget"
      />
    </template>
  </UModal>
  
  <!-- 注册对话框 -->
  <UModal v-model:open="app.registerFlag" :ui="modalUI">
    
    <template #body>
      <!-- 使用Dialog/Register组件 -->
      <Register 
        @close="app.setRegisterFlag(false)"
        @login="switchToLogin"
      />
    </template>
  </UModal>
  
  <!-- 忘记密码对话框 -->
  <UModal v-model:open="app.forgetFlag" :ui="modalUI">
    <template #body>
      <!-- 使用Dialog/Forget组件 -->
      <Forget 
        @close="app.setForgetFlag(false)"
        @login="switchToLogin"
      />
    </template>
  </UModal>
</template>

<script setup lang="ts">
// 使用store
const app = useAppStore();

// 导入组件
import Login from '../Dialog/Login.vue';
import Register from '../Dialog/Register.vue';
import Forget from '../Dialog/Forget.vue';

// Modal UI 样式配置
const modalUI = {
  width: '446px',
  container: 'items-center justify-center',
  overlay: { background: 'bg-black/50 backdrop-blur-sm' },
  background: 'bg-white dark:bg-gray-900',
  padding: 'p-0',
  rounded: 'rounded-md',
  shadow: 'shadow-[0_6px_16px_-9px_rgba(0,0,0,0.08),0_9px_28px_0_rgba(0,0,0,0.05),0_12px_48px_16px_rgba(0,0,0,0.03)]',
  border: 'border border-[#e3e8f7] dark:border-gray-700'
};

// 切换到登录
const switchToLogin = () => {
  app.setRegisterFlag(false);
  app.setForgetFlag(false);
  app.setLoginFlag(true);
};

// 切换到注册
const handleRegister = () => {
  app.setLoginFlag(false);
  app.setForgetFlag(false);
  app.setRegisterFlag(true);
};

// 切换到忘记密码
const handleForget = () => {
  app.setLoginFlag(false);
  app.setRegisterFlag(false);
  app.setForgetFlag(true);
};

// 监听状态变化 - 用于调试
watch(() => app.loginFlag, (newVal) => {
  console.log('loginFlag changed:', newVal);
});

watch(() => app.registerFlag, (newVal) => {
  console.log('registerFlag changed:', newVal);
});

watch(() => app.forgetFlag, (newVal) => {
  console.log('forgetFlag changed:', newVal);
});
</script> 