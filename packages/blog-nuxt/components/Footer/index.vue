<template>
  <footer class="footer-wrapper" v-if="!isMessage">
    <p>
      ©
      {{ startYear }} -
      {{ currentYear }} By
      {{ author }}
    </p>
    <a href="https://beian.miit.gov.cn/" target="_blank">
      {{ recordNumber }}
    </a>
  </footer>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, defineComponent } from 'vue';
import { useBlogStore, useAppStore } from '../../composables/useStores';
import { formatDate } from '../../utils/date';

// @ts-ignore - Nuxt自动导入
const route = useRoute();
const blogStore = useBlogStore();
const appStore = useAppStore();

// 判断是否是留言页
const isMessage = computed(() => route.path == "/message");

// 使用默认静态值避免服务端与客户端不一致
const startYear = ref('2025');
const currentYear = ref('2025');
const author = ref('@ConderL');
const recordNumber = ref('豫ICP备xxxxx号');

// 客户端挂载后更新数据
onMounted(() => {
  // 尝试从博客信息中获取数据
  if (blogStore.blogInfo && blogStore.blogInfo.siteConfig) {
    if (blogStore.blogInfo.siteConfig.createSiteTime) {
      startYear.value = formatDate(blogStore.blogInfo.siteConfig.createSiteTime, "YYYY");
    }
    if (blogStore.blogInfo.siteConfig.siteAuthor) {
      author.value = blogStore.blogInfo.siteConfig.siteAuthor;
    }
    if (blogStore.blogInfo.siteConfig.recordNumber) {
      recordNumber.value = blogStore.blogInfo.siteConfig.recordNumber;
    }
  }
  
  // 更新当前年份
  currentYear.value = new Date().getFullYear().toString();
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