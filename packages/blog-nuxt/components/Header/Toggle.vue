<template>
  <div class="toggle-wrapper">
    <svg-icon class="menu-btn" icon-class="menu" @click="toggleSidebar" />
  </div>
</template>

<script setup lang="ts">
import { useAppStore } from '../../stores/app';

const appStore = useAppStore();

function toggleSidebar() {
  appStore.toggleSidebar();
}
</script>

<style lang="scss" scoped>
.toggle-wrapper {
  display: flex;
  align-items: center;
  height: 100%;
  
  .menu-btn {
    padding: 0.625rem 0.5rem;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      transform: scale(1.1);
    }
  }
}

@media (max-width: 991px) {
  .toggle-wrapper {
    padding-left: 0.5rem;
  }
}
</style> 