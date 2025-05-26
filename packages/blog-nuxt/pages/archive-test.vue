<template>
  <div class="test-page">
    <h1>归档测试页面</h1>
    <p>这是一个测试页面，用于验证路由跳转是否正常工作</p>
    <div class="links">
      <NuxtLink to="/" class="link">返回首页</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  title: '归档测试'
});

// SEO优化
useHead({
  title: '归档测试页面',
  meta: [
    { name: 'description', content: '测试页面' },
    { name: 'robots', content: 'noindex' }
  ]
});
</script>

<style scoped>
.test-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

h1 {
  font-size: 2rem;
  margin-bottom: 1rem;
}

p {
  margin-bottom: 2rem;
}

.links {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.link {
  padding: 0.5rem 1rem;
  background-color: var(--primary-color);
  color: white;
  border-radius: 4px;
  text-decoration: none;
}
</style> 