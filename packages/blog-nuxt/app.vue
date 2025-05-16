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
// Nuxt自动导入了useHead，不需要显式导入

// 设置网站元信息
useHead({
  titleTemplate: '%s - 博客系统',
  meta: [
    { name: 'author', content: '博主' },
    { name: 'robots', content: 'index, follow' }
  ]
});
</script>

<style>
*,
:after,
:before {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  cursor: url("/icons/normal.ico"), default;
  background: var(--grey-0);
  color: var(--text-color);
  font-family: Mulish, -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif;
  font-size: 1em;
  overflow-x: hidden;
  line-height: 2;
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
  transition: all 0.2s ease-in-out 0s;
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
</style> 