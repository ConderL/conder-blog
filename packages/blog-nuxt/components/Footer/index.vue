<template>
  <footer class="footer-wrapper" v-if="!isMessage">
    <p>
      ©
      {{ createTime }} -
      {{ new Date().getFullYear() }} By
      {{ blogStore.blogInfo.siteConfig.siteAuthor }}
    </p>
    <a href="https://beian.miit.gov.cn/" target="_blank">
      {{ blogStore.blogInfo.siteConfig.recordNumber }}
    </a>
  </footer>
</template>

<script setup lang="ts">
import { computed, defineComponent } from 'vue';
import { formatDate } from '../../utils/date';
import { useBlogStore, useAppStore } from '../../composables/useStores';

// @ts-ignore - Nuxt自动导入
const route = useRoute();
const blogStore = useBlogStore();
const appStore = useAppStore();

// 判断是否是留言页
const isMessage = computed(() => route.path == "/message");

// 计算创建时间
const createTime = computed(() => {
  try {
    const createTimeStr = blogStore.blogInfo.siteConfig.createSiteTime;
    if (!createTimeStr) return "2023"; // 提供默认年份
    return formatDate(createTimeStr, "YYYY");
  } catch (error) {
    console.error("日期格式化错误:", error);
    return "2023"; // 提供默认年份
  }
});

// 为了解决默认导出linter错误，增加组件名称导出
defineComponent({
  name: 'Footer'
});
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
  
  a {
    color: var(--grey-0);
    text-decoration: none;
    
    &:hover {
      color: var(--grey-1);
      text-decoration: underline;
    }
  }
}

@keyframes gradientBG {
  0% {
    background-position: 0% 40%;
  }

  50% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0% 50%;
  }
}
</style> 