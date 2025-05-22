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
  iconClass: {
    type: String,
    required: false
  },
  name: {
    type: String,
    required: false
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

// 确保至少有一个图标标识符
if (!props.iconClass && !props.name) {
  console.error('SvgIcon组件需要iconClass或name属性');
}

// 获取实际使用的图标名称（去除所有前缀）
const normalizedIconName = computed(() => {
  const iconName = props.iconClass || props.name || '';
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