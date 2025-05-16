<template>
  <div class="app-wrapper">
    <!-- 头部导航 -->
    <Header />
    
    <!-- 主要内容 -->
    <main class="main-wrapper">
      <slot />
    </main>
    
    <!-- 页脚 -->
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useAppStore, useBlogStore } from '../composables/useStores';
// 使用自动注册的组件，而不是直接导入
// Nuxt已经在nuxt.config.ts中配置了自动导入组件

// 获取store
const app = useAppStore();
const blog = useBlogStore();

// 在客户端侧加载主题
onMounted(() => {
  // 设置主题
  if (app.theme && typeof window !== 'undefined') {
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