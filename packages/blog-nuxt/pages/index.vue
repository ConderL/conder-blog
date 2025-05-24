<template>
  <div>
  <!-- 背景轮播 -->
  <Images></Images>
  
  <!-- 品牌 -->
  <Brand></Brand>
  
  <div class="bg">
    <div class="main-container">
      <div class="left-container" :class="app?.sideFlag ? 'test' : ''">
        <!-- 说说 -->
        <TalkSwiper></TalkSwiper>
        <!-- 推荐文章 -->
        <Recommend></Recommend>
        <!-- 文章列表 -->
        <ArticleItem></ArticleItem>
      </div>
      
      <div class="right-container" :class="app?.sideFlag ? 'temp' : ''">
        <!-- 作者信息 -->
        <div class="side-card">
          <AuthorInfo />
          <!-- 博客信息 -->
          <BlogInfo />
        </div>
        
        <!-- 公告 -->
        <div class="side-card">
          <NoticeInfo />
        </div>
        
        <!-- 最新评论 -->
        <div class="side-card">
          <RecentComment />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getBlogInfo } from '../api/blogInfo';
import { onServerPrefetch } from 'vue';

// 导入组件
import Images from '../components/Home/Swiper/Images.vue';
import Brand from '../components/Home/Brand/index.vue';
import TalkSwiper from '../components/Home/Swiper/TalkSwiper.vue';
import Recommend from '../components/Home/Swiper/Recommend.vue';
import ArticleItem from '../components/Article/ArticleItem.vue';
import BlogInfo from '../components/SideBar/BlogInfo.vue';
import AuthorInfo from '../components/SideBar/AuthorInfo.vue';
import NoticeInfo from '../components/SideBar/NoticeInfo.vue';
import RecentComment from '../components/SideBar/RecentComment.vue';

// 获取store实例 (使用Nuxt自动导入)
const app = useAppStore();
const blog = useBlogStore();

// 定义页面元数据
definePageMeta({
  title: '首页',
  layout: 'default'
});

// 服务端获取数据
onServerPrefetch(async () => {
  try {
    const { data } = await getBlogInfo();
    if (data && data.code === 200) {
      // 直接设置博客信息，不做转换
      blog.setBlogInfo(data.data);
    }
  } catch (error) {
    console.error('获取博客信息失败', error);
  }
});

// 客户端获取数据将由clientOnly.client.ts插件处理
</script>

<style lang="scss" scoped>
.mt {
  margin-top: 1rem;
  padding-bottom: 1.75rem;
}

/* 卡片 */
.side-card {
  padding: 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 0 1rem var(--box-bg-shadow);
  transition: all 0.2s ease-in-out 0s;

  &:not(:first-child) {
    margin-top: 1.25rem;
  }
}

.author-avatar {
  display: block;
  max-width: 10rem;
  margin: 0 auto;
  padding: 0.125rem;
  box-shadow: 0 0 1rem 0.625rem var(--body-bg-shadow);
  border: 0.0625rem solid var(--body-bg-shadow);
  border-radius: 50%;
  animation: 1000ms ease-in-out 0ms 1 normal forwards running blur;

  &:hover {
    animation: 1000ms ease 0ms 1 normal none running author-shake;
  }
}

.author-name {
  margin-top: 0.5rem;
  font-weight: 400;
  text-align: center;
  color: var(--grey-7);
}

.site-desc {
  margin-top: 0.5rem;
  font-size: 1em;
  text-align: center;
  color: var(--grey-5);
}

.notice-title {
  font-size: 1.2em;
  display: flex;
  align-items: center;
}

.notice-content {
  font-size: 0.9rem;
  line-height: 1.75rem;
  margin-top: 0.5rem;
}

.trumpet {
  margin-right: 0.5rem;
  animation: trumpet-shake 1s linear infinite;
}

@keyframes trumpet-shake {
  0% { transform: rotate(-15deg); }
  4% { transform: rotate(15deg); }
  16% { transform: rotate(-22deg); }
  20% { transform: rotate(22deg); }
  8%, 24% { transform: rotate(-18deg); }
  12%, 28% { transform: rotate(18deg); }
  32% { transform: rotate(-12deg); }
  36% { transform: rotate(12deg); }
  40%, 100% { transform: rotate(0deg); }
}

@keyframes author-shake {
  0% { transform: scale(1); }
  10%, 20% { transform: scale(0.9) rotate(-3deg); }
  30%, 50%, 70%, 90% { transform: scale(1.1) rotate(3deg); }
  40%, 60%, 80% { transform: scale(1.1) rotate(-3deg); }
  100% { transform: scale(1); }
}
</style>