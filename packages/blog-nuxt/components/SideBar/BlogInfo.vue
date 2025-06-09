<template>
  <div class="blog-container">
    <div v-for="(item, index) in blogInfo" :key="index" class="blog-item">
      <NuxtLink :to="item.path" @click="app.isCollapse = false">
        <div class="count">{{ item.count }}</div>
        <div class="name">{{ item.name }}</div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
const blog = useBlogStore();
const app = useAppStore();

// 从 store 中获取博客信息
const blogInfo = computed(() => [
  { path: "/archives", count: blog.blogInfo?.articleCount || 0, name: "文章" },
  { path: "/category", count: blog.blogInfo?.categoryCount || 0, name: "分类" },
  { path: "/tag", count: blog.blogInfo?.tagCount || 0, name: "标签" },
]);

// 默认导出
defineExpose({
  name: 'BlogInfo'
});
</script>

<style lang="scss" scoped>
.blog-container {
  display: flex;
  justify-content: center;
  margin-top: 0.8rem;
  line-height: 1.4;
  text-align: center;
}

.blog-item {
  color: var(--grey-6);
  padding: 0 0.7rem;

  &:not(:first-child) {
    border-left: 0.0625rem solid var(--grey-4);
  }
  
  a {
    text-decoration: none;
    color: inherit;
  }
}

.count {
  font-size: 1.25rem;
  font-weight: 600;
  text-align: center;
}

.name {
  font-size: 0.875rem;
}
</style> 