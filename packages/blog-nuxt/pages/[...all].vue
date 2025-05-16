<template>
  <div class="not-found">
    <h1>404</h1>
    <p>页面未找到</p>
    <NuxtLink to="/" class="home-link">返回首页</NuxtLink>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default'
})
</script>

<style lang="scss" scoped>
@use 'sass:color';

.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
  padding: 2rem;

  h1 {
    font-size: 6rem;
    margin-bottom: 1rem;
    color: var(--primary-color);
  }

  p {
    font-size: 1.5rem;
    margin-bottom: 2rem;
    color: var(--text-color);
  }

  .home-link {
    padding: 0.75rem 1.5rem;
    background-color: var(--primary-color);
    color: white;
    border-radius: 0.5rem;
    text-decoration: none;
    transition: background-color 0.3s ease;

    &:hover {
      background-color: var(--primary-hover-color);
    }
  }
}

[theme="dark"] {
  .not-found {
    p {
      color: var(--text-color-dark);
    }

    .home-link {
      background-color: var(--primary-color-dark);

      &:hover {
        background-color: var(--primary-hover-color-dark);
      }
    }
  }
}
</style>