<template>
  <div class="talk-container">
    <h1>说说</h1>
    <div class="talk-content">
      <p>这里将展示博客的说说内容</p>
    </div>
  </div>
</template>

<script setup lang="ts">
// Nuxt 3 会自动导入 definePageMeta
definePageMeta({
  layout: 'default',
  title: '说说'
})
</script>

<style lang="scss" scoped>
.talk-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;

  h1 {
    font-size: 2rem;
    margin-bottom: 2rem;
    color: var(--text-color);
  }

  .talk-content {
    background-color: var(--grey-1);
    border-radius: 4px;
    padding: 2rem;
    box-shadow: 0 0 1rem var(--box-bg-shadow);
  }
}

[theme="dark"] {
  .talk-container {
    h1 {
      color: var(--text-color);
    }

    .talk-content {
      background-color: var(--grey-1);
    }
  }
}
</style> 