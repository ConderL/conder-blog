<template>
  <div class="tag-detail-page">
    <div class="container">
      <div class="page-header" :style="{ backgroundColor: tag.color }">
        <div class="page-header-content">
          <h1 class="page-title"># {{ tag.name }}</h1>
          <p class="page-description">共有 {{ tag.count }} 篇文章</p>
        </div>
      </div>
      
      <div class="tag-info">
        <div class="tag-description">{{ tag.description }}</div>
      </div>
      
      <div class="article-list">
        <div v-for="article in articles" :key="article.id" class="article-item">
          <NuxtLink :to="`/article/${article.id}`" class="article-link">
            <div class="article-cover">
              <img :src="article.cover" :alt="article.title">
            </div>
            <div class="article-info">
              <h2 class="article-title">{{ article.title }}</h2>
              <p class="article-summary">{{ article.summary }}</p>
              <div class="article-meta">
                <span class="article-category">{{ article.category }}</span>
                <span class="article-date">{{ article.publishTime }}</span>
                <span class="article-views">{{ article.views }} 阅读</span>
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// @ts-ignore - Nuxt自动导入
const route = useRoute();
const tagId = route.params.id as string;

// 模拟标签数据
const tag = ref({
  id: tagId,
  name: 'JavaScript',
  count: 35,
  color: '#f7df1e',
  description: 'JavaScript是一种脚本编程语言，用于创建动态网页内容。在这里您可以找到所有与JavaScript相关的文章，包括基础教程和高级技巧。'
});

// 根据标签ID，可以根据实际情况调整标签信息
if (tagId === '2') {
  tag.value = {
    id: tagId,
    name: 'Vue',
    count: 28,
    color: '#42b883',
    description: 'Vue.js是一个用于构建用户界面的渐进式框架。在这里您可以找到所有与Vue相关的文章，包括Vue 2和Vue 3的教程和示例。'
  };
} else if (tagId === '3') {
  tag.value = {
    id: tagId,
    name: 'React',
    count: 22,
    color: '#61dafb',
    description: 'React是一个用于构建用户界面的JavaScript库。在这里您可以找到所有与React相关的文章，包括入门教程和高级应用。'
  };
}

// 模拟该标签下的文章数据
const articles = ref([
  {
    id: '1',
    title: 'Nuxt.js 3.0 新特性介绍',
    summary: '详细介绍Nuxt.js 3.0版本带来的新特性和改进，以及如何利用这些特性提升开发效率...',
    cover: 'https://picsum.photos/id/1/400/300',
    publishTime: '2023-01-01',
    category: '前端技术',
    views: 1520
  },
  {
    id: '2',
    title: '使用Nuxt.js实现服务端渲染提高SEO效果',
    summary: '探讨如何利用Nuxt.js的服务端渲染功能，有效提升网站的SEO表现，获得更好的搜索引擎排名...',
    cover: 'https://picsum.photos/id/2/400/300',
    publishTime: '2023-01-02',
    category: '前端技术',
    views: 980
  },
  {
    id: '3',
    title: 'Vue 3 Composition API最佳实践',
    summary: '深入探讨Vue 3 Composition API的使用技巧和最佳实践，通过实例讲解如何组织和优化代码...',
    cover: 'https://picsum.photos/id/3/400/300',
    publishTime: '2023-01-03',
    category: '前端技术',
    views: 2100
  },
  {
    id: '4',
    title: 'Nest.js与Nuxt.js全栈开发实战',
    summary: '结合Nest.js与Nuxt.js进行全栈开发，打造高性能、易维护的Web应用...',
    cover: 'https://picsum.photos/id/4/400/300',
    publishTime: '2023-01-04',
    category: '全栈开发',
    views: 1340
  }
]);

// SEO优化
// @ts-ignore - Nuxt自动导入
useHead({
  title: `#${tag.value.name} - 博客标签`,
  meta: [
    { name: 'description', content: tag.value.description },
    { name: 'keywords', content: `${tag.value.name},博客,标签,文章` }
  ]
});
</script>

<style scoped>
.tag-detail-page {
  background-color: #f8f9fa;
  min-height: 100vh;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.page-header {
  padding: 3rem 0;
  margin-bottom: 1rem;
  color: #fff;
  text-align: center;
  border-radius: 0 0 8px 8px;
}

.page-header-content {
  max-width: 800px;
  margin: 0 auto;
}

.page-title {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.page-description {
  font-size: 1.1rem;
  opacity: 0.9;
}

.tag-info {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.tag-description {
  color: #666;
  line-height: 1.6;
  font-size: 1.1rem;
}

.article-list {
  padding: 1rem 0 3rem;
}

.article-item {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
}

.article-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
}

.article-link {
  display: flex;
  text-decoration: none;
  color: inherit;
}

.article-cover {
  flex: 0 0 250px;
}

.article-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.article-info {
  flex: 1;
  padding: 1.5rem;
}

.article-title {
  font-size: 1.4rem;
  margin-bottom: 0.8rem;
  color: #333;
}

.article-summary {
  color: #666;
  margin-bottom: 1rem;
  line-height: 1.6;
}

.article-meta {
  display: flex;
  justify-content: space-between;
  color: #888;
  font-size: 0.9rem;
}

.article-category {
  padding: 0.2rem 0.8rem;
  background-color: #f0f0f0;
  border-radius: 20px;
}

@media (max-width: 768px) {
  .article-link {
    flex-direction: column;
  }
  
  .article-cover {
    flex: auto;
    height: 200px;
  }
  
  .article-meta {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }
}
</style> 