<template>
  <div class="blog-container">
    <!-- 使用ClientOnly包裹，确保服务端和客户端渲染一致 -->
    <ClientOnly>
      <!-- 文章 -->
      <div class="blog-item" v-for="(item, index) in blogInfo" :key="index">
        <NuxtLink :to="item.path">
          <div class="count">{{ item.count }}</div>
          <div class="name">{{ item.name }}</div>
        </NuxtLink>
      </div>
      
      <!-- 服务端渲染占位符 -->
      <template #fallback>
        <div class="blog-item" v-for="item in [
          { path: '/archive', name: '文章' },
          { path: '/category', name: '分类' },
          { path: '/tag', name: '标签' }
        ]" :key="item.path">
          <NuxtLink :to="item.path">
            <div class="count">0</div>
            <div class="name">{{ item.name }}</div>
          </NuxtLink>
        </div>
      </template>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useBlogStore } from "../../composables/useStores";

const blog = useBlogStore();
const blogInfo = computed(() => [
  { path: "/archive", count: blog.blogInfo.articleCount, name: "文章" },
  { path: "/category", count: blog.blogInfo.categoryCount, name: "分类" },
  { path: "/tag", count: blog.blogInfo.tagCount, name: "标签" },
]);

// 默认导出
defineExpose({
  name: 'BlogInfo'
});
</script>

<style lang="scss" scoped>
.blog-container {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  margin-top: 0.5rem;
}

.blog-item {
  text-align: center;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.3s;
  
  &:hover {
    background-color: var(--hover-color);
    transform: translateY(-5px);
  }
  
  .count {
    font-size: 1.25rem;
    font-weight: bold;
    color: var(--heading-color);
  }
  
  .name {
    color: var(--text-color-secondary);
    font-size: 0.875rem;
  }
}
</style> 