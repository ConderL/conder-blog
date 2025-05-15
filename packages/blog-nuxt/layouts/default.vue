<template>
  <div class="layout-default">
    <!-- 页面头部 -->
    <header class="header">
      <div class="container">
        <div class="header-content">
          <div class="logo">
            <NuxtLink to="/" class="logo-link">
              <span class="logo-text">博客网站</span>
            </NuxtLink>
          </div>
          
          <nav class="nav">
            <ul class="nav-list">
              <li class="nav-item">
                <NuxtLink to="/" class="nav-link">首页</NuxtLink>
              </li>
              <li class="nav-item">
                <NuxtLink to="/category" class="nav-link">分类</NuxtLink>
              </li>
              <li class="nav-item">
                <NuxtLink to="/tag" class="nav-link">标签</NuxtLink>
              </li>
              <li class="nav-item">
                <NuxtLink to="/archive" class="nav-link">归档</NuxtLink>
              </li>
              <li class="nav-item">
                <NuxtLink to="/about" class="nav-link">关于</NuxtLink>
              </li>
            </ul>
          </nav>
          
          <div class="mobile-toggle" @click="toggleMobileMenu">
            <span class="toggle-icon"></span>
          </div>
        </div>
      </div>
      
      <!-- 移动端菜单 -->
      <div class="mobile-menu" :class="{ 'is-active': isMobileMenuActive }">
        <div class="container">
          <ul class="mobile-nav-list">
            <li class="mobile-nav-item">
              <NuxtLink to="/" class="mobile-nav-link" @click="closeMobileMenu">首页</NuxtLink>
            </li>
            <li class="mobile-nav-item">
              <NuxtLink to="/category" class="mobile-nav-link" @click="closeMobileMenu">分类</NuxtLink>
            </li>
            <li class="mobile-nav-item">
              <NuxtLink to="/tag" class="mobile-nav-link" @click="closeMobileMenu">标签</NuxtLink>
            </li>
            <li class="mobile-nav-item">
              <NuxtLink to="/archive" class="mobile-nav-link" @click="closeMobileMenu">归档</NuxtLink>
            </li>
            <li class="mobile-nav-item">
              <NuxtLink to="/about" class="mobile-nav-link" @click="closeMobileMenu">关于</NuxtLink>
            </li>
          </ul>
        </div>
      </div>
    </header>
    
    <!-- 页面主体内容 -->
    <main class="main">
      <slot />
    </main>
    
    <!-- 页面底部 -->
    <footer class="footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-info">
            <p class="copyright">© {{ new Date().getFullYear() }} 博客网站 All Rights Reserved.</p>
            <p class="powered">Powered by Nuxt.js</p>
          </div>
          
          <div class="footer-links">
            <a href="https://github.com" target="_blank" class="footer-link" title="GitHub">
              <span class="link-icon">GitHub</span>
            </a>
            <a href="https://twitter.com" target="_blank" class="footer-link" title="Twitter">
              <span class="link-icon">Twitter</span>
            </a>
            <a href="mailto:example@example.com" class="footer-link" title="Email">
              <span class="link-icon">Email</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// 移动端菜单状态
const isMobileMenuActive = ref(false);

// 切换移动端菜单
const toggleMobileMenu = () => {
  isMobileMenuActive.value = !isMobileMenuActive.value;
  
  // 切换body滚动锁定，防止滚动
  if (isMobileMenuActive.value) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
};

// 关闭移动端菜单
const closeMobileMenu = () => {
  isMobileMenuActive.value = false;
  document.body.style.overflow = '';
};
</script>

<style scoped>
.layout-default {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* 页头样式 */
.header {
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 70px;
}

.logo-link {
  display: flex;
  align-items: center;
  text-decoration: none;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
}

.nav-list {
  display: flex;
  list-style: none;
}

.nav-item {
  margin-left: 1.5rem;
}

.nav-link {
  display: block;
  padding: 0.5rem;
  color: #555;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: #0070f3;
}

.mobile-toggle {
  display: none;
  cursor: pointer;
  width: 30px;
  height: 30px;
  position: relative;
}

.toggle-icon,
.toggle-icon:before,
.toggle-icon:after {
  content: '';
  display: block;
  width: 100%;
  height: 2px;
  background-color: #333;
  position: absolute;
  transition: all 0.3s;
}

.toggle-icon {
  top: 50%;
  transform: translateY(-50%);
}

.toggle-icon:before {
  top: -10px;
}

.toggle-icon:after {
  bottom: -10px;
}

.mobile-menu {
  display: none;
  position: fixed;
  top: 70px;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #fff;
  z-index: 99;
  transform: translateY(-100%);
  opacity: 0;
  transition: opacity 0.3s, transform 0s 0.3s;
  overflow-y: auto;
}

.mobile-menu.is-active {
  transform: translateY(0);
  opacity: 1;
  transition: opacity 0.3s, transform 0s;
}

.mobile-nav-list {
  padding: 2rem 0;
  list-style: none;
}

.mobile-nav-item {
  margin-bottom: 1rem;
}

.mobile-nav-link {
  display: block;
  padding: 1rem 0;
  font-size: 1.2rem;
  color: #333;
  text-decoration: none;
  border-bottom: 1px solid #eee;
}

/* 主体内容 */
.main {
  flex: 1;
}

/* 页脚样式 */
.footer {
  background-color: #fff;
  padding: 2rem 0;
  margin-top: 3rem;
  border-top: 1px solid #eee;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-info {
  color: #666;
}

.copyright {
  margin-bottom: 0.5rem;
}

.powered {
  font-size: 0.9rem;
}

.footer-links {
  display: flex;
  gap: 1rem;
}

.footer-link {
  color: #555;
  font-size: 0.9rem;
  text-decoration: none;
  transition: color 0.3s;
}

.footer-link:hover {
  color: #0070f3;
}

/* 响应式样式 */
@media (max-width: 768px) {
  .nav {
    display: none;
  }
  
  .mobile-toggle {
    display: block;
  }
  
  .mobile-menu {
    display: block;
  }
  
  .footer-content {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
}
</style> 