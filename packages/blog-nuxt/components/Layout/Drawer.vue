<template>
  <div>
    <ClientOnly>
      <!-- 使用简单的遮罩层，直接通过CSS来控制其显示和淡入淡出 -->
      <div class="drawer-overlay" :class="{ 'active': isOpen }" @click="closeDrawer"></div>
      
      <!-- 使用简单的CSS类控制抽屉面板的滑入滑出 -->
      <div class="drawer-panel" :class="{ 'open': isOpen }">
        <div class="drawer-content">
          <div class="author-container">
            <img class="author-avatar" :src="blog.blogInfo.siteConfig.authorAvatar" />
            <p class="author-name">{{ blog.blogInfo.siteConfig.siteAuthor }}</p>
            <div class="site-desc">{{ blog.blogInfo.siteConfig.siteIntro }}</div>
          </div>
          <LazyBlogInfo />
          <LazySocialList />
          <ul class="side-menu">
            <template v-for="(menu, index) of menuList">
              <li v-if="!menu.children" :key="index" class="item" :class="{ active: route.path === menu.path }">
                <NuxtLink :to="menu.path" @click="closeDrawer">
                  <SvgIcon :icon-class="menu.icon" /> {{ menu.name }}
                </NuxtLink>
              </li>
              <li v-else :key="`menu-${index}`" class="item dropdown" :class="{ expand: isExpanded(menu.children) }">
                <a><SvgIcon :icon-class="menu.icon" /> {{ menu.name }} </a>
                <ul class="submenu">
                  <li class="item" v-for="(submenu, subIndex) of menu.children" :key="subIndex"
                    :class="{ active: route.path === submenu.path }">
                    <NuxtLink :to="submenu.path" @click="closeDrawer">
                      <SvgIcon :icon-class="submenu.icon" /> {{ submenu.name }}
                    </NuxtLink>
                  </li>
                </ul>
              </li>
            </template>
            <li class="item" v-if="!user.userInfo.id">
              <a @click="loginAndClose">
                <SvgIcon icon-class="user" /> 登录
              </a>
            </li>
            <template v-else>
              <li class="item" :class="{ active: route.path === '/user' }">
                <NuxtLink to="/user" @click="closeDrawer">
                  <SvgIcon icon-class="author" /> 个人中心
                </NuxtLink>
              </li>
              <li class="item">
                <a @click="logout">
                  <SvgIcon icon-class="logout" /> 退出
                </a>
              </li>
            </template>
          </ul>
        </div>
      </div>
    </ClientOnly>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useAppStore, useBlogStore, useUserStore } from '../../composables/useStores';

// 获取路由和store
const route = useRoute();
const router = useRouter();
const app = useAppStore();
const blog = useBlogStore();
const user = useUserStore();

// 创建本地状态，避免直接依赖store
const isOpen = ref(false);

// 窗口大小变化处理
onMounted(() => {
  // 同步初始状态
  isOpen.value = app.isCollapse;
  
  // 监听窗口大小变化
  window.addEventListener('resize', handleResize);
  
  // 当抽屉打开时，禁止页面滚动
  watch(isOpen, (newVal) => {
    if (newVal) {
      document.body.style.overflow = 'hidden';
    } else {
      // 延迟释放滚动锁定，等待动画完成
      setTimeout(() => {
        document.body.style.overflow = '';
      }, 300);
    }
  });
});

// 清理事件监听
onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  document.body.style.overflow = '';
});

// 处理窗口大小变化
function handleResize() {
  if (window.innerWidth > 991 && isOpen.value) {
    closeDrawer();
  }
}

// 与store保持单向同步
watch(() => app.isCollapse, (newVal) => {
  if (isOpen.value !== newVal) {
    isOpen.value = newVal;
  }
});

// 监听Drawer状态变化，同步到App
watch(isOpen, (newVal) => {
  if (app.isCollapse !== newVal) {
    app.isCollapse = newVal;
  }
});

// 判断子菜单是否展开
const isExpanded = computed(() => (submenus) => {
  if (!route.meta || !route.meta.title) return false;
  return submenus.some(item => item.name === route.meta.title);
});

