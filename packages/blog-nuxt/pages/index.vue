<template>
  <div class="home-page">
    <div class="hero-section">
      <div class="container">
        <div class="hero-content">
          <h1 class="hero-title">全栈开发技术博客</h1>
          <p class="hero-subtitle">分享前端、后端及全栈开发的经验与心得</p>
        </div>
      </div>
    </div>
    
    <div class="container">
      <div class="main-content">
        <div class="article-list">
          <h2 class="section-title">最新文章</h2>
          
          <div class="articles-grid">
            <ArticleCard 
              v-for="article in articles" 
              :key="article.id" 
              :article="article"
            />
          </div>
          
          <div class="pagination">
            <button class="pagination-btn prev" :disabled="currentPage === 1">上一页</button>
            <span class="pagination-info">{{ currentPage }} / {{ totalPages }}</span>
            <button class="pagination-btn next" :disabled="currentPage === totalPages">下一页</button>
          </div>
        </div>
        
        <div class="sidebar">
          <div class="sidebar-widget about-widget">
            <h3 class="widget-title">关于博客</h3>
            <div class="widget-content">
              <p>欢迎来到我的技术博客，这里记录了我在全栈开发领域的学习和实践。</p>
              <NuxtLink to="/about" class="more-link">了解更多</NuxtLink>
            </div>
          </div>
          
          <div class="sidebar-widget category-widget">
            <h3 class="widget-title">文章分类</h3>
            <div class="widget-content">
              <ul class="category-list">
                <li v-for="category in categories" :key="category.id" class="category-item">
                  <NuxtLink :to="`/category/${category.id}`" class="category-link">
                    <span class="category-name">{{ category.name }}</span>
                    <span class="category-count">{{ category.count }}</span>
                  </NuxtLink>
                </li>
              </ul>
            </div>
          </div>
          
          <div class="sidebar-widget tag-widget">
            <h3 class="widget-title">热门标签</h3>
            <div class="widget-content">
              <div class="tag-cloud">
                <NuxtLink 
                  v-for="tag in tags" 
                  :key="tag.id" 
                  :to="`/tag/${tag.id}`" 
                  class="tag-item"
                  :style="{ fontSize: `${0.8 + (tag.count / 10) * 0.15}rem` }"
                >
                  {{ tag.name }}
                </NuxtLink>
              </div>
            </div>
          </div>
          
          <div class="sidebar-widget recent-widget">
            <h3 class="widget-title">热门文章</h3>
            <div class="widget-content">
              <ul class="recent-list">
                <li v-for="article in popularArticles" :key="article.id" class="recent-item">
                  <NuxtLink :to="`/article/${article.id}`" class="recent-link">
                    <span class="recent-title">{{ article.title }}</span>
                    <span class="recent-views">{{ article.views }} 阅读</span>
                  </NuxtLink>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// 模拟分页数据
const currentPage = ref(1);
const totalPages = ref(5);

// 模拟文章数据
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
  },
  {
    id: '5',
    title: '前端性能优化指南',
    summary: '详细介绍前端性能优化的各种技巧，从加载速度到渲染性能，全方位提升用户体验...',
    cover: 'https://picsum.photos/id/5/400/300',
    publishTime: '2023-01-05',
    category: '前端技术',
    views: 1760
  },
  {
    id: '6',
    title: 'TypeScript高级类型实战',
    summary: '深入探讨TypeScript的高级类型系统，通过实例展示如何利用类型系统提高代码质量和开发效率...',
    cover: 'https://picsum.photos/id/6/400/300',
    publishTime: '2023-01-06',
    category: '前端技术',
    views: 1290
  }
]);

// 模拟热门文章数据
const popularArticles = ref([
  {
    id: '3',
    title: 'Vue 3 Composition API最佳实践',
    views: 2100
  },
  {
    id: '10',
    title: '深入理解JavaScript原型链',
    views: 2150
  },
  {
    id: '7',
    title: 'Vue.js 3.0与React对比分析',
    views: 2340
  },
  {
    id: '8',
    title: 'Web安全：常见的前端安全问题及解决方案',
    views: 1920
  },
  {
    id: '5',
    title: '前端性能优化指南',
    views: 1760
  }
]);

// 模拟分类数据
const categories = ref([
  {
    id: 1,
    name: '前端技术',
    count: 25
  },
  {
    id: 2,
    name: '后端开发',
    count: 18
  },
  {
    id: 3,
    name: '全栈开发',
    count: 12
  },
  {
    id: 4,
    name: '前端基础',
    count: 15
  },
  {
    id: 5,
    name: '网络安全',
    count: 8
  }
]);

// 模拟标签数据
const tags = ref([
  {
    id: 1,
    name: 'JavaScript',
    count: 35
  },
  {
    id: 2,
    name: 'Vue',
    count: 28
  },
  {
    id: 3,
    name: 'React',
    count: 22
  },
  {
    id: 4,
    name: 'TypeScript',
    count: 20
  },
  {
    id: 5,
    name: 'Node.js',
    count: 18
  },
  {
    id: 6,
    name: 'CSS',
    count: 25
  },
  {
    id: 7,
    name: 'HTML',
    count: 20
  },
  {
    id: 8,
    name: 'Nuxt',
    count: 15
  },
  {
    id: 9,
    name: 'Webpack',
    count: 12
  }
]);

// SEO优化
// 使用Nuxt 3的头部元数据
// @ts-ignore - Nuxt自动导入
useHead({
  title: '博客首页 - 全栈技术博客',
  meta: [
    { name: 'description', content: '这是一个使用Nuxt.js实现的服务端渲染博客网站，提供各种技术文章和教程。' },
    { name: 'keywords', content: '博客,前端,后端,全栈,技术,教程,Vue,React,Node.js,JavaScript' }
  ]
});
</script>

<style scoped>
.home-page {
  min-height: 100vh;
}

.hero-section {
  background-color: #0070f3;
  color: #fff;
  padding: 4rem 0;
  margin-bottom: 2rem;
  text-align: center;
}

.hero-title {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.hero-subtitle {
  font-size: 1.2rem;
  opacity: 0.9;
}

.main-content {
  display: flex;
  gap: 2rem;
  margin-bottom: 3rem;
}

.article-list {
  flex: 3;
}

.sidebar {
  flex: 1;
}

.section-title {
  font-size: 1.75rem;
  margin-bottom: 1.5rem;
  color: #333;
  position: relative;
  padding-left: 1rem;
}

.section-title:before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.5rem;
  height: 1.5rem;
  width: 4px;
  background-color: #0070f3;
  border-radius: 2px;
}

.articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}

.pagination-btn {
  padding: 0.5rem 1rem;
  background-color: #0070f3;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.pagination-btn:hover:not(:disabled) {
  background-color: #0051af;
}

.pagination-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.pagination-info {
  color: #666;
}

.sidebar-widget {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.widget-title {
  font-size: 1.2rem;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #eee;
  position: relative;
}

.widget-title:before {
  content: '';
  position: absolute;
  left: 0;
  bottom: -1px;
  width: 50px;
  height: 2px;
  background-color: #0070f3;
}

.more-link {
  display: inline-block;
  margin-top: 0.5rem;
  color: #0070f3;
  font-weight: 500;
}

.category-list {
  list-style: none;
  padding: 0;
}

.category-item {
  margin-bottom: 0.5rem;
}

.category-link {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.3s;
  text-decoration: none;
  color: #333;
}

.category-link:hover {
  background-color: #f0f0f0;
}

.category-count {
  background-color: #f0f0f0;
  padding: 0.1rem 0.5rem;
  border-radius: 20px;
  font-size: 0.8rem;
  color: #666;
}

.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag-item {
  display: inline-block;
  padding: 0.3rem 0.8rem;
  background-color: #f0f0f0;
  border-radius: 20px;
  color: #333;
  text-decoration: none;
  transition: background-color 0.3s;
}

.tag-item:hover {
  background-color: #e0e0e0;
}

.recent-list {
  list-style: none;
  padding: 0;
}

.recent-item {
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.recent-item:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.recent-link {
  display: flex;
  flex-direction: column;
  text-decoration: none;
  color: #333;
}

.recent-title {
  margin-bottom: 0.25rem;
  transition: color 0.3s;
}

.recent-link:hover .recent-title {
  color: #0070f3;
}

.recent-views {
  font-size: 0.8rem;
  color: #888;
}

@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
  }
  
  .hero-title {
    font-size: 2rem;
  }
  
  .articles-grid {
    grid-template-columns: 1fr;
  }
}
</style> 