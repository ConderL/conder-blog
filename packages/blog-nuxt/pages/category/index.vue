<template>
  <div class="category-page">
    <div class="container">
      <div class="page-header">
        <h1 class="page-title">文章分类</h1>
        <p class="page-description">共有 {{ categories.length }} 个分类</p>
      </div>
      
      <div class="category-list">
        <div v-for="category in categories" :key="category.id" class="category-card">
          <NuxtLink :to="`/category/${category.id}`" class="category-link">
            <div class="category-icon" :style="{ backgroundColor: category.color }">
              <span class="icon">{{ category.icon }}</span>
            </div>
            <div class="category-info">
              <h3 class="category-name">{{ category.name }}</h3>
              <div class="category-meta">
                <span class="category-count">{{ category.count }} 篇文章</span>
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

// 模拟分类数据
const categories = ref([
  {
    id: 1,
    name: '前端技术',
    count: 25,
    icon: '🌐',
    color: '#4caf50'
  },
  {
    id: 2,
    name: '后端开发',
    count: 18,
    icon: '⚙️',
    color: '#2196f3'
  },
  {
    id: 3,
    name: '全栈开发',
    count: 12,
    icon: '🔄',
    color: '#9c27b0'
  },
  {
    id: 4,
    name: '前端基础',
    count: 15,
    icon: '📚',
    color: '#ff9800'
  },
  {
    id: 5,
    name: '网络安全',
    count: 8,
    icon: '🔒',
    color: '#f44336'
  },
  {
    id: 6,
    name: '数据库',
    count: 10,
    icon: '💾',
    color: '#607d8b'
  },
  {
    id: 7,
    name: '设计模式',
    count: 7,
    icon: '📐',
    color: '#795548'
  },
  {
    id: 8,
    name: '算法',
    count: 9,
    icon: '🧮',
    color: '#009688'
  }
]);

// SEO优化
useHead({
  title: '文章分类 - 博客网站',
  meta: [
    { name: 'description', content: '博客文章分类页面，浏览所有文章分类' },
    { name: 'keywords', content: '分类,博客,文章,前端,后端,全栈' }
  ]
});
</script>

<style scoped>
.category-page {
  background-color: #f8f9fa;
  padding: 2rem 0;
  min-height: 70vh;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-title {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  color: #333;
}

.page-description {
  color: #666;
  font-size: 1.1rem;
}

.category-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.category-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
  overflow: hidden;
}

.category-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
}

.category-link {
  display: flex;
  text-decoration: none;
  color: inherit;
  padding: 1.5rem;
}

.category-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  margin-right: 1rem;
  color: #fff;
}

.icon {
  font-size: 1.5rem;
}

.category-info {
  flex: 1;
}

.category-name {
  font-size: 1.3rem;
  margin-bottom: 0.5rem;
  color: #333;
}

.category-meta {
  color: #666;
  font-size: 0.9rem;
}

@media (max-width: 600px) {
  .category-list {
    grid-template-columns: 1fr;
  }
}
</style> 