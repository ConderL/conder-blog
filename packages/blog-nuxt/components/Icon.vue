<template>
  <span 
    v-if="svgContent" 
    :class="['svg-icon', props.class]" 
    v-html="svgContent"
    :style="{ width: size, height: size, color: color }"
  ></span>
  <div v-else-if="isLoading" :class="['svg-icon', props.class]" :style="{ width: size, height: size }">
    <div class="flex items-center justify-center w-full h-full animate-pulse">
      <!-- 加载状态 -->
    </div>
  </div>
  <div v-else :class="['svg-icon', props.class]" :style="{ width: size, height: size }">
    <!-- 图标加载失败 -->
    <div class="flex items-center justify-center w-full h-full text-gray-300">
      ?
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';

const props = defineProps({
  prefix: {
    type: String,
    default: 'icon'
  },
  iconClass: {
    type: String,
    required: false
  },
  name: {
    type: String,
    default: ''
  },
  color: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: '1rem'
  },
  class: {
    type: String,
    default: ''
  }
});

// 获取$loadSvg辅助方法
const { $loadSvg, $normalizeSvgName } = useNuxtApp();

// 状态
const svgContent = ref(null);
const isLoading = ref(true);
const error = ref(null);

// 计算实际使用的图标名称
const iconName = computed(() => {
  // 优先使用iconClass（兼容旧代码），如果没有则使用name
  return props.iconClass || props.name || '';
});

// 加载图标
onMounted(async () => {
  if (!iconName.value) {
    isLoading.value = false;
    return;
  }
  
  try {
    // 标准化名称
    const normalizedName = $normalizeSvgName ? $normalizeSvgName(iconName.value) : iconName.value;
    
    // 使用插件提供的方法加载SVG
    if ($loadSvg) {
      svgContent.value = await $loadSvg(normalizedName);
    } else {
      // 降级方案：直接导入
      try {
        const module = await import(`~/assets/icons/${normalizedName}.svg?raw`);
        svgContent.value = module.default || '';
      } catch (e) {
        console.error(`Could not load icon: ${normalizedName}`, e);
      }
    }
    
    if (!svgContent.value) {
      error.value = `Icon ${normalizedName} not found`;
    }
  } catch (e) {
    error.value = e.message;
    console.error('Icon loading error:', e);
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
.svg-icon {
  vertical-align: -0.15em;
  overflow: hidden;
  fill: currentColor;
  display: inline-block;
}
</style> 