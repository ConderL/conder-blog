<template>
  <div>
    <!-- NuxtLayout包裹所有页面，自动使用layouts/default.vue作为默认布局 -->
    <NuxtLayout>
      <!-- NuxtPage渲染当前路由匹配的页面 -->
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
// 全局SEO默认配置
// @ts-ignore - Nuxt自动导入
useHead({
  titleTemplate: '%s - 博客网站',
  meta: [
    { name: 'author', content: '博主' },
    { name: 'robots', content: 'index, follow' }
  ]
})
</script>

<style>
/* 全局样式可以在这里定义 */
html, body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  color: #333;
  background-color: #f8f9fa;
}

* {
  box-sizing: border-box;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}
</style> 