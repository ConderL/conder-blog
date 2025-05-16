<template>
  <div class="tag-page">
    <div class="container">
      <div class="page-header">
        <h1 class="page-title">文章标签</h1>
        <p class="page-description">共有 {{ tags.length }} 个标签</p>
      </div>
      
      <div class="tag-cloud">
        <NuxtLink 
          v-for="tag in tags" 
          :key="tag.id" 
          :to="`/tag/${tag.id}`" 
          class="tag-item"
          :style="{
            fontSize: `${1 + (tag.count / maxCount) * 1}rem`,
            backgroundColor: tag.color
          }"
        >
          {{ tag.name }}
          <span class="tag-count">{{ tag.count }}</span>
        </NuxtLink>
      </div>
      
      <div class="tag-list">
        <h2 class="section-title">所有标签</h2>
        <div class="tag-grid">
          <div v-for="tag in sortedTags" :key="tag.id" class="tag-card">
            <NuxtLink :to="`/tag/${tag.id}`" class="tag-card-link">
              <div class="tag-card-header" :style="{ backgroundColor: tag.color }">
                <h3 class="tag-name">{{ tag.name }}</h3>
                <span class="tag-count-badge">{{ tag.count }} 篇文章</span>
              </div>
              <div class="tag-card-body">
                <p class="tag-description">{{ tag.description }}</p>
              </div>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

// 模拟标签数据
const tags = ref([
  {
    id: 1,
    name: 'JavaScript',
    count: 35,
    color: '#f7df1e',
    description: 'JavaScript是一种脚本编程语言，用于创建动态网页内容。'
  },
  {
    id: 2,
    name: 'Vue',
    count: 28,
    color: '#42b883',
    description: 'Vue.js是一个用于构建用户界面的渐进式框架。'
  },
  {
    id: 3,
    name: 'React',
    count: 22,
    color: '#61dafb',
    description: 'React是一个用于构建用户界面的JavaScript库。'
  },
  {
    id: 4,
    name: 'TypeScript',
    count: 20,
    color: '#3178c6',
    description: 'TypeScript是JavaScript的超集，添加了类型系统。'
  },
  {
    id: 5,
    name: 'Node.js',
    count: 18,
    color: '#68a063',
    description: 'Node.js是一个基于Chrome V8引擎的JavaScript运行环境。'
  },
  {
    id: 6,
    name: 'CSS',
    count: 25,
    color: '#264de4',
    description: 'CSS是一种用来为结构化文档添加样式的计算机语言。'
  },
  {
    id: 7,
    name: 'HTML',
    count: 20,
    color: '#e34c26',
    description: 'HTML是一种用于创建网页的标准标记语言。'
  },
  {
    id: 8,
    name: 'Nuxt',
    count: 15,
    color: '#00dc82',
    description: 'Nuxt.js是一个基于Vue.js的服务端渲染应用框架。'
  },
  {
    id: 9,
    name: 'Webpack',
    count: 12,
    color: '#8dd6f9',
    description: 'Webpack是一个现代JavaScript应用程序的静态模块打包器。'
  },
  {
    id: 10,
    name: 'Git',
    count: 10,
    color: '#f14e32',
    description: 'Git是一个分布式版本控制系统。'
  },
  {
    id: 11,
    name: 'MongoDB',
    count: 8,
    color: '#4db33d',
    description: 'MongoDB是一个基于分布式文件存储的数据库。'
  },
  {
    id: 12,
    name: 'MySQL',
    count: 7,
    color: '#00758f',
    description: 'MySQL是一个关系型数据库管理系统。'
  },
  {
    id: 13,
    name: 'Docker',
    count: 6,
    color: '#0db7ed',
    description: 'Docker是一个开源的应用容器引擎。'
  },
  {
    id: 14,
    name: 'GraphQL',
    count: 5,
    color: '#e10098',
    description: 'GraphQL是一个用于API的查询语言。'
  },
  {
    id: 15,
    name: 'AWS',
    count: 4,
    color: '#ff9900',
    description: 'AWS是亚马逊提供的云计算服务平台。'
  }
]);

// 计算标签中最大的文章数量
const maxCount = computed(() => {
  return Math.max(...tags.value.map(tag => tag.count));
});

// 按文章数量排序的标签
const sortedTags = computed(() => {
  return [...tags.value].sort((a, b) => b.count - a.count);
});

// SEO优化
useHead({
  title: '文章标签 - 博客网站',
  meta: [
    { name: 'description', content: '博客文章标签页面，浏览所有文章标签' },
    { name: 'keywords', content: '标签,博客,文章,JavaScript,Vue,React' }
  ]
});
</script>

<style scoped>
.tag-page {
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

.tag-cloud {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 3rem;
}

.tag-item {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  color: #fff;
  text-decoration: none;
  font-weight: 500;
  transition: transform 0.3s;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.tag-item:hover {
  transform: scale(1.05);
}

.tag-count {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  padding: 0.1rem 0.5rem;
  margin-left: 0.5rem;
  font-size: 0.8em;
}

.section-title {
  font-size: 1.8rem;
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

.tag-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.tag-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
}

.tag-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
}

.tag-card-link {
  display: block;
  text-decoration: none;
  color: inherit;
  height: 100%;
}

.tag-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  color: #fff;
}

.tag-name {
  font-size: 1.2rem;
  margin: 0;
}

.tag-count-badge {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 0.2rem 0.8rem;
  font-size: 0.8rem;
}

.tag-card-body {
  padding: 1rem;
}

.tag-description {
  color: #666;
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.5;
}

@media (max-width: 600px) {
  .tag-grid {
    grid-template-columns: 1fr;
  }
  
  .tag-cloud {
    padding: 1.5rem 1rem;
  }
}
</style> 