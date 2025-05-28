<template>
  <UModal v-model:open="app.searchFlag" class="dialog-wrapper !w-[800px]" :ui="ui" close-icon="icon:close">
    <template #header>
      <span class="text-lg font-semibold text-blue-500">本地搜索</span>
    </template>
    
    <template #body>
      <!-- 输入框 -->
      <div class="search-input-wrapper">
        <label for="search" class="flex items-center">
          <UIcon name="icon:search" class="text-lg" />
        </label>
        <input id="search" v-model="keyword" placeholder="输入文章标题或内容..." class="w-full"/>
      </div>
      
      <!-- 搜索结果 -->
      <div class="search-result-wrapper">
        <div class="divider my-4"></div>
        <ul v-if="articleList.length">
          <li v-for="article in articleList" :key="article.id" class="search-result cursor-pointer" @click="goToArticle(article.id)">
            <!-- 文章标题 -->
            <div class="search-title">
              <span v-html="article.articleTitle"></span>
            </div>
            <!-- 文章内容 -->
            <p class="search-content" v-html="article.articleContent"></p>
          </li>
        </ul>
        <!-- 搜索结果不存在提示 -->
        <div v-else-if="keyword" class="text-pink-500 text-sm mt-4">
          找不到您查询的内容：{{ keyword }}
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { debouncedWatch } from "@vueuse/core";
import { useAppStore } from "~/stores";

// 定义文章搜索结果类型
interface ArticleSearch {
  id: number;
  articleTitle: string;
  articleContent: string;
}

const app = useAppStore();
const { article: articleApi } = useApi();
const router = useRouter();
const keyword = ref("");
const articleList = ref<ArticleSearch[]>([]);

// 使用防抖监听关键词变化
debouncedWatch(
  keyword,
  () => {
    if (keyword.value) {
      handleSearch();
    } else {
      articleList.value = [];
    }
  },
  { debounce: 300 },
);

// 搜索处理函数
const handleSearch = async () => {
  try {
    const { data } = await articleApi.searchArticle(keyword.value);
    articleList.value = data || [];
  } catch (error) {
    console.error('搜索失败:', error);
    articleList.value = [];
  }
};

// 跳转到文章详情页
const goToArticle = (id: number) => {
  dialogVisible.value = false;
  router.push(`/article/${id}`);
};

// 自定义UI
const ui = computed(() => ({
  wrapper: 'items-center',
  container: 'max-w-2xl',
  overlay: 'bg-gray-900/60 backdrop-blur-sm',
  dialog: {
    container: 'bg-white dark:bg-gray-900 rounded-lg shadow-xl'
  }
}));
</script>

<style scoped>
.search-input-wrapper {
  display: flex;
  align-items: center;
  padding: 5px 10px;
  height: 40px;
  width: 100%;
  border: 2px solid #8e8cd8;
  color: var(--color-gray-900);
  border-radius: 2rem;
}

.search-input-wrapper #search {
  font-size: 1rem;
  margin-left: 8px;
  color: inherit;
  background: transparent;
  outline: none;
}

.search-result-wrapper {
  padding: 0 3px;
  height: 300px;
  overflow: auto;
}

@media (max-width: 959px) {
  .search-result-wrapper {
    height: calc(100vh - 190px);
  }
}

.search-result {
  margin-top: 1rem;
  font-size: 1rem;
}

.search-title {
  font-weight: 700;
  border-bottom: 1px solid #999;
  text-decoration: none;
  display: block;
  margin-bottom: 0.5rem;
}

.search-content {
  border-bottom: 1px dashed #ccc;
  padding: 5px 0;
  line-height: 2;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.divider {
  border: 2px dashed var(--color-pink-300);
}

:deep(.dark) .search-input-wrapper {
  color: var(--color-gray-200);
}

:deep(.dark) .search-title,
:deep(.dark) .search-content {
  color: var(--color-gray-200);
}
</style> 