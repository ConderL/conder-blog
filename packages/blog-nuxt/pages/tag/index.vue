<template>
  <div class="tag-page">
    <!-- 页面头部 -->
    <ClientOnly>
      <div class="page-header">
        <h1 class="page-title">标签</h1>
        <img class="page-cover" :src="blog.blogInfo.siteConfig?.tagWallpaper" alt="标签封面">
        <Waves></Waves>
      </div>
    </ClientOnly>
    
    <div class="bg">
      <div class="page-container">
        <div class="tag-cloud">
          <NuxtLink 
            v-for="t in tagList" 
            :key="t.id" 
            :to="`/tag/${t.id}`"
            class="tag-item"
            :style="{ 'font-size': getSize(t.articleCount), 'color': getTagColor(t.tagName) }"
          >
            {{ t.tagName }}
            <sup>{{ t.articleCount }}</sup>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, unref } from 'vue';
import { useBlogStore } from '~/stores';

// 定义页面元数据
definePageMeta({
  title: '标签'
});

// 获取博客信息
const blog = useBlogStore();

// 使用封装好的API
const { tag } = useApi();
const { data } = await tag.getTagList();
const tagList = computed(() => unref(data) || []);

// 计算标签大小
const getSize = (freq: number) => {
  return ((1 + 6 * freq / 10) / 3) * 2 + "rem";
};

// 使用确定性的颜色函数，根据标签名称生成固定颜色
const getTagColor = (tagName: string) => {
  // 预设的颜色数组
  const colors = [
    '#1abc9c', '#2ecc71', '#3498db', '#9b59b6', '#f1c40f',
    '#e67e22', '#e74c3c', '#34495e', '#16a085', '#27ae60',
    '#2980b9', '#8e44ad', '#f39c12', '#d35400', '#c0392b'
  ];
  
  // 计算字符串的哈希值
  let hash = 0;
  for (let i = 0; i < tagName.length; i++) {
    hash = tagName.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // 使用哈希值选择颜色
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

// SEO优化
useHead({
  title: '标签 - ' + (blog.blogInfo.siteConfig?.siteName || '博客'),
  meta: [
    { 
      name: 'description', 
      content: '博客文章标签页面，查看所有文章标签分类' 
    },
    { 
      name: 'keywords', 
      content: '标签,博客,文章标签,技术分类' 
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

.tag-cloud {
  background-color: var(--card-bg);
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  margin-bottom: 2rem;
}

.tag-item {
  display: inline-block;
  padding: 0 0.5rem;
  transition: all 0.3s;

  &:hover {
    transform: scale(1.1);
  }
}

@media (max-width: 768px) {
  .page-title {
    font-size: 2rem !important;
  }
  
  .page-container {
    padding: 1.5rem;
  }
  
  .tag-cloud {
    padding: 1.5rem 1rem;
  }
}
</style> 