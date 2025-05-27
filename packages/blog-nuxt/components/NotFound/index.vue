<template>
  <div class="not-found-container">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
// 组件接收子内容通过 slot 插槽
</script>

<style lang="scss" scoped>
.not-found-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
  text-align: center;
  
  .error-code {
    font-size: 6rem;
    font-weight: 700;
    color: var(--primary-color);
    margin: 0;
    line-height: 1;
  }
  
  .error-title {
    font-size: 2rem;
    font-weight: 500;
    color: var(--text-color);
    margin: 0.5rem 0 2rem;
  }
}
</style> 