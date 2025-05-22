<template>
  <div class="author-container">
    <!-- 作者头像 -->
    <img class="author-avatar" :src="blog.blogInfo.siteConfig.siteAvatar || blog.blogInfo.siteConfig.authorAvatar" />
    <!-- 作者名称 -->
    <p class="author-name">{{ blog.blogInfo.siteConfig.siteAuthor }}</p>
    <!-- 网站简介 -->
    <div class="site-desc">{{ blog.blogInfo.siteConfig.siteIntro }}</div>
  </div>
</template>

<script setup lang="ts">
import { defineComponent } from 'vue';
// 获取博客信息
const blog = useBlogStore();

// 添加默认导出
defineComponent({
  name: 'AuthorInfo'
});
</script>

<style lang="scss" scoped>
.author-avatar {
  display: block;
  max-width: 10rem;
  margin: 0 auto;
  padding: 0.125rem;
  box-shadow: 0 0 1rem 0.625rem var(--body-bg-shadow);
  border: 0.0625rem solid var(--body-bg-shadow);
  border-radius: 50%;
  animation: 1000ms ease-in-out 0ms 1 normal forwards running blur;

  &:hover {
    animation: 1000ms ease 0ms 1 normal none running author-shake;
  }
}

.author-name {
  margin-top: 0.5rem;
  font-weight: 400;
  text-align: center;
  color: var(--grey-7);
}

.site-desc {
  margin-top: 0.5rem;
  font-size: 1em;
  text-align: center;
  color: var(--grey-5);
}

@keyframes author-shake {
  0% { transform: scale(1); }
  10%, 20% { transform: scale(0.9) rotate(-3deg); }
  30%, 50%, 70%, 90% { transform: scale(1.1) rotate(3deg); }
  40%, 60%, 80% { transform: scale(1.1) rotate(-3deg); }
  100% { transform: scale(1); }
}
</style> 