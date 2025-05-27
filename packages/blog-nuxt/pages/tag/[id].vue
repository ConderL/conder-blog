<template>
  <div class="tag-detail">
    <!-- 页面头部 -->
    <ClientOnly>
      <div class="page-header">
        <h1 class="page-title">标签</h1>
        <img
          class="page-cover"
          :src="blog.blogInfo.siteConfig?.tagWallpaper"
          alt="标签封面"
        />
        <Waves></Waves>
      </div>
    </ClientOnly>
    
    <div class="bg">
      <div class="page-container">
        <!-- 文章列表 -->
        <div class="article-grid">
          <div
            v-for="article in articleList"
            :key="article.id"
            class="article-item"
          >
            <div class="article-cover">
              <NuxtLink :to="`/article/${article.id}`">
                <img class="cover" :src="article.articleCover" :alt="article.articleTitle" />
              </NuxtLink>
            </div>
            
            <div class="article-info">
              <h3 class="article-title">
                <NuxtLink :to="`/article/${article.id}`">{{ article.articleTitle }}</NuxtLink>
              </h3>
              
              <div class="article-meta">
                <span>
                  <UIcon name="icon:calendar" class="meta-icon" />
                  {{ formatDate(article.createTime) }}
                </span>
                <NuxtLink :to="`/category/${article.category?.id}`" class="category-link">
                  <UIcon name="icon:qizhi" class="meta-icon" />
                  {{ article.category?.categoryName }}
                </NuxtLink>
              </div>
              
              <div class="tag-info">
                <NuxtLink
                  v-for="tag in article.tagVOList"
                  :key="tag.id"
                  :to="`/tag/${tag.id}`"
                  class="article-tag"
                >
                  <UIcon name="icon:tag" class="tag-icon" />
                  {{ tag.tagName }}
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 暂无文章提示 -->
        <div v-if="!articleList || articleList.length === 0" class="no-articles">
          <p>该标签下暂无文章</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, unref, watch } from 'vue';
import { useBlogStore } from '~/stores';
import { formatDate } from '~/utils/date';

// 定义页面元数据
definePageMeta({
  title: '标签文章'
});

// 获取博客信息
const blog = useBlogStore();

// 获取路由参数
const route = useRoute();
const tagId = computed(() => Number(route.params.id));

// 查询参数
const queryParams = reactive({
  tagId: tagId.value,
  current: 1,
  size: 20
});

// 使用封装好的API
const { tag } = useApi();
const { data, refresh } = await tag.getTagArticleList(queryParams);

// 监听路由参数变化，更新查询参数和数据
watch(() => route.params.id, (newId) => {
  queryParams.tagId = Number(newId);
  refresh();
}, { immediate: false });

// 处理文章数据
const articleList = computed(() => unref(data.value)?.articleConditionVOList || []);
const tagName = computed(() => unref(data.value)?.name || '');

// SEO优化
useHead({
  title: computed(() => `${tagName.value || '标签'} - ${blog.blogInfo.siteConfig?.siteName || '博客'}`),
  meta: [
    {
      name: 'description',
      content: computed(() => `浏览${tagName.value || ''}标签下的所有文章，共${articleList.value.length}篇`)
    },
    {
      name: 'keywords',
      content: computed(() => `${tagName.value || '标签'},博客,文章,技术博客`)
    }
  ]
});
</script>

<style lang="scss" scoped>
.page-header {
  position: relative;
  padding: 3rem 0;
  color: #fff;
  text-align: center;
  background-color: var(--primary-color);
  
  .page-title {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
    color: var(--header-text-color);
    position: relative;
    z-index: 1;
  }
  
  .page-cover {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    z-index: 0;
  }
}

.bg {
  background-color: var(--background-color);
  padding: 2rem 0;
  min-height: 70vh;
}

.page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 3rem;
}

.article-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  width: 100%;
}

.article-item {
  transition: all 0.3s;
  margin-bottom: 1rem;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--card-bg);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }
}

.article-cover {
  width: 100%;
  height: 0;
  padding-bottom: 60%;
  position: relative;
  overflow: hidden;
  
  img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: all 0.5s;
  }
}

.article-item:hover .cover {
  transform: scale(1.1);
}

.article-info {
  padding: 1rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.article-title {
  font-size: 1.25rem;
  font-weight: 500;
  margin-bottom: 0.75rem;
  line-height: 1.4;
  
  a {
    color: var(--text-color);
    text-decoration: none;
    transition: color 0.3s;
    
    &:hover {
      color: var(--primary-color);
    }
  }
}

.article-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  font-size: 0.875rem;
  color: var(--grey-5);
  
  .meta-icon {
    width: 1rem;
    height: 1rem;
    margin-right: 0.25rem;
    vertical-align: -0.15em;
  }
  
  .category-link {
    color: var(--grey-5);
    text-decoration: none;
    transition: color 0.3s;
    
    &:hover {
      color: var(--primary-color);
    }
  }
}

.tag-info {
  margin-top: auto;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.article-tag {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  background-color: var(--grey-1);
  color: var(--grey-6);
  font-size: 0.75rem;
  text-decoration: none;
  transition: all 0.3s;
  
  &:hover {
    background-color: var(--primary-color);
    color: white;
  }
  
  .tag-icon {
    width: 0.75rem;
    height: 0.75rem;
    margin-right: 0.25rem;
  }
}

.no-articles {
  text-align: center;
  padding: 3rem 0;
  color: var(--grey-5);
  font-size: 1.1rem;
  background-color: var(--card-bg);
  border-radius: 8px;
  margin: 2rem 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

/* 响应式布局 */
@media (max-width: 1024px) {
  .article-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .page-title {
    font-size: 2rem !important;
  }
  
  .page-container {
    padding: 1.5rem;
  }
  
  .article-meta {
    flex-direction: column;
    align-items: flex-start;
    
    span {
      margin-bottom: 0.25rem;
    }
  }
}

@media (max-width: 640px) {
  .article-grid {
    grid-template-columns: 1fr;
  }
}
</style> 