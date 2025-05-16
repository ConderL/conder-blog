<template>
  <div class="tag-detail-page">
    <div class="container">
      <div class="page-header" :style="{ backgroundColor: getTagColor(tag?.name) }">
        <div class="page-header-content">
          <h1 class="page-title"># {{ tag?.name }}</h1>
          <p class="page-description">共有 {{ articles?.length || 0 }} 篇文章</p>
        </div>
      </div>
      
      <div class="tag-info">
        <div class="tag-description">{{ tag?.description || `这里展示所有与 ${tag?.name} 相关的文章` }}</div>
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
                <span class="article-category">{{ article.category?.name }}</span>
                <span class="article-date">{{ formatDate(article.createdAt) }}</span>
                <span class="article-views">{{ article.views }} 阅读</span>
              </div>
            </div>
          </NuxtLink>
        </div>
        
        <!-- 暂无文章时的提示 -->
        <div v-if="!articles || articles.length === 0" class="no-articles">
          <p>该标签下暂无文章</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

// 使用API工具
const nuxtApp = useNuxtApp();
const { tag: tagApi } = (nuxtApp.$api as any);

// 获取路由参数
const route = useRoute();
const tagId = route.params.id as string;

// 初始化数据
const tag = ref<any>(null);
const articles = ref<any[]>([]);

// 根据标签名称获取颜色
const getTagColor = (tagName?: string) => {
  if (!tagName) return '#6c757d';
  
  // 常见标签颜色映射
  const colorMap: Record<string, string> = {
    'JavaScript': '#f7df1e',
    'Vue': '#42b883',
    'React': '#61dafb',
    'Angular': '#dd0031',
    'TypeScript': '#3178c6',
    'Node.js': '#68a063',
    'HTML': '#e34c26',
    'CSS': '#264de4',
    'Python': '#3776ab',
    'Java': '#007396',
    'Go': '#00add8',
    'PHP': '#777bb4',
    'Ruby': '#cc342d',
    'C#': '#68217a',
    'Docker': '#2496ed',
    'Kubernetes': '#326ce5',
    'AWS': '#ff9900',
    'Azure': '#0089d6',
    'GCP': '#4285f4',
    'SEO': '#45aaf2'
  };
  
  return colorMap[tagName] || '#6c757d';
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

// 获取标签详情
const fetchTagDetail = async () => {
  try {
    const data = await tagApi.getDetail(tagId);
    tag.value = data;
  } catch (error) {
    console.error('获取标签详情失败:', error);
  }
};

// 获取标签下的文章
const fetchTagArticles = async () => {
  try {
    const data = await tagApi.getArticles(tagId, { limit: 10, page: 1 });
    articles.value = data?.items || [];
  } catch (error) {
    console.error('获取标签文章失败:', error);
  }
};

// 使用Nuxt的asyncData加载数据
const { data: tagData } = await useAsyncData('tag', () => Promise.all([
  fetchTagDetail(),
  fetchTagArticles()
]).then(() => ({ tag: tag.value, articles: articles.value })));

// 如果有预取数据，直接使用
if (tagData.value) {
  tag.value = tagData.value.tag;
  articles.value = tagData.value.articles;
}

// SEO优化
useHead({
  title: () => tag.value ? `#${tag.value.name} - 博客标签` : '标签 - 博客网站',
  meta: [
    {
      name: 'description',
      content: () => tag.value ? `查看${tag.value.name}标签下的所有文章` : '浏览博客标签'
    }
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
  
  .article-meta {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }
}
</style> 