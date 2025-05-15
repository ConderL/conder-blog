<template>
  <div class="test-page">
    <Header />
    
    <main class="main-content">
      <div class="container">
        <h1 class="title">组件测试页面</h1>
        
        <div class="card">
          <h2>SvgIcon组件测试</h2>
          <div class="icon-demo">
            <SvgIcon icon-class="home" size="2rem" color="var(--color-pink)" />
            <SvgIcon icon-class="tag" size="2rem" color="var(--color-blue)" />
            <SvgIcon icon-class="category" size="2rem" color="var(--color-green)" />
          </div>
        </div>
        
        <div class="card">
          <h2>Pagination组件测试</h2>
          <Pagination :current="currentPage" :total="totalPages" @update:current="handlePageChange" />
        </div>
        
        <div class="card">
          <h2>用户状态管理测试</h2>
          <div class="demo-box">
            <div class="user-info" v-if="userStore.isLogin">
              <p>用户状态: 已登录</p>
              <p v-if="userStore.userInfo">用户信息:</p>
              <ul v-if="userStore.userInfo">
                <li>ID: {{ userStore.userInfo.id }}</li>
                <li>用户名: {{ userStore.userInfo.username }}</li>
                <li>昵称: {{ userStore.userInfo.nickname }}</li>
                <li>邮箱: {{ userStore.userInfo.email }}</li>
                <li>头像: <img v-if="userStore.userInfo.avatar" :src="userStore.userInfo.avatar" class="avatar" /></li>
              </ul>
            </div>
            <div v-else>
              <p>当前未登录</p>
            </div>
            
            <div class="actions">
              <button class="btn" @click="mockLogin">模拟登录</button>
              <button class="btn" @click="userStore.logout">退出登录</button>
            </div>
          </div>
        </div>

        <div class="card">
          <h2>评论组件测试</h2>
          <ReplyBox comment-type="1" :type-id="1" @reload="handleReload" />
        </div>

        <section class="test-section">
          <h2>全局变量测试</h2>
          <p>当前路由: {{ route.path }}</p>
          <p>配置信息: {{ config.public.apiBase }}</p>
        </section>

        <section class="test-section">
          <h2>路由导航</h2>
          <div class="nav-links">
            <NuxtLink to="/">首页</NuxtLink>
            <NuxtLink to="/about">关于</NuxtLink>
            <NuxtLink to="/archive">归档</NuxtLink>
          </div>
        </section>
      </div>
    </main>
    
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useUserStore } from '../stores/user';
import { useBlogStore } from '../stores/blog';
// Nuxt会自动导入组件，不需要手动导入ReplyBox

// 页面标题设置
// @ts-ignore - Nuxt自动导入
useHead({
  title: '组件测试页面 - 博客网站',
  meta: [
    { name: 'description', content: '这是一个用于测试Nuxt组件的页面' }
  ]
});

// 状态
const currentPage = ref(1);
const totalPages = ref(10);
const userStore = useUserStore();
const blogStore = useBlogStore();
// @ts-ignore - Nuxt自动导入
const route = useRoute();
// @ts-ignore - Nuxt自动导入
const config = useRuntimeConfig();

// 处理页码变化
const handlePageChange = (page: number) => {
  currentPage.value = page;
  console.log('页面已切换到:', page);
};

// 模拟登录
function mockLogin() {
  userStore.setUserInfo({
    id: 1,
    username: 'testuser',
    nickname: '测试用户',
    avatar: 'https://picsum.photos/id/64/200/200',
    email: 'test@example.com',
    intro: '这是测试用户简介',
    website: 'https://example.com',
    roleList: ['user']
  });
  userStore.setToken('test-token');
}

// 处理评论重新加载
const handleReload = () => {
  console.log('评论已刷新');
};
</script>

<style lang="scss" scoped>
.test-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding: 5rem 1rem 2rem;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.title {
  margin-bottom: 2rem;
  font-size: 2rem;
  text-align: center;
}

.card {
  background-color: var(--card-bg);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  
  h2 {
    margin-bottom: 1.5rem;
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 0.75rem;
  }
}

.demo-box {
  .user-info {
    margin-bottom: 1.5rem;

    ul {
      margin-left: 1.5rem;
      
      .avatar {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        vertical-align: middle;
      }
    }
  }
  
  .actions {
    margin-top: 1rem;
  }
}

.icon-demo {
  display: flex;
  gap: 2rem;
}

.btn {
  background-color: var(--color-pink);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 0.5rem;
  transition: all 0.2s ease;
  
  &:hover {
    opacity: 0.9;
  }
}

.test-section {
  margin-bottom: 2.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px dashed var(--border-color);
  
  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }
  
  h2 {
    margin-bottom: 1rem;
    font-size: 1.5rem;
    color: var(--heading-color);
  }
}

.nav-links {
  display: flex;
  gap: 1rem;
  
  a {
    padding: 0.5rem 1rem;
    background-color: var(--grey-1);
    border-radius: 4px;
    color: var(--text-color);
    text-decoration: none;
    transition: all 0.3s ease;
    
    &:hover, &.router-link-active {
      background-color: var(--color-pink);
      color: white;
    }
  }
}
</style> 