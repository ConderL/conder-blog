<template>
  <header class="header-wrapper" :class="fixedClass">
    <!-- 切换按钮 -->
    <Toggle />
    <!-- 菜单 -->
    <NavBar :class="{ sub: y > 0 }" />
    <!-- 右侧按钮 -->
    <ul class="right">
      <li class="item">
        <svg-icon style="cursor: pointer;" :icon-class="isDark ? 'moon' : 'sun'" @click="toggle()"></svg-icon>
      </li>
      <li class="item">
        <svg-icon style="cursor: pointer;" icon-class="search" @click="appStore.searchFlag = true"></svg-icon>
      </li>
    </ul>
  </header>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useScroll } from '@vueuse/core';
import { useAppStore } from '../../stores/app';

// Nuxt会自动导入组件，不需要手动导入Toggle和NavBar

const appStore = useAppStore();

// 使用VueUse的useScroll获取滚动位置
const { y } = useScroll(typeof window !== 'undefined' ? window : null);

// 深色模式状态 (模拟，实际应用中应使用useDark)
const isDark = ref(false);
const toggle = () => {
  isDark.value = !isDark.value;
  
  // 切换html的theme属性
  if (typeof window !== 'undefined') {
    document.documentElement.setAttribute('theme', isDark.value ? 'dark' : 'light');
  }
};

// 头部固定样式类
const fixedClass = ref("");

// 监听滚动位置，根据滚动方向设置样式
watch(y, (newValue, oldValue) => {
  if (newValue > 0) {
    if (newValue < oldValue!) {
      fixedClass.value = "show up";
    } else {
      fixedClass.value = "show down";
    }
  } else {
    fixedClass.value = "";
  }
});
</script>

<style lang="scss" scoped>
.header-wrapper {
  position: fixed;
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 3.125rem;
  padding: 0 1rem;
  text-shadow: 0 0.2rem 0.3rem rgb(0 0 0 / 50%);
  color: var(--header-text-color);
  transition: all 0.2s ease-in-out 0s;
  z-index: 9;
}

.show {
  background: var(--nav-bg);
  box-shadow: 0.1rem 0.1rem 0.2rem var(--grey-9-a1);
  text-shadow: 0 0 0.625rem var(--grey-9-a1);
  color: var(--text-color);
}

.up {
  transform: translateY(0);
}

.down {
  transform: translateY(-100%);
}

.right {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 100%;

  .item {
    padding: 0.625rem 0.5rem;
  }
}

@media (max-width: 991px) {
  .header-wrapper {
    padding: 0;
  }
}
</style> 