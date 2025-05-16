<template>
  <div class="archive-page">
    <div class="container">
      <div class="page-header">
        <h1 class="page-title">文章归档</h1>
        <p class="page-description">共有 {{ totalArticles }} 篇文章</p>
      </div>
      
      <div class="archive-timeline">
        <div v-for="year in archiveData" :key="year.year" class="archive-year">
          <div class="year-header">
            <h2 class="year-title">{{ year.year }}</h2>
            <span class="year-count">{{ year.count }} 篇文章</span>
          </div>
          
          <div class="year-content">
            <div v-for="month in year.months" :key="`${year.year}-${month.month}`" class="month-section">
              <h3 class="month-title">{{ month.month }} 月</h3>
              
              <div class="article-list">
                <div v-for="article in month.articles" :key="article.id" class="archive-article">
                  <div class="article-date">{{ formatDate(article.publishTime) }}</div>
                  <NuxtLink :to="`/article/${article.id}`" class="article-title">
                    {{ article.title }}
                  </NuxtLink>
                  <div class="article-meta">
                    <span class="article-category">{{ article.category }}</span>
                    <span class="article-views">{{ article.views }} 阅读</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

// 格式化日期函数
const formatDate = (date: string) => {
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, '0');
  return `${day}日`;
};

// 模拟归档数据
const archiveData = ref([
  {
    year: 2023,
    count: 8,
    months: [
      {
        month: 12,
        articles: [
          {
            id: '1',
            title: 'Nuxt.js 3.0 新特性介绍',
            publishTime: '2023-12-20',
            category: '前端技术',
            views: 1520
          },
          {
            id: '2',
            title: '使用Nuxt.js实现服务端渲染提高SEO效果',
            publishTime: '2023-12-15',
            category: '前端技术',
            views: 980
          }
        ]
      },
      {
        month: 11,
        articles: [
          {
            id: '3',
            title: 'Vue 3 Composition API最佳实践',
            publishTime: '2023-11-25',
            category: '前端技术',
            views: 2100
          },
          {
            id: '4',
            title: 'Nest.js与Nuxt.js全栈开发实战',
            publishTime: '2023-11-10',
            category: '全栈开发',
            views: 1340
          }
        ]
      },
      {
        month: 10,
        articles: [
          {
            id: '5',
            title: '前端性能优化指南',
            publishTime: '2023-10-28',
            category: '前端技术',
            views: 1760
          },
          {
            id: '6',
            title: 'TypeScript高级类型实战',
            publishTime: '2023-10-15',
            category: '前端技术',
            views: 1850
          }
        ]
      }
    ]
  },
  {
    year: 2022,
    count: 4,
    months: [
      {
        month: 12,
        articles: [
          {
            id: '7',
            title: 'Vue.js 3.0与React对比分析',
            publishTime: '2022-12-20',
            category: '前端技术',
            views: 2340
          }
        ]
      },
      {
        month: 10,
        articles: [
          {
            id: '8',
            title: 'Web安全：常见的前端安全问题及解决方案',
            publishTime: '2022-10-15',
            category: '网络安全',
            views: 1920
          }
        ]
      },
      {
        month: 8,
        articles: [
          {
            id: '9',
            title: 'Node.js后端开发最佳实践',
            publishTime: '2022-08-12',
            category: '后端开发',
            views: 1680
          }
        ]
      },
      {
        month: 6,
        articles: [
          {
            id: '10',
            title: '深入理解JavaScript原型链',
            publishTime: '2022-06-22',
            category: '前端基础',
            views: 2150
          }
        ]
      }
    ]
  }
]);

// 计算总文章数
const totalArticles = computed(() => {
  return archiveData.value.reduce((total, year) => {
    return total + year.count;
  }, 0);
});

// SEO优化
useHead({
  title: '文章归档 - 博客网站',
  meta: [
    { name: 'description', content: '博客文章归档，按年月组织的所有文章列表' },
    { name: 'keywords', content: '归档,博客,文章,年份,月份' }
  ]
});
</script>

<style scoped>
.archive-page {
  background-color: #f8f9fa;
  padding: 2rem 0;
  min-height: 70vh;
}

.container {
  max-width: 1000px;
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

.archive-timeline {
  position: relative;
}

.archive-timeline:before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 1rem;
  width: 2px;
  background-color: #e0e0e0;
}

.archive-year {
  margin-bottom: 2.5rem;
  position: relative;
}

.year-header {
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-left: 2.5rem;
  position: relative;
}

.year-header:before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 2rem;
  height: 2rem;
  background-color: #0070f3;
  border-radius: 50%;
  z-index: 1;
}

.year-title {
  font-size: 1.8rem;
  margin-right: 1rem;
  color: #333;
}

.year-count {
  font-size: 1rem;
  color: #666;
}

.year-content {
  padding-left: 2.5rem;
}

.month-section {
  margin-bottom: 2rem;
  position: relative;
}

.month-section:before {
  content: '';
  position: absolute;
  left: -1.5rem;
  top: 0.6rem;
  width: 1rem;
  height: 1rem;
  background-color: #fff;
  border: 2px solid #0070f3;
  border-radius: 50%;
  z-index: 1;
}

.month-title {
  font-size: 1.4rem;
  margin-bottom: 1rem;
  color: #444;
}

.article-list {
  border-left: 1px solid #e0e0e0;
  padding-left: 2rem;
}

.archive-article {
  position: relative;
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px dashed #e0e0e0;
}

.archive-article:last-child {
  border-bottom: none;
}

.archive-article:before {
  content: '';
  position: absolute;
  left: -2rem;
  top: 0.5rem;
  width: 0.5rem;
  height: 0.5rem;
  background-color: #0070f3;
  border-radius: 50%;
}

.article-date {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.article-title {
  display: block;
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  text-decoration: none;
  margin-bottom: 0.5rem;
  transition: color 0.3s;
}

.article-title:hover {
  color: #0070f3;
}

.article-meta {
  display: flex;
  font-size: 0.85rem;
  color: #888;
}

.article-category {
  margin-right: 1rem;
}

@media (max-width: 768px) {
  .archive-timeline:before {
    left: 0.5rem;
  }
  
  .year-header {
    padding-left: 2rem;
  }
  
  .year-header:before {
    width: 1.5rem;
    height: 1.5rem;
  }
  
  .year-content {
    padding-left: 2rem;
  }
  
  .month-section:before {
    left: -1.25rem;
    width: 0.75rem;
    height: 0.75rem;
  }
  
  .article-list {
    padding-left: 1rem;
  }
  
  .archive-article:before {
    left: -1.25rem;
  }
}
</style> 