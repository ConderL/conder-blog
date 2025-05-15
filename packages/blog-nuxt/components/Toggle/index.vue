<template>
  <transition name="slide-fade">
    <div v-show="showToggle" class="toggle-wrapper" @click="toggleMenu">
      <div class="toggle-inner" :class="{ 'menu-active': appStore.menuFlag }">
        <span class="line"></span>
        <span class="line"></span>
        <span class="line"></span>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useAppStore } from '../../stores/app';

const appStore = useAppStore();
const showToggle = ref(false);

// 切换菜单
function toggleMenu() {
  appStore.menuFlag = !appStore.menuFlag;
}

// 检测窗口大小以决定是否显示切换按钮
function checkWindowSize() {
  if (typeof window !== 'undefined') {
    showToggle.value = window.innerWidth <= 991;
  }
}

onMounted(() => {
  checkWindowSize();
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', checkWindowSize);
  }
});

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', checkWindowSize);
  }
});
</script>

<style lang="scss" scoped>
.toggle-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3.125rem;
  height: 3.125rem;
  padding: 0 0.6rem;
  cursor: pointer;
  z-index: 10;
}

.toggle-inner {
  position: relative;
  width: 100%;
  height: 1.25rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  
  .line {
    display: block;
    width: 100%;
    height: 2px;
    background-color: currentColor;
    border-radius: 1px;
    transition: all 0.3s ease;
  }
  
  &.menu-active {
    .line:nth-child(1) {
      transform: translateY(9px) rotate(45deg);
    }
    
    .line:nth-child(2) {
      opacity: 0;
    }
    
    .line:nth-child(3) {
      transform: translateY(-9px) rotate(-45deg);
    }
  }
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(-10px);
  opacity: 0;
}

@media (min-width: 992px) {
  .toggle-wrapper {
    display: none;
  }
}
</style> 