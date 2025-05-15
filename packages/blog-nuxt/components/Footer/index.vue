<template>
  <footer class="footer-wrapper" v-if="!isMessage">
    <p>
      ©
      {{ formatDate(blogStore.blogInfo.siteConfig.createSiteTime, "YYYY") }} -
      {{ new Date().getFullYear() }} By
      {{ blogStore.blogInfo.siteConfig.siteAuthor }}
    </p>
    <a href="https://beian.miit.gov.cn/" target="_blank">
      {{ blogStore.blogInfo.siteConfig.recordNumber }}
    </a>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { formatDate } from '../../utils/date';
import { useBlogStore } from '../../stores/blog';

// @ts-ignore - Nuxt自动导入
const route = useRoute();
const blogStore = useBlogStore();

// 判断是否是留言页
const isMessage = computed(() => route.path == "/message");
</script>

<style lang="scss" scoped>
.footer-wrapper {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 8rem;
  padding: 2.5rem 0;
  font-size: 0.875rem;
  text-align: center;
  color: var(--grey-0);
  background: var(--footer-bg);
  background-size: 300% 300%;
  -webkit-animation: gradientBG 10s ease infinite;
  animation: gradientBG 10s ease infinite;
}

@keyframes gradientBG {
  0% {
    background-position: 0 40%;
  }

  50% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0 50%;
  }
}
</style> 