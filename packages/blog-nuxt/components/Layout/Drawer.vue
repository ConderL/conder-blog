<template>
  <UDrawer
    v-model:open="isOpen"
    direction="right"
    :overlay="true"
    :title="blog.blogInfo.siteConfig?.siteName"
    :description="blog.blogInfo.siteConfig?.aboutMe"
  >
    <!-- 触发按钮在 NavBar 组件中，这里不需要默认插槽内容 -->
    <template #content>
        <div class="drawer-content">
        <div class="author-container">
            <img class="author-avatar" :src="blog.blogInfo.siteConfig.authorAvatar" />
            <p class="author-name">{{ blog.blogInfo.siteConfig.siteAuthor }}</p>
            <div class="site-desc">{{ blog.blogInfo.siteConfig.siteIntro }}</div>
        </div>
        <LazyBlogInfo />
        <LazySocialList />
        <ul class="side-menu">
          <template v-for="(menu, index) of menuList" :key="index">
            <li v-if="!menu.children" class="item cursor-pointer" :class="{ active: route.path === menu.path }">
                <NuxtLink :to="menu.path" @click="closeDrawer">
                  <UIcon :name="'icon:' + menu.icon" class="menu-icon" /> {{ menu.name }}
                </NuxtLink>
            </li>
              <li v-else :key="`menu-${index}`" class="item dropdown" :class="{ expand: isExpanded(menu.children) }">
                <a><UIcon :name="'icon:' + menu.icon" class="menu-icon" /> {{ menu.name }} </a>
              <div class="submenu-wrapper">
                <div class="submenu-content">
              <ul class="submenu">
                  <li
v-for="(submenu, subIndex) of menu.children" :key="subIndex" class="item"
                  :class="{ active: route.path === submenu.path }">
                    <NuxtLink :to="submenu.path" @click="closeDrawer">
                      <UIcon :name="'icon:' + submenu.icon" class="menu-icon" /> {{ submenu.name }}
                  </NuxtLink>
                </li>
              </ul>
                </div>
              </div>
            </li>
          </template>
            <li v-if="!user.userInfo.id" class="item">
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
    </template>
  </UDrawer>
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
});

// 清理事件监听
onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
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
        path: "/archives"
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
      }
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
    app.setLoginFlag(true);
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
.drawer-content {
  padding: 3rem;
  height: 100%;
  overflow-y: auto;
}

.author-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.author-avatar {
  border-radius: 50%;
  margin-bottom: 0.9375rem;
  object-fit: cover;
  border: 0.125rem solid var(--grey-1);
  background-color: var(--grey-7);
}

.author-name {
  margin-top: 0.5rem;
  font-weight: 500;
  color: var(--grey-7);
}

.site-desc {
  font-size: 0.875rem;
  color: var(--grey-5);
  text-align: center;
  line-height: 1.4;
}

// 侧边菜单样式
.side-menu {
  margin-top: 1rem;
  list-style: none;
  text-align: center;
  line-height: 2.5;
  background-color: transparent;
  animation: sidebarItem 0.8s;
  
  .item {
    color: var(--grey-5);
    border-radius: 0.9375rem;
    margin-bottom: 0.625rem;
    transition: all 0.2s ease-in-out 0s;
    
    a {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.3rem 0.7rem;
      color: inherit;
      
      &:hover {
        color: inherit;
      }
    }
    
    &:hover {
      background-color: rgba(0, 0, 0, 0.1);
      color: inherit;
      
      .submenu-wrapper {
        grid-template-rows: 1fr;
      }
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
}

.submenu-wrapper {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.3s ease-out;
    }
    
.submenu-content {
      overflow: hidden;
}

.submenu {
  padding-left: 0;
    }
    
.item.expand {
  background-color: rgba(0, 0, 0, 0.05);
      }
      
.item.expand .submenu-wrapper {
  grid-template-rows: 1fr;
}

.menu-icon {
  width: 1rem;
  height: 1rem;
  margin-right: 0.5rem;
}

@keyframes sidebarItem {
  0% {
    transform: translateX(200px);
  }
  100% {
    transform: translateX(0);
  }
}
</style> 