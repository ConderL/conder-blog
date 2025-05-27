<template>
  <div>
    <div class="page-header">
      <img
        class="page-cover"
        :src="blog.blogInfo.siteConfig?.aboutWallpaper"
        alt="404 背景图"
      />
      <Waves></Waves>
    </div>
    <div class="bg">
      <div class="page-container">
        <NotFoundContent></NotFoundContent>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBlogStore } from "~/stores";

// 定义页面元数据
definePageMeta({
  title: '404 - 页面不存在'
});

const blog = useBlogStore();

// SEO优化
useHead({
  title: '404 - 页面不存在 - ' + (blog.blogInfo.siteConfig?.siteName || '博客'),
  meta: [
    { 
      name: 'description', 
      content: '页面不存在，请检查您输入的网址是否正确。' 
    },
    { 
      name: 'robots',
      content: 'noindex, nofollow'
    }
  ]
});
</script>

<style scoped lang="scss">
.page-header {
  position: relative;
  padding: 3rem 0;
  color: #fff;
  text-align: center;
  background-color: var(--primary-color);
  
  .page-cover {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    z-index: 0;
  }
}

.bg {
  background-color: var(--background-color);
  padding: 2rem 0;
}

.page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  background-color: var(--card-bg);
  border-radius: 0.5rem;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.05);
}

@media (max-width: 768px) {
  .page-container {
    padding: 1.5rem;
  }
}
</style> 