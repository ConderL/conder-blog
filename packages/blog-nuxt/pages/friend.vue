<template>
  <div>
    <ClientOnly>
      <div class="page-header">
        <h1 class="page-title">友情链接</h1>
        <img class="page-cover" :src="blog.blogInfo.siteConfig?.friendWallpaper" alt="友链封面"/>
        <!-- 波浪 -->
        <Waves></Waves>
      </div>
    </ClientOnly>
    
    <div class="bg">
      <div class="page-container">
        <h2>
          <UIcon name="icon:flower" class="flower-icon" />
          本站信息
        </h2>
        <blockquote class="block">
          <p>名称：{{ blog.blogInfo.siteConfig?.siteName }}</p>
          <p>简介：{{ blog.blogInfo.siteConfig?.siteIntro }}</p>
          <p>头像：{{ blog.blogInfo.siteConfig?.authorAvatar }}</p>
        </blockquote>
        
        <h2>
          <UIcon name="icon:flower" class="flower-icon" />
          申请方法
        </h2>
        <div class="welcome">需要交换友链的可在本页留言 (｡･∀･)ﾉﾞ</div>
        <blockquote class="block">
          <p>出于信息需要,大佬你的信息格式要包含：网站名称、网站链接、头像链接、网站介绍、名称颜色</p>
        </blockquote>
        
        <h2>
          <UIcon name="icon:flower" class="flower-icon" />
          小伙伴们
        </h2>
        <div class="friends">
          <div 
            v-for="friend in friendList" 
            :key="friend.id" 
            class="friend-item"
          >
            <a target="_blank" :href="friend.url">
              <img class="image" :src="friend.avatar" />
            </a>
            <div class="info">
              <a class="name" target="_blank" :href="friend.url" :style="{ color: friend.color }">
                {{ friend.name }}
              </a>
              <p class="desc">{{ friend.introduction }}</p>
            </div>
          </div>
        </div>
        
        <!-- 评论区 - 友链评论 typeId=null -->
        <CommentList :comment-type="commentType" :type-id="null"></CommentList>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useBlogStore } from '~/stores';

// 定义页面元数据
definePageMeta({
  title: '友情链接'
});

// 获取博客信息
const blog = useBlogStore();
const commentType = ref(2);
const { friend: friendApi } = useApi();

// 友链列表
interface Friend {
  id: number;
  color: string;
  name: string;
  avatar: string;
  url: string;
  introduction: string;
}


const { data: friendList } = await friendApi.getFriendList();

// SEO优化
useHead({
  title: '友情链接 - ' + (blog.blogInfo.siteConfig?.siteName || '博客'),
  meta: [
    { 
      name: 'description', 
      content: '博客友情链接页面，查看与本站交换了链接的小伙伴们' 
    },
    { 
      name: 'keywords', 
      content: '友情链接,博客,友链,交换链接' 
    }
  ]
});
</script>

<style lang="scss" scoped>
.page-header {
  position: relative;
  padding: 3rem 0;
  color: #fff;
  text-align: center;
  background-color: var(--primary-color);
  
  .page-title {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
    color: var(--header-text-color);
    position: relative;
    z-index: 1;
  }
  
  .page-cover {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    z-index: 0;
  }
}

.bg {
  background-color: var(--background-color);
  padding: 2rem 0;
  min-height: 70vh;
}

.page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 3rem;

  h2 {
    display: flex;
    align-items: center;
    margin: 1.5rem 0 1rem 0;
    font-size: 1.5rem;
    
    .flower-icon {
      width: 1.25rem;
      height: 1.25rem;
      margin-right: 0.5rem;
      color: #ff9cbc;
      animation: rotate 6s linear infinite;
    }
  }
}

.block {
  line-height: 2;
  margin: 0 1.5rem;
  font-size: 15px;
  border-left: 0.2rem solid var(--color-purple);
  padding: 0.625rem 1rem;
  color: var(--grey-5);
  background: var(--color-pink-light);
  border-radius: 4px;
  word-wrap: break-word;
}

.welcome {
  position: relative;
  margin: 0 2.5rem 0.5rem;

  &::before {
    content: "";
    position: absolute;
    width: 0.4em;
    height: 0.4em;
    background: var(--primary-color);
    border-radius: 50%;
    top: 0.85em;
    left: -1em;
  }
}

.friends {
  display: flex;
  flex-wrap: wrap;
  font-size: 0.9rem;
}

.friend-item {
  display: inline-flex;
  align-items: center;
  width: calc(50% - 2rem);
  margin: 1rem;
  padding: 0.5rem 1rem;
  line-height: 1.5;
  border-radius: 0.5rem;
  border: 0.0625rem solid var(--grey-2);
  box-shadow: 0 0.625rem 1.875rem -0.9375rem var(--box-bg-shadow);
  transition: all 0.2s ease-in-out 0s;

  &:hover {
    box-shadow: 0 0 2rem var(--box-bg-shadow);
    transform: translateY(-5px);
  }

  .image {
    display: block;
    width: 4rem;
    height: 4rem;
    border-radius: 0.9375rem;
  }

  .info {
    padding-left: 1rem;
  }

  .name {
    font-weight: 700;
  }

  .desc {
    font-size: 0.75em;
    margin: 0.5rem 0;
  }
}

@keyframes rotate {
  0% {
    transform: rotate(0);
  }

  100% {
    transform: rotate(360deg);
  }
}

@media (max-width: 767px) {
  .friend-item {
    width: calc(100% - 2rem);
  }
}

@media (max-width: 768px) {
  .page-title {
    font-size: 2rem !important;
  }
  
  .page-container {
    padding: 1.5rem;
  }
}
</style> 