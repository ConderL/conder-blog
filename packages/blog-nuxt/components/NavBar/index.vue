<template>
  <nav class="navbar-container" :class="{ active: appStore.menuFlag }">
    <ul class="navbar-list">
      <li class="navbar-item">
        <NuxtLink to="/" class="navbar-link" active-class="active">首页</NuxtLink>
      </li>
      <li class="navbar-item">
        <NuxtLink to="/archive" class="navbar-link" active-class="active">归档</NuxtLink>
      </li>
      <li class="navbar-item">
        <NuxtLink to="/category" class="navbar-link" active-class="active">分类</NuxtLink>
      </li>
      <li class="navbar-item">
        <NuxtLink to="/tag" class="navbar-link" active-class="active">标签</NuxtLink>
      </li>
      <li class="navbar-item">
        <NuxtLink to="/about" class="navbar-link" active-class="active">关于</NuxtLink>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { useAppStore } from '../../stores/app';

const appStore = useAppStore();
</script>

<style lang="scss" scoped>
.navbar-container {
  display: flex;
  align-items: center;
  height: 100%;
  
  .navbar-list {
    display: flex;
    height: 100%;
    align-items: center;
    
    .navbar-item {
      height: 100%;
      padding: 0 1rem;
      display: flex;
      align-items: center;
      
      .navbar-link {
        font-size: 1rem;
        color: inherit;
        text-decoration: none;
        transition: color 0.3s;
        position: relative;
        
        &:hover, &.active {
          color: var(--color-pink);
        }
        
        &.active:after {
          content: '';
          position: absolute;
          bottom: -5px;
          left: 0;
          width: 100%;
          height: 2px;
          background-color: var(--color-pink);
        }
      }
    }
  }
}

// 移动端适配
@media (max-width: 991px) {
  .navbar-container {
    position: fixed;
    top: 3.125rem;
    left: 0;
    flex-direction: column;
    width: 100%;
    height: 0;
    overflow: hidden;
    background-color: var(--nav-bg);
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.1);
    transition: height 0.3s ease;
    opacity: 0;
    
    &.active {
      height: auto;
      opacity: 1;
    }
    
    .navbar-list {
      flex-direction: column;
      width: 100%;
      padding: 1rem 0;
      
      .navbar-item {
        width: 100%;
        height: 3rem;
        padding: 0;
        justify-content: center;
        
        .navbar-link {
          width: 100%;
          text-align: center;
          padding: 0.75rem 0;
          
          &.active:after {
            display: none;
          }
        }
      }
    }
  }
}
</style>