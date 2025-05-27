<template>
    <div class="min-h-screen relative">
      <!-- 公共头部 -->
      <Header />

      <!-- 主体内容区 -->
      <main class="main-wrapper">
        <slot />
      </main>

      <!-- 公共页脚 -->
      <Footer />

      <!-- 抽屉菜单 -->
      <ClientOnly>
        <Drawer />
        <Tool />
        <ChatRoom />
      </ClientOnly>
    </div>
</template>

<script setup>
// 使用项目已有的组件
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useAppStore } from '~/stores/app';

// 获取全局store
const appStore = useAppStore();
const { app } = storeToRefs(appStore);

// 确保黑暗模式正常工作
const colorMode = useColorMode();

// 系统挂载后的初始化
onMounted(() => {
  // 应用主题
  if (process.client) {
    // 已有的主题设置
    if (app?.value.theme === 'dark') {
      document.documentElement.setAttribute('theme', 'dark');
      colorMode.preference = 'dark';
    } else {
      document.documentElement.setAttribute('theme', 'light');
      colorMode.preference = 'light';
    }
    
    // 监听颜色模式变化
    watch(() => colorMode.value, (newValue) => {
      useHead({
        htmlAttrs: {
          class: newValue === 'dark' ? 'dark' : ''
        }
      });
    });
  }
});
</script>

<style lang="scss">
.main-wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 0 0 8rem;
  min-height: calc(100vh - 160px); /* 减去头部和页脚高度 */
}
</style> 