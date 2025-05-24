<template>
  <div 
    class="icon-wrapper" 
    :style="{
      width: typeof size === 'number' ? `${size}px` : size,
      height: typeof size === 'number' ? `${size}px` : size,
      color: color || undefined
    }"
  >
    <UIcon 
      v-if="prefixIcon" 
      :name="iconName" 
      :size="typeof size === 'number' ? `${size}px` : size"
      :color="color" 
    />
    <img 
      v-else-if="isUrl" 
      :src="name" 
      :style="{
        width: '100%',
        height: '100%'
      }" 
    />
    <svg v-else class="icon" aria-hidden="true">
      <use :xlink:href="iconName"></use>
    </svg>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  // 图标名称
  name: {
    type: String,
    required: true
  },
  // 大小，默认16px
  size: {
    type: [String, Number],
    default: '16px'
  },
  // 颜色
  color: {
    type: String,
    default: ''
  }
});

// 判断是否为URL
const isUrl = computed(() => {
  return props.name.startsWith('http') || props.name.startsWith('data:');
});

// 判断是否使用Nuxt UI图标
const prefixIcon = computed(() => {
  const runtimeConfig = useRuntimeConfig();
  const iconPrefix = runtimeConfig.public.iconPrefix || 'i-';
  return props.name.startsWith(iconPrefix);
});

// 图标名称
const iconName = computed(() => {
  if (prefixIcon.value) {
    return props.name;
  }
  
  // 本地svg图标
  const runtimeConfig = useRuntimeConfig();
  const iconLocalPrefix = runtimeConfig.public.iconLocalPrefix || 'icon-local-';
  
  switch (props.name) {
    case 'qq':
      return `#${iconLocalPrefix}qq`;
    case 'github':
      return `#${iconLocalPrefix}github`;
    case 'gitee':
      return `#${iconLocalPrefix}gitee`;
    case 'bilibili':
      return `#${iconLocalPrefix}bilibili`;
    default:
      return `#${iconLocalPrefix}${props.name}`;
  }
});
</script>

<style scoped>
.icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.icon {
  width: 100%;
  height: 100%;
  fill: currentColor;
  overflow: hidden;
}
</style> 