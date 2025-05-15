<template>
  <div class="index-page">
    <!-- 头部 -->
    <Header />
    
    <div class="bg">
      <div class="main-container mt">
        <!-- 左侧内容区 -->
        <div class="left-container">
          <div class="card main-card">
            <h2 class="section-title">最新文章</h2>
            <div class="articles-list">
              <div v-if="articles.length === 0" class="no-articles">
                暂无文章，敬请期待！
              </div>
              <ArticleCard 
                v-for="article in articles" 
                :key="article.id" 
                :article="article" 
              />
            </div>
            
            <div class="pagination-container" v-if="articles.length > 0">
              <Pagination 
                :current="currentPage" 
                :total="totalPages" 
                @update:current="onPageChange" 
              />
            </div>
          </div>
        </div>
        
        <!-- 右侧侧边栏 -->
        <div class="right-container">
          <!-- 博主信息卡片 -->
          <div class="card sidebar-card profile-card">
            <h3 class="sidebar-title">博主信息</h3>
            <div class="profile-info">
              <img src="/images/avatar.jpg" alt="博主头像" class="avatar" />
              <div class="info">
                <h4>{{ blogStore.blogInfo.siteConfig.siteAuthor }}</h4>
                <p>{{ blogStore.blogInfo.siteConfig.siteIntro }}</p>
              </div>
            </div>
          </div>
          
          <!-- 博客统计卡片 -->
          <div class="card sidebar-card">
            <h3 class="sidebar-title">博客统计</h3>
            <ul class="stats-list">
              <li>
                <SvgIcon icon-class="article" size="1rem" />
                <span>文章数：{{ blogStore.blogInfo.articleCount }}</span>
              </li>
              <li>
                <SvgIcon icon-class="category" size="1rem" />
                <span>分类数：{{ blogStore.blogInfo.categoryCount }}</span>
              </li>
              <li>
                <SvgIcon icon-class="tag" size="1rem" />
                <span>标签数：{{ blogStore.blogInfo.tagCount }}</span>
              </li>
              <li>
                <SvgIcon icon-class="view" size="1rem" />
                <span>访问量：{{ blogStore.blogInfo.viewCount }}</span>
              </li>
            </ul>
          </div>
          
          <!-- 热门标签卡片 -->
          <div class="card sidebar-card">
            <h3 class="sidebar-title">热门标签</h3>
            <div class="tags-cloud">
              <span class="tag">Vue</span>
              <span class="tag">Nuxt</span>
              <span class="tag">SSR</span>
              <span class="tag">SEO</span>
              <span class="tag">前端开发</span>
              <span class="tag">JavaScript</span>
              <span class="tag">TypeScript</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 底部 -->
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useUserStore } from '../stores/user';
import { useBlogStore } from '../stores/blog';

// 页面标题设置
// @ts-ignore - Nuxt自动导入
useHead({
  title: '技术博客 - 分享前后端开发经验与心得',
  meta: [
    { name: 'description', content: '技术博客是一个分享前后端开发技术、经验和心得的平台，涵盖Vue、React、Node.js、Python等技术栈' },
    { name: 'keywords', content: '技术博客,前端开发,后端开发,Vue,React,Node.js,Python,服务端渲染,SEO' }
  ]
});

// 分页当前页
const currentPage = ref(1);
const totalPages = ref(1);

// 文章列表
const articles = ref([
  {
    id: 1,
    title: '从Vue迁移到Nuxt实现服务端渲染：构建SEO友好的博客系统',
    summary: '本文详细介绍了如何将现有的Vue.js项目迁移到Nuxt.js框架，实现服务端渲染以提升SEO效果。通过实战案例讲解组件迁移、状态管理和路由配置等关键步骤。',
    cover: '/images/article-1.jpg',
    categoryName: '前端开发',
    tagNames: ['Vue', 'Nuxt', 'SSR', 'SEO'],
    createTime: '2024-05-20',
    viewCount: 256
  },
  {
    id: 2,
    title: '网站SEO优化指南：从基础到进阶的完整实践',
    summary: '随着互联网的发展，搜索引擎优化(SEO)变得越来越重要。本文提供了一份全面的SEO优化指南，包括技术SEO、内容SEO和外部SEO三个方面的详细策略和实践方法。',
    cover: '/images/article-2.jpg',
    categoryName: '运营推广',
    tagNames: ['SEO', '网站优化', '搜索引擎'],
    createTime: '2024-05-15',
    viewCount: 312
  }
]);

// 使用store
const userStore = useUserStore();
const blogStore = useBlogStore();

// 客户端初始化
onMounted(() => {
  // 初始化用户token
  userStore.initToken();
  
  // 这里可以添加文章列表的API请求
  // fetchArticles();
});

// 页面变化处理
function onPageChange(page: number) {
  currentPage.value = page;
  // 这里可以添加文章列表的API请求
  // fetchArticles(page);
}
</script>

<style lang="scss" scoped>
.index-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.bg {
  background-color: var(--body-bg);
}

.main-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
}

.mt {
  margin-top: 5rem;
  padding-bottom: 2rem;
}

.left-container {
  flex: 7;
}

.right-container {
  flex: 3;
  
  @media (max-width: 768px) {
    margin-top: 1.5rem;
  }
}

.card {
  background-color: var(--card-bg);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.main-card {
  padding: 1.5rem;
}

.sidebar-card {
  padding: 1.2rem;
  margin-bottom: 1.5rem;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.section-title {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: var(--heading-color);
  border-bottom: 1px dashed var(--border-color);
  padding-bottom: 0.75rem;
}

.sidebar-title {
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: var(--heading-color);
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 0.5rem;
}

.profile-card {
  .profile-info {
    display: flex;
    align-items: center;
    
    .avatar {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      object-fit: cover;
      margin-right: 1rem;
    }
    
    .info {
      h4 {
        margin-bottom: 0.5rem;
        font-size: 1.1rem;
      }
      
      p {
        font-size: 0.9rem;
        color: var(--text-color);
        opacity: 0.8;
      }
    }
  }
}

.stats-list {
  list-style: none;
  
  li {
    display: flex;
    align-items: center;
    margin-bottom: 0.75rem;
    font-size: 0.95rem;
    color: var(--text-color);
    
    .svg-icon {
      margin-right: 0.5rem;
      color: var(--color-pink);
    }
    
    &:last-child {
      margin-bottom: 0;
    }
  }
}

.tags-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  
  .tag {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    font-size: 0.85rem;
    background-color: var(--grey-1);
    color: var(--text-color);
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
      background-color: var(--color-pink);
      color: white;
    }
  }
}

.pagination-container {
  margin-top: 2rem;
  display: flex;
  justify-content: center;
}

.no-articles {
  padding: 3rem;
  text-align: center;
  color: var(--text-color);
  opacity: 0.7;
}
</style> 