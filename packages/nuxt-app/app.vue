<template>
  <!-- 使用UApp包裹整个应用，确保Nuxt UI组件正常工作 -->
  <UApp :ui="{ fontSourceSans: false }">
    <!-- 使用default指定默认布局 -->
    <NuxtLayout>
      <!-- NuxtPage渲染当前路由匹配的页面 -->
      <NuxtPage />
      
      <!-- 全局组件 -->
      <ClientOnly>
        <Provider v-if="false" />
      </ClientOnly>
    </NuxtLayout>
  </UApp>
</template>

<script setup>
// 设置默认的站点元数据，确保服务端和客户端渲染一致
useHead({
  title: "Conder's blog",
  titleTemplate: '%s - 技术与生活分享',
  meta: [
    { name: 'description', content: '一个基于Nuxt.js的服务端渲染博客系统' },
    { name: 'keywords', content: 'Nuxt,Vue,SSR,博客,Blog' },
    { name: 'author', content: '@ConderL' },
    { name: 'robots', content: 'index, follow' },
    { property: 'og:type', content: 'website' },
    { property: 'og:title', content: "Conder's blog - 技术与生活分享" },
    { property: 'og:description', content: '一个使用Nuxt.js构建的博客网站，提供优质的技术文章和生活分享' },
    { property: 'og:site_name', content: "Conder's blog" }
  ]
});
</script>

<style lang="scss">
html {
  scroll-behavior: smooth; /* 添加平滑滚动 */
}

body {
  cursor: url("/icons/normal.ico"), default;
  background: var(--grey-0);
  color: var(--text-color);
  font-family: Mulish, -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif;
  font-size: 1em;
  overflow-x: hidden;
  line-height: 2;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

a,
button,
img {
  cursor: url(/icons/link.ico), default !important;
  display: inline-block;
}

h1,
h2,
h3,
h4,
h5,
h6 {
  font-family: "NotoSerifSC", -apple-system, "Microsoft YaHei", sans-serif;
  font-weight: 700;
  line-height: 1.5;
  margin: 1.25rem 0 0.9375rem;
}


input,
textarea {
  cursor: url(/icons/text.ico), default !important;
}

li {
  list-style: none;
}

a {
  border: none;
  color: currentColor;
  outline: 0;
  text-decoration: none;
  overflow-wrap: break-word;
  word-wrap: break-word;
  transition: color 0.2s ease-in-out;
  cursor: url(/icons/link.ico), default !important;
}

.clearfix:after {
  visibility: hidden;
  clear: both;
  display: block;
  content: ".";
  height: 0;
}

.clearfix {
  zoom: 1;
}

/* 优化抽屉过渡效果 */
.transition-transform {
  transition-property: transform;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}

/* 优化性能 */
.ui-slideover-overlay {
  transition: opacity 200ms ease-in-out;
  backdrop-filter: blur(2px);
}

.slideover-container {
  backface-visibility: hidden;
  transform: translateZ(0);
  transition-timing-function: cubic-bezier(0.33, 1, 0.68, 1) !important;
  box-shadow: -5px 0 25px rgba(0, 0, 0, 0.15);
}

/* 淡入淡出过渡效果 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