// 菜单数据
const menuList = [
  {
    name: "首页",
    icon: "home",
    path: "/"
  },
  {
    name: "文章",
    icon: "article",
    children: [
      {
        name: "归档",
        icon: "archives",
        path: "/archive"
      },
      {
        name: "分类",
        icon: "category",
        path: "/category"
      },
      {
        name: "标签",
        icon: "tag",
        path: "/tag"
      },
    ]
  },
  {
    name: "娱乐",
    icon: "fun",
    children: [
      {
        name: "说说",
        icon: "talk",
        path: "/talk"
      },
      {
        name: "相册",
        icon: "album",
        path: "/album"
      },
      {
        name: "图床",
        icon: "upload",
        path: "/picture"
      },
    ]
  },
  {
    name: "友链",
    icon: "friend",
    path: "/friend"
  },
  {
    name: "留言板",
    icon: "message",
    path: "/message"
  },
  {
    name: "关于",
    icon: "plane",
    path: "/about"
  },
];

// 关闭抽屉
function closeDrawer() {
  isOpen.value = false;
}

// 登录并关闭抽屉
function loginAndClose() {
  closeDrawer();
  
  // 延迟显示登录框，等待抽屉动画完成
  setTimeout(() => {
    app.loginDialogVisible = true;
  }, 300);
}

// 退出登录
function logout() {
  if (route.path === "/user") {
    router.go(-1);
  }
  
  user.logout();
  closeDrawer();
  
  setTimeout(() => {
    if (typeof window !== 'undefined' && window.$message) {
      window.$message.success('退出成功');
    }
  }, 300);
}
</script>

<style lang="scss" scoped>
// 抽屉遮罩层 - 简化过渡效果
.drawer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  backdrop-filter: blur(2px);
  z-index: 99;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;
  
  &.active {
    opacity: 1;
    visibility: visible;
  }
}

// 抽屉面板 - 优化滑动动画
.drawer-panel {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 280px;
  background-color: var(--grey-1);
  box-shadow: -5px 0 15px rgba(0, 0, 0, 0.2);
  z-index: 100;
  transform: translateX(100%);
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform; // 启用硬件加速
  
  &.open {
    transform: translateX(0);
  }
}

// 抽屉内容
.drawer-content {
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  padding: 0 0.5rem;
}

// 作者容器
.author-container {
  margin: 1.5rem 0;
  text-align: center;
  padding: 0 1rem;
}

.author-avatar {
  width: 6rem;
  height: 6rem;
  border-radius: 50%;
  margin: 0 auto;
  display: block;
  object-fit: cover;
  transition: transform 0.6s cubic-bezier(0.23, 1, 0.32, 1);
  
  &:hover {
    transform: rotate(360deg);
  }
}

.author-name {
  font-size: 1.2rem;
  font-weight: bold;
  margin-top: 0.75rem;
  color: var(--text-color);
}

.site-desc {
  font-size: 0.9rem;
  color: var(--text-color-2);
  margin-top: 0.5rem;
  padding: 0 1rem;
  line-height: 1.5;
}

// 侧边菜单
.side-menu {
  padding: 0.5rem 0.5rem 1.5rem;
  
  .item {
    position: relative;
    color: var(--grey-5);
    border-radius: 0.9375rem;
    margin-bottom: 0.625rem;
    transition: all 0.2s cubic-bezier(0.23, 1, 0.32, 1);
    cursor: pointer;
    
    a {
      display: block;
      padding: 0.5rem 1rem;
      line-height: 1.5;
    }
    
    &:hover {
      background-color: rgba(0, 0, 0, 0.1);
      color: var(--text-color);
    }
    
    &.active {
      color: var(--grey-0);
      background-image: linear-gradient(to right, var(--color-pink) 0, var(--color-orange) 100%);
      box-shadow: 0 0 0.75rem var(--color-pink-a3);
      
      &:hover {
        color: var(--grey-0);
        box-shadow: 0 0 0.75rem var(--color-pink);
      }
    }
  }
  
  .dropdown {
    .submenu {
      margin-top: 0.25rem;
      margin-bottom: 0.5rem;
      display: none;
      
      .item {
        margin-left: 1rem;
        font-size: 0.9rem;
      }
    }
    
    &.expand, &:hover {
      .submenu {
        display: block;
      }
    }
  }
}

// 暗色模式调整
:global(.dark) {
  .side-menu .item:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
  
  .drawer-panel {
    box-shadow: -5px 0 15px rgba(0, 0, 0, 0.5);
  }
}
</style> 