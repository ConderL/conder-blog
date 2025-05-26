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
                  <UIcon :name="'icon:' + menu.icon" class="menu-icon" /> {{ menu.name }}
                </NuxtLink>
            </li>
              <li v-else :key="`menu-${index}`" class="item dropdown" :class="{ expand: isExpanded(menu.children) }">
                <a><UIcon :name="'icon:' + menu.icon" class="menu-icon" /> {{ menu.name }} </a>
              <ul class="submenu">
                  <li class="item" v-for="(submenu, subIndex) of menu.children" :key="subIndex"
                  :class="{ active: route.path === submenu.path }">
                    <NuxtLink :to="submenu.path" @click="closeDrawer">
                      <UIcon :name="'icon:' + submenu.icon" class="menu-icon" /> {{ submenu.name }}
                  </NuxtLink>
                </li>
              </ul>
            </li>
          </template>
            <li class="item" v-if="!user.userInfo.id">
              <a @click="loginAndClose">
                <UIcon name="icon:user" class="menu-icon" /> 登录
              </a>
          </li>
          <template v-else>
            <li class="item" :class="{ active: route.path === '/user' }">
              <NuxtLink to="/user" @click="closeDrawer">
                  <UIcon name="icon:author" class="menu-icon" /> 个人中心
              </NuxtLink>
            </li>
            <li class="item">
                <a @click="logout">
                  <UIcon name="icon:logout" class="menu-icon" /> 退出
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
  transform: translateX(100%);
  background-color: var(--bg-color);
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  z-index: 100;
  overflow-y: auto;
  overflow-x: hidden;
  
  &.open {
    transform: translateX(0);
  }
}

.drawer-content {
  padding: 1.25rem;
}

.author-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid var(--border-color);
}

.author-avatar {
  width: 6.25rem;
  height: 6.25rem;
  border-radius: 50%;
  margin-bottom: 0.9375rem;
  object-fit: cover;
  border: 0.125rem solid var(--grey-1);
  background-color: var(--bg-color);
}

.author-name {
  font-size: 1.25rem;
  font-weight: 500;
  color: var(--header-text-color);
  margin-bottom: 0.625rem;
}

.site-desc {
  font-size: 0.875rem;
  color: var(--grey-5);
  text-align: center;
  line-height: 1.4;
}

// 侧边菜单样式
.side-menu {
  margin: 0;
  padding: 0;
  list-style: none;
  
  .item {
    position: relative;
    
    a {
      display: flex;
      align-items: center;
      padding: 0.625rem 0.9375rem;
      color: var(--header-text-color);
      border-radius: 0.3125rem;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.2s ease;
      
      &:hover {
        background-color: var(--grey-1);
      }
    }
    
    &.active > a {
      background-color: var(--color-pink-a1);
      color: var(--color-pink);
    }
  }
  
  // 下拉菜单样式
  .dropdown {
    > a::after {
      content: "\f105";
      font-family: "Font Awesome 5 Free";
      font-weight: 900;
      margin-left: auto;
      transition: transform 0.3s ease;
    }
    
    .submenu {
      max-height: 0;
      overflow: hidden;
      list-style: none;
      padding-left: 1.25rem;
      transition: max-height 0.3s ease;
    }
    
    &.expand {
      > a::after {
        transform: rotate(90deg);
      }
      
      .submenu {
        max-height: 12.5rem;
      }
    }
  }
}

.menu-icon {
  width: 1rem;
  height: 1rem;
  margin-right: 0.625rem;
}

@media (max-width: 767px) {
  .drawer-panel {
    width: 100%;
    max-width: 320px;
  }
}
</style> 