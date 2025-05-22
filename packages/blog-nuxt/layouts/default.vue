<template>
  <div class="app-wrapper">
    <!-- 注入全局Provider -->
    <Provider />
    
    <!-- 头部导航 -->
    <Header />
    
    <!-- 主要内容 -->
    <main class="main-wrapper">
      <slot />
    </main>
    
    <!-- 页脚 -->
    <Footer />
    
    <!-- 抽屉菜单 -->
    <ClientOnly>
      <Drawer />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';

// 获取store
const app = useAppStore();
const blog = useBlogStore();

// 在客户端侧加载主题
onMounted(() => {
  // 设置主题
  if (typeof window !== 'undefined') {
    document.documentElement.setAttribute('theme', app.theme);
  }
});
</script>

<style lang="scss" scoped>
.app-wrapper {
  position: relative;
  min-height: 100vh;
}

.main-wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 0 0 8rem;
}
</style> 