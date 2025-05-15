<template>
  <div class="navbar-wrapper">
    <nav class="navbar-inner">
      <ul class="tabs">
        <li class="tab" v-for="(item, index) in navItems" :key="index">
          <NuxtLink :to="item.path" class="tab-link" :class="{ active: isActive(item.path) }">
            <svg-icon v-if="item.icon" :icon-class="item.icon" class="tab-icon" />
            <span class="tab-name">{{ item.name }}</span>
          </NuxtLink>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// @ts-ignore - Nuxt自动导入
const route = useRoute();

// 导航菜单项
const navItems = ref([
  { name: '首页', path: '/', icon: 'home' },
  { name: '归档', path: '/archive', icon: 'archive' },
  { name: '分类', path: '/category', icon: 'category' },
  { name: '标签', path: '/tag', icon: 'tag' },
  { name: '关于', path: '/about', icon: 'user' }
]);

// 判断当前路由是否匹配导航项
const isActive = (path: string) => {
  // 精确匹配首页
  if (path === '/' && route.path === '/') {
    return true;
  }
  // 其他页面前缀匹配
  if (path !== '/' && route.path.startsWith(path)) {
    return true;
  }
  return false;
};
</script>

<style lang="scss" scoped>
.navbar-wrapper {
  display: flex;
  align-items: center;
  height: 100%;
  margin-left: 1rem;
  
  .navbar-inner {
    display: flex;
    height: 100%;
    
    .tabs {
      display: flex;
      align-items: center;
      height: 100%;
      
      .tab {
        position: relative;
        display: flex;
        align-items: center;
        height: 100%;
        margin: 0 0.5rem;
        
        .tab-link {
          display: flex;
          align-items: center;
          padding: 0 0.5rem;
          height: 100%;
          font-weight: 500;
          text-decoration: none;
          color: inherit;
          transition: all 0.2s ease;
          
          &:hover, &.active {
            color: var(--color-pink);
          }
          
          .tab-icon {
            margin-right: 0.25rem;
          }
        }
      }
    }
  }
}

@media (max-width: 991px) {
  .navbar-wrapper {
    margin-left: 0;
    
    .tab-name {
      display: none;
    }
    
    .tab {
      margin: 0 0.25rem !important;
    }
  }
}
</style> 