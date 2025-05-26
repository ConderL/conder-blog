<template>
  <!-- 全局对话框和通知组件容器 -->
  <div>
    <!-- 登录相关对话框管理器 -->
    <LoginManager />
  </div>
</template>

<script setup lang="ts">
// 定义组件名称
defineComponent('Provider');

// 页面初始化时加载用户信息
onMounted(async () => {
  const userStore = useUserStore();
  
  // 尝试从本地存储恢复用户会话
  userStore.loadToken();
  
  // 如果存在token，尝试获取用户信息
  if (userStore.token) {
    try {
      await userStore.fetchUserInfo();
    } catch (error) {
      console.error('加载用户信息失败', error);
    }
  }
});
</script> 