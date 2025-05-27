<template>
  <div ref="toolRef" class="tool" :style="y > 0 ? show : ''">
    <div v-if="isArticlePage" class="item" @click="handleSide">
      <UIcon name="icon:heng" class="!size-6 text-center"></UIcon>
    </div>
    <div v-if="commentShow(route.name as string)" class="item" @click="handleToComment">
      <UIcon name="icon:comments" class="!size-6 text-center"></UIcon>
    </div>
    <div class="item back-to-top" @click="handleBackToTop">
      <UIcon name="icon:up" class="!size-4 mb-1 text-center"></UIcon>
      <span class="count">{{ process }}%</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useScroll } from '@vueuse/core';
import { nextTick, watch } from 'vue';
import { useAutoAnimate } from '~/composables/useAutoAnimate';

// 使用Nuxt的路由
const route = useRoute();
// 使用Pinia存储
const app = useAppStore();

const process = ref(0);
const show = reactive({
  transform: "translateX(-45px)"
});

// 使用AutoAnimate增强过渡动画
const { parent: toolRef } = useAutoAnimate();

// 在客户端使用window
const y = ref(0);
const isClient = ref(false);

onMounted(() => {
  // 标记为客户端环境
  isClient.value = true;

  // 使用useScroll获取滚动位置
  const { y: scrollY } = useScroll(window);
  
  // 监听滚动位置变化
  watch(scrollY, (newY) => {
    y.value = newY;
    updateScrollProcess();
  });
  
  // 初始化滚动进度
  updateScrollProcess();
});

const updateScrollProcess = () => {
  if (isClient.value) {
    // 计算滚动百分比
    process.value = Number(
      (
        (window.pageYOffset /
          (document.documentElement.scrollHeight - window.innerHeight)) *
        100
      ).toFixed(0)
    );
  }
};

// 判断是否显示评论按钮的页面列表
const commentList = ["article", "friend", "talkInfo"];
const commentShow = computed(() => (value: string) => {
  // 如果是文章页面，直接返回true
  if (isArticlePage.value) return true;
  // 其他情况根据路由名称判断
  return commentList.includes(value);
});

// 侧边栏切换
const handleSide = () => {
  // 先检查app.sideFlag是否是响应式对象
  if (app && typeof app.sideFlag !== 'undefined') {
    // 切换侧边栏状态
    app.toggleSideFlag ? app.toggleSideFlag() : app.sideFlag = !app.sideFlag;
    console.log('侧边栏状态已切换:', app.sideFlag);
  } else {
    console.warn('侧边栏状态切换失败: app.sideFlag不存在');
  }
};

// 滚动到评论区
const handleToComment = () => {
  if (isClient.value) {
    // 等待DOM更新后再查找评论区元素
    nextTick(() => {
      const commentEl = document.getElementById("reply-wrap");
      if (commentEl) {
        commentEl.scrollIntoView({
          block: "start",
          inline: "nearest",
          behavior: 'smooth'
        });
      } else {
        console.warn('评论区元素未找到');
      }
    });
  }
};

// 返回顶部
const handleBackToTop = () => {
  if (isClient.value) {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
};

// 判断是否为文章页面
const isArticlePage = computed(() => {
  return route.meta.title === '文章' || 
         route.path.startsWith('/article/') || 
         route.name === 'article-id';
});
</script>

<style lang="scss" scoped>
@use "~/assets/styles/mixin.scss";

.tool {
  position: fixed;
  right: -40px;
  bottom: 85px;
  z-index: 9;
  color: var(--primary-color);
  box-shadow: 0 0 0.5rem rgb(0 0 0 / 10%);
  background: var(--grey-1-a3);
  transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  border-radius: 4px 0 0 4px;

  .item {
    @include mixin.flex;
    flex-direction: column;
    width: 2.1rem;
    padding: 0.4rem 0.2125rem;
    opacity: 0.6;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);


    .count {
      font-size: 0.75em;
      margin-top: 2px;
      line-height: 1;
    }

    &:hover {
      opacity: 0.9;
      transform: scale(1.1);
    }
  }
}
</style> 