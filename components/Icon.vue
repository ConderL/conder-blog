<template>
  <img 
    :src="`/icons/${normalizedIconName}.svg`" 
    :alt="normalizedIconName"
    class="svg-icon"
    :style="{
      width: typeof size === 'number' ? `${size}px` : size,
      height: typeof size === 'number' ? `${size}px` : size,
      fill: color
    }"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  name: {
    type: String,
    required: true
  },
  size: {
    type: [String, Number],
    default: '1em'
  },
  color: {
    type: String,
    default: 'currentColor'
  }
});

// 获取实际使用的图标名称（去除所有前缀）
const normalizedIconName = computed(() => {
  const iconName = props.name || '';
  // 移除前缀：local-、svg-、icon-等
  return iconName.replace(/^(local-|svg-|icon-)/g, '');
});
</script>

<style scoped>
.svg-icon {
  vertical-align: -0.15em;
  overflow: hidden;
}
</style> 