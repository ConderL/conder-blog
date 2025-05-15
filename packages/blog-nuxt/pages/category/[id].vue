<template>
  <div class="category-detail-page">
    <div class="container">
      <div class="page-header" :style="{ backgroundColor: category.color }">
        <div class="page-header-content">
          <div class="category-icon">{{ category.icon }}</div>
          <h1 class="page-title">{{ category.name }}</h1>
          <p class="page-description">共有 {{ category.count }} 篇文章</p>
        </div>
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
// 移除手动导入，Nuxt会自动导入这些函数
// import { useRoute } from 'vue-router';
// import { useHead } from '#imports';

// @ts-ignore - Nuxt自动导入
const route = useRoute();
const categoryId = route.params.id as string;

// 模拟分类数据
const category = ref({
  id: categoryId,
  name: '前端技术',
  count: 25,
  icon: '🌐',
  color: '#4caf50'
});

// 根据分类ID，可以根据实际情况调整分类信息
if (categoryId === '2') {
  category.value = {
    id: categoryId,
    name: '后端开发',
    count: 18,
    icon: '⚙️',
    color: '#2196f3'
  };
} else if (categoryId === '3') {
  category.value = {
    id: categoryId,
    name: '全栈开发',
    count: 12,
    icon: '🔄',
    color: '#9c27b0'
  };
}

// 模拟该分类下的文章数据
const articles = ref([
  {
    id: '1',
    title: 'Nuxt.js 3.0 新特性介绍',
    summary: '详细介绍Nuxt.js 3.0版本带来的新特性和改进，以及如何利用这些特性提升开发效率...',
    cover: 'https://picsum.photos/id/1/400/300',
    publishTime: '2023-01-01',
    views: 1520
  },
  {
    id: '2',
    title: '使用Nuxt.js实现服务端渲染提高SEO效果',
    summary: '探讨如何利用Nuxt.js的服务端渲染功能，有效提升网站的SEO表现，获得更好的搜索引擎排名...',
    cover: 'https://picsum.photos/id/2/400/300',
    publishTime: '2023-01-02',
    views: 980
  },
  {
    id: '3',
    title: 'Vue 3 Composition API最佳实践',
    summary: '深入探讨Vue 3 Composition API的使用技巧和最佳实践，通过实例讲解如何组织和优化代码...',
    cover: 'https://picsum.photos/id/3/400/300',
    publishTime: '2023-01-03',
    views: 2100
  },
  {
    id: '4',
    title: 'Nest.js与Nuxt.js全栈开发实战',
    summary: '结合Nest.js与Nuxt.js进行全栈开发，打造高性能、易维护的Web应用...',
    cover: 'https://picsum.photos/id/4/400/300',
    publishTime: '2023-01-04',
    views: 1340
  },
  {
    id: '5',
    title: '前端性能优化指南',
    summary: '详细介绍前端性能优化的各种技巧，从加载速度到渲染性能，全方位提升用户体验...',
    cover: 'https://picsum.photos/id/5/400/300',
    publishTime: '2023-01-05',
    views: 1760
  }
]);

// SEO优化
// @ts-ignore - Nuxt自动导入
useHead({
  title: `${category.value.name} - 博客分类`,
  meta: [
    { name: 'description', content: `查看${category.value.name}分类下的所有文章，共${category.value.count}篇` },
    { name: 'keywords', content: `${category.value.name},博客,分类,文章` }
  ]
});
</script>

<style scoped>
.category-detail-page {
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
  margin-bottom: 2rem;
  color: #fff;
  text-align: center;
  border-radius: 0 0 8px 8px;
}

.page-header-content {
  max-width: 800px;
  margin: 0 auto;
}

.category-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
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

@media (max-width: 768px) {
  .article-link {
    flex-direction: column;
  }
  
  .article-cover {
    flex: auto;
    height: 200px;
  }
}
</style> 