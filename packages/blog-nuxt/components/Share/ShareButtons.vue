<template>
  <div>
    <Share
      :url="url"
      :title="title"
      :description="description"
      :sites="sites"
      :theme="theme"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Share } from "vue3-social-share";
import "vue3-social-share/lib/index.css";
import { useDark } from '@vueuse/core';

const isDark = useDark();

const props = defineProps({
  url: {
    type: String,
    default: '',
  },
  title: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: '',
  },
  sites: {
    type: Array,
    default: () => ['weibo', 'qq', 'wechat', 'douban', 'linkedin', 'facebook', 'twitter'],
  },
});

const theme = computed(() => isDark.value ? 'dark' : 'light');
</script>

<style scoped>
/* 自定义样式可以在这里添加 */
</style> 