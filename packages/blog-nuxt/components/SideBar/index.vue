<template>
  <aside class="sidebar-container">
    <!-- 个人信息卡片 -->
    <div class="sidebar-card profile-card">
      <div class="avatar-container">
        <img class="avatar" :src="blogStore.blogInfo.siteConfig.siteAvatar" alt="博主头像">
      </div>
      <h2 class="name">{{ blogStore.blogInfo.siteConfig.siteAuthor }}</h2>
      <p class="intro">{{ blogStore.blogInfo.siteConfig.siteIntro }}</p>
      
      <!-- 统计信息 -->
      <div class="stats">
        <div class="stat-item">
          <div class="stat-value">{{ blogStore.blogInfo.articleCount }}</div>
          <div class="stat-label">文章</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ blogStore.blogInfo.categoryCount }}</div>
          <div class="stat-label">分类</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ blogStore.blogInfo.tagCount }}</div>
          <div class="stat-label">标签</div>
        </div>
      </div>
    </div>
    
    <!-- 最新文章 -->
    <div class="sidebar-card">
      <h3 class="card-title">
        <UIcon name="icon:new" class="card-icon" /> 
        最新文章
      </h3>
      <div class="article-list">
        <NuxtLink 
          v-for="article in latestArticles" 
          :key="article.id" 
          :to="`/article/${article.id}`"
          class="article-item">
          <div class="article-title">{{ article.title }}</div>
          <div class="article-date">{{ formatDate(article.createTime) }}</div>
        </NuxtLink>
      </div>
    </div>
    
    <!-- 分类 -->
    <div class="sidebar-card">
      <h3 class="card-title">
        <UIcon name="icon:category" class="card-icon" />
        分类
      </h3>
      <div class="category-list">
        <NuxtLink 
          v-for="category in categories" 
          :key="category.id" 
          :to="`/category/${category.id}`"
          class="category-item">
          <span class="category-name">{{ category.categoryName }}</span>
          <span class="category-count">({{ category.articleCount }})</span>
        </NuxtLink>
      </div>
    </div>
    
    <!-- 标签云 -->
    <div class="sidebar-card">
      <h3 class="card-title">
        <UIcon name="icon:tag" class="card-icon" />
        标签云
      </h3>
      <div class="tag-cloud">
        <NuxtLink 
          v-for="tag in tags" 
          :key="tag.id" 
          :to="`/tag/${tag.id}`"
          class="tag-item"
          :style="{ backgroundColor: tag.color }">
          {{ tag.name }}
        </NuxtLink>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed, unref } from 'vue';
import { formatDate } from '~/utils/date';

// 使用博客信息store
const blogStore = useBlogStore();

// 获取API
const { category, article } = useApi();

// 最新文章数据
const latestArticles = ref([
  { id: '1', title: '使用Nuxt.js实现服务端渲染', createTime: '2023-10-20' },
  { id: '2', title: 'SEO优化指南：提高网站可见性', createTime: '2023-10-15' },
  { id: '3', title: 'Vue 3组合式API最佳实践', createTime: '2023-10-10' },
  { id: '4', title: '如何优化前端性能', createTime: '2023-10-05' },
  { id: '5', title: 'TypeScript高级类型技巧', createTime: '2023-10-01' },
]);

// 分类数据
const { data: categoryData } = await category.getCategoryList();
const categories = computed(() => {
  const data = unref(categoryData) || [];
  return data.map(item => ({
    id: item.id,
    categoryName: item.categoryName,
    articleCount: item.articleCount
  }));
});

// 标签数据
const tags = ref([
  { id: '1', name: 'Vue', color: '#41B883' },
  { id: '2', name: 'React', color: '#61DAFB' },
  { id: '3', name: 'Nuxt', color: '#00DC82' },
  { id: '4', name: 'TypeScript', color: '#3178C6' },
  { id: '5', name: 'JavaScript', color: '#F7DF1E' },
  { id: '6', name: 'Node.js', color: '#339933' },
  { id: '7', name: 'Docker', color: '#2496ED' },
  { id: '8', name: 'Python', color: '#3776AB' },
  { id: '9', name: 'Java', color: '#007396' },
  { id: '10', name: 'Go', color: '#00ADD8' },
]);

// 在未来迭代中可以添加获取最新文章和标签的API调用
// 目前保持这些数据为模拟数据，专注于分类数据的调整
</script>

<style lang="scss" scoped>
.sidebar-container {
  width: 100%;
  
  .sidebar-card {
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    background-color: var(--card-bg);
    border-radius: 0.5rem;
    box-shadow: 0 0.125rem 0.625rem rgba(0, 0, 0, 0.08);
    
    .card-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1.25rem;
      margin-top: 0;
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid var(--border-color);
    }
  }
  
  .profile-card {
    text-align: center;
    
    .avatar-container {
      margin-bottom: 1rem;
      
      .avatar {
        width: 5rem;
        height: 5rem;
        border-radius: 50%;
        object-fit: cover;
        border: 3px solid var(--primary-color);
      }
    }
    
    .name {
      font-size: 1.25rem;
      margin: 0.5rem 0;
    }
    
    .intro {
      color: var(--text-color-secondary);
      margin-bottom: 1rem;
      font-size: 0.9rem;
    }
    
    .stats {
      display: flex;
      justify-content: space-around;
      margin-top: 1rem;
      
      .stat-item {
        .stat-value {
          font-size: 1.25rem;
          font-weight: bold;
          color: var(--primary-color);
        }
        
        .stat-label {
          font-size: 0.9rem;
          color: var(--text-color-secondary);
        }
      }
    }
  }
  
  .article-list {
    .article-item {
      display: block;
      padding: 0.75rem 0;
      border-bottom: 1px dashed var(--border-color);
      
      &:last-child {
        border-bottom: none;
      }
      
      .article-title {
        font-size: 0.95rem;
        margin-bottom: 0.25rem;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        
        &:hover {
          color: var(--primary-color);
        }
      }
      
      .article-date {
        font-size: 0.8rem;
        color: var(--text-color-secondary);
      }
    }
  }
  
  .category-list {
    .category-item {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
      border-bottom: 1px dashed var(--border-color);
      
      &:last-child {
        border-bottom: none;
      }
      
      &:hover {
        color: var(--primary-color);
      }
      
      .category-count {
        color: var(--text-color-secondary);
        font-size: 0.9rem;
      }
    }
  }
  
  .tag-cloud {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    
    .tag-item {
      padding: 0.25rem 0.75rem;
      border-radius: 1rem;
      font-size: 0.85rem;
      color: white;
      
      &:hover {
        opacity: 0.9;
        transform: scale(1.05);
      }
    }
  }
}

@media (max-width: 768px) {
  .sidebar-container {
    .tag-cloud {
      justify-content: center;
    }
  }
}
</style> 