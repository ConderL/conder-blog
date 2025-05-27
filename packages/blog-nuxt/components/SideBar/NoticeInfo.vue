<template>
  <div>
    <div class="notice-title">
      <UIcon name="icon:trumpet" class="trumpet icon" style="color: #FF5CA1" />
      公告
    </div>
    <div class="notice-content" v-html="blog.blogInfo?.siteConfig?.siteNotice || '暂无公告'"></div>
  </div>
</template>

<script setup lang="ts">
import { defineComponent } from 'vue';

// 获取博客信息
const blog = useBlogStore();

// 添加默认导出
defineComponent({
  name: 'NoticeInfo'
});
</script>

<style lang="scss" scoped>
.notice-title {
  font-size: 1.2em;
  display: flex;
  align-items: center;
}

.notice-content {
  font-size: 0.9rem;
  line-height: 1.75rem;
  margin-top: 0.5rem;
}

.trumpet {
  width: 1.1875rem;
  height: 1.1875rem;
  margin-right: 0.5rem;
  animation: trumpet-shake 1s linear infinite;
}

@keyframes trumpet-shake {
  0% { transform: rotate(-15deg); }
  4% { transform: rotate(15deg); }
  16% { transform: rotate(-22deg); }
  20% { transform: rotate(22deg); }
  8%, 24% { transform: rotate(-18deg); }
  12%, 28% { transform: rotate(18deg); }
  32% { transform: rotate(-12deg); }
  36% { transform: rotate(12deg); }
  40%, 100% { transform: rotate(0deg); }
}
</style> 