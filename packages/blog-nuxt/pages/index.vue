<template>
  <div class="index-page">
    <!-- 背景轮播 -->
    <Images></Images>
    
    <!-- 品牌 -->
    <Brand></Brand>
    
    <div class="bg">
      <div class="main-container mt">
        <div class="left-container" :class="app.sideFlag ? 'test' : ''">
          <!-- 说说 -->
          <TalkSwiper></TalkSwiper>
          <!-- 推荐文章 -->
          <Recommend></Recommend>
          <!-- 文章列表 -->
          <ArticleItem></ArticleItem>
        </div>
        
        <div class="right-container" :class="app.sideFlag ? 'temp' : ''">
          <!-- 侧边栏组件将在后续开发 -->
          <div class="side-card">
            <h3>博客信息</h3>
            <BlogInfo />
          </div>
          
          <div class="side-card">
            <h3>公告</h3>
            <p>{{ blog.blogInfo.siteConfig.siteNotice || '暂无公告' }}</p>
          </div>
          
          <div class="side-card">
            <h3>最新评论</h3>
            <p>评论功能开发中...</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useAppStore, useBlogStore } from '../composables/useStores';

// 导入组件
import Images from '../components/Home/Swiper/Images.vue';
import Brand from '../components/Home/Brand/index.vue';
import TalkSwiper from '../components/Home/Swiper/TalkSwiper.vue';
import Recommend from '../components/Home/Swiper/Recommend.vue';
import ArticleItem from '../components/Article/ArticleItem.vue';
import BlogInfo from '../components/SideBar/BlogInfo.vue';

// 获取store实例
const app = useAppStore();
const blog = useBlogStore();

// 定义页面元数据
definePageMeta({
  title: '首页',
  layout: 'default'
});

// 初始化获取博客信息
onMounted(async () => {
  try {
    // 这里应该调用API获取博客信息
    // 在实际项目中替换为真实API调用
    const mockBlogInfo = {
      articleCount: 50,
      categoryCount: 10,
      tagCount: 25,
      viewCount: 1000,
      commentCount: 120,
      userCount: 45,
  siteConfig: {
        siteName: '博客系统',
    siteAuthor: '博主',
    siteIntro: '这是一个基于Nuxt.js的博客网站',
        siteUrl: 'https://example.com',
        siteAvatar: '/images/avatar/admin.jpg',
        siteNotice: '欢迎来到我的博客，这里记录了我的技术成长和生活点滴。',
        createSiteTime: '2023-01-01',
        touristAvatar: '/images/avatar/default.jpg',
    commentCheck: false,
    recordNumber: 'ICP备xxxxxxxx号'
  }
    };
    
    blog.setBlogInfo(mockBlogInfo);

    // 实际项目中应该使用真实API：
    // const res = await getBlogInfo();
    // blog.setBlogInfo(res.data.data);
  } catch (error) {
    console.error('获取博客信息失败', error);
  }
});
</script>

<style lang="scss" scoped>
.mt {
  margin-top: 1rem;
  padding-bottom: 1.75rem;
}

.main-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  gap: 1.5rem;
  position: relative;
  z-index: 2;
  
  @media (max-width: 768px) {
    flex-direction: column;
    padding: 0 1rem;
  }
}

.left-container {
  flex: 7;
  transition: all 0.3s;
  
  &.test {
    width: 100%;
  }
}

.right-container {
  flex: 3;
  transition: all 0.3s;
  
  &.temp {
    display: none;
  }
  
  @media (max-width: 768px) {
    margin-top: 1.5rem;
  }
}

.bg {
  background-color: var(--body-bg);
  position: relative;
  z-index: 2;
}

.card {
  background-color: var(--card-bg, #fff);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  
  h3 {
    margin-bottom: 1rem;
    font-weight: 600;
    color: var(--heading-color, #333);
  }
  
  p {
    margin-bottom: 0.5rem;
    color: var(--text-color, #666);
    
    &:last-child {
      margin-bottom: 0;
    }
  }
}
</style>