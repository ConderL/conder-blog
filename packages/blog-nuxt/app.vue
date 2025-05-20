<template>
  <div>
    <!-- NuxtLayout包裹所有页面，自动使用layouts/default.vue作为默认布局 -->
    <NuxtLayout>
      <!-- NuxtPage渲染当前路由匹配的页面 -->
      <NuxtPage />
      
      <!-- 全局组件 -->
      <ClientOnly>
        <Provider />
      </ClientOnly>
    </NuxtLayout>
  </div>
</template>

<script>
// 引入Provider组件
import Provider from '~/components/Provider/index.vue';

// 直接在<script>标签中使用，不使用setup
// 这样可以避免TS问题
export default {
  components: {
    Provider
  },
  setup() {
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
  }
}
</script>

<style>
*,
:after,
:before {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

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

button,
input,
select,
textarea {
  background-color: transparent;
  border-style: none;
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

/* 全局页面过渡效果 */
.page-slide-enter-active,
.page-slide-leave-active {
  transition: all 0.35s cubic-bezier(0.33, 1, 0.68, 1);
}

.page-slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.page-slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* 布局过渡效果 */
.layout-fade-enter-active,
.layout-fade-leave-active {
  transition: opacity 0.35s cubic-bezier(0.33, 1, 0.68, 1);
}

.layout-fade-enter-from,
.layout-fade-leave-to {
  opacity: 0;
}
</style> 