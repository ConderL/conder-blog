<template>
  <div>
    <div class="page-header">
      <h1 class="page-title">关于</h1>
      <img class="page-cover" :src="blog.blogInfo.siteConfig?.aboutWallpaper" alt="关于页面封面" />
      <Waves></Waves>
    </div>
    <div class="bg">
      <div class="page-container">
        <div class="avatar-box">
          <img class="author-avatar" :src="blog.blogInfo.siteConfig?.authorAvatar" alt="作者头像" />
        </div>
        <ClientOnly>
          <MdPreview editor-id="preview-only" :model-value="blog.blogInfo.siteConfig?.aboutMe" />
        </ClientOnly>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { MdPreview } from 'md-editor-v3';
import { useBlogStore } from '~/stores';

// 定义页面元数据
definePageMeta({
  title: '关于'
});

// 获取博客信息
const blog = useBlogStore();

// SEO优化
useHead({
  title: '关于 - ' + (blog.blogInfo.siteConfig?.siteName || '博客'),
  meta: [
    { 
      name: 'description', 
      content: '关于我和这个博客的介绍，了解博主的故事和博客的发展历程。' 
    },
    { 
      name: 'keywords', 
      content: '关于,博客,个人介绍,关于我' 
    }
  ]
});
</script>

<style lang="scss" scoped>
.page-header {
  position: relative;
  padding: 3rem 0;
  color: #fff;
  text-align: center;
  background-color: var(--primary-color);
  
  .page-title {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
    color: var(--header-text-color);
    position: relative;
    z-index: 1;
  }
  
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
  padding: 2rem 3rem;
  background-color: var(--card-bg);
  border-radius: 0.5rem;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.05);
}

.avatar-box {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
}

.author-avatar {
  width: 110px;
  height: 110px;
  border-radius: 50%;
  transition: all 0.5s;
  
  &:hover {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .page-title {
    font-size: 2rem !important;
  }
  
  .page-container {
    padding: 1.5rem;
  }
  
  .author-avatar {
    width: 90px;
    height: 90px;
  }
}
</style> 