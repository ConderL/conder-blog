<template>
  <div class="blog-container">
    <div v-for="(item, index) in blogInfo" :key="index" class="blog-item">
      <NuxtLink :to="item.path">
        <div class="count">{{ item.count }}</div>
        <div class="name">{{ item.name }}</div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
const blog = useBlogStore();

// 全部使用固定值作为默认值，确保服务端和客户端渲染完全一致
const blogInfo = computed(() => [
  { path: "/archives", count: 2, name: "文章" },
  { path: "/category", count: 1, name: "分类" },
  { path: "/tag", count: 1, name: "标签" },
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