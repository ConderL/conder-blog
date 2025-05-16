<template>
  <div class="category-detail-page">
    <div class="container">
      <div class="page-header" :style="{ backgroundColor: getCategoryColor(category?.name) }">
        <div class="page-header-content">
          <div class="category-icon">{{ getCategoryIcon(category?.name) }}</div>
          <h1 class="page-title">{{ category?.name }}</h1>
          <p class="page-description">共有 {{ articles?.length || 0 }} 篇文章</p>
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
                <span class="article-date">{{ formatDate(article.createdAt) }}</span>
                <span class="article-views">{{ article.views }} 阅读</span>
              </div>
            </div>
          </NuxtLink>
        </div>
        
        <!-- 暂无文章时的提示 -->
        <div v-if="!articles || articles.length === 0" class="no-articles">
          <p>该分类下暂无文章</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

// 使用API工具
const nuxtApp = useNuxtApp();
// 添加类型断言
const { category: categoryApi } = (nuxtApp.$api as any);

// 获取路由参数
const route = useRoute();
const categoryId = route.params.id as string;

// 初始化数据
const category = ref<any>(null);
const articles = ref<any[]>([]);

// 根据分类名称获取颜色
const getCategoryColor = (categoryName?: string) => {
  if (!categoryName) return '#6c757d';
  
  // 常见分类颜色映射
  const colorMap: Record<string, string> = {
    '前端技术': '#4caf50',
    '后端开发': '#2196f3',
    '全栈开发': '#9c27b0',
    '移动开发': '#ff5722',
    '人工智能': '#3f51b5',
    '数据科学': '#009688',
    '云计算': '#00bcd4',
    '网络安全': '#f44336',
    '运维DevOps': '#795548',
    '数据库': '#607d8b',
    '区块链': '#ffb300',
    '服务器': '#0097a7',
    '算法': '#7e57c2',
    '设计模式': '#d81b60',
    '工具教程': '#546e7a'
  };
  
  return colorMap[categoryName] || '#6c757d';
};

// 根据分类获取图标
const getCategoryIcon = (categoryName?: string) => {
  if (!categoryName) return '📚';
  
  // 常见分类图标映射
  const iconMap: Record<string, string> = {
    '前端技术': '🌐',
    '后端开发': '⚙️',
    '全栈开发': '🔄',
    '移动开发': '📱',
    '人工智能': '🤖',
    '数据科学': '📊',
    '云计算': '☁️',
    '网络安全': '🔒',
    '运维DevOps': '🛠️',
    '数据库': '💾',
    '区块链': '⛓️',
    '服务器': '🖥️',
    '算法': '🧮',
    '设计模式': '🎨',
    '工具教程': '🔧'
  };
  
  return iconMap[categoryName] || '📚';
};

// 格式化日期
const formatDate = (dateString?: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// 获取分类详情
const fetchCategoryDetail = async () => {
  try {
    const data = await categoryApi.getDetail(categoryId);
    category.value = data;
  } catch (error) {
    console.error('获取分类详情失败:', error);
  }
};

// 获取分类下的文章
const fetchCategoryArticles = async () => {
  try {
    const data = await categoryApi.getArticles(categoryId, { limit: 10, page: 1 });
    articles.value = data?.items || [];
  } catch (error) {
    console.error('获取分类文章失败:', error);
  }
};

// 使用Nuxt的asyncData加载数据
const { data: categoryData } = await useAsyncData('category', () => Promise.all([
  fetchCategoryDetail(),
  fetchCategoryArticles()
]).then(() => ({ category: category.value, articles: articles.value })));

// 如果有预取数据，直接使用
if (categoryData.value) {
  category.value = categoryData.value.category;
  articles.value = categoryData.value.articles;
}

// SEO优化
useHead({
  title: () => category.value ? `${category.value.name} - 博客分类` : '分类 - 博客网站',
  meta: [
    {
      name: 'description',
      content: () => category.value ? `查看${category.value.name}分类下的所有文章` : '浏览博客分类'
    }
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

.no-articles {
  text-align: center;
  padding: 3rem 0;
  color: #666;
  font-size: 1.2rem;
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