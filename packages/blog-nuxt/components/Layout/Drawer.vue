<template>
  <div>
    <ClientOnly>
      <USlideover 
        v-model="drawerVisible" 
        :width="240" 
        side="right" 
        class="side-bg" 
        :overlay="true"
        :ui="{ overlay: { background: 'bg-gray-500/50 backdrop-blur-sm' } }"
        preserve-scroll>
        <div class="author-container">
          <img class="author-avatar" :src="blogStoreObj.blogInfo.siteConfig.authorAvatar" />
          <p class="author-name">{{ blogStoreObj.blogInfo.siteConfig.siteAuthor }}</p>
          <div class="site-desc">{{ blogStoreObj.blogInfo.siteConfig.siteIntro }}</div>
        </div>
        <LazyBlogInfo />
        <LazySocialList />
        <ul class="side-menu">
          <template v-for="menu of menuList" :key="menu.name">
            <li v-if="!menu.children" class="item" :class="{ active: route.path === menu.path }">
              <NuxtLink :to="menu.path" @click="closeDrawer"><SvgIcon :icon-class="menu.icon" /> {{ menu.name }} </NuxtLink>
            </li>
            <li v-else class="item dropdown" :class="{ expand: expand(menu.children) }">
              <a><SvgIcon :icon-class="menu.icon" /> {{ menu.name }} </a>
              <ul class="submenu">
                <li class="item" v-for="submenu of menu.children" :key="submenu.name"
                  :class="{ active: route.path === submenu.path }">
                  <NuxtLink :to="submenu.path" @click="closeDrawer"> <SvgIcon :icon-class="submenu.icon" /> {{ submenu.name }}
                  </NuxtLink>
                </li>
              </ul>
            </li>
          </template>
          <li class="item" v-if="!userStoreObj.userInfo.id">
            <a @click="loginAndClose"> <SvgIcon icon-class="user" /> 登录 </a>
          </li>
          <template v-else>
            <li class="item" :class="{ active: route.path === '/user' }">
              <NuxtLink to="/user" @click="closeDrawer">
                <SvgIcon icon-class="author" /> 个人中心
              </NuxtLink>
            </li>
            <li class="item">
              <a @click="logout"> <SvgIcon icon-class="logout" /> 退出 </a>
            </li>
          </template>
        </ul>
      </USlideover>
    </ClientOnly>
  </div>
</template>

<script setup>
// 导入Vue核心功能
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { useWindowSize } from '@vueuse/core';

// 导入 store
import { useAppStore, useBlogStore, useUserStore } from '../../composables/useStores';

// 在这里声明路由相关的变量
const route = useRoute();
const router = useRouter();
const appStoreObj = useAppStore();
const blogStoreObj = useBlogStore();
const userStoreObj = useUserStore();
const { width } = useWindowSize();

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

// 判断子菜单是否展开，使用简化方法
const expand = computed(() => (value) => {
  if (!route.meta.title) return false;
  return value.some((item) => item.name === route.meta.title);
});

// 关键修复：直接使用原始ref，性能更好
const drawerVisible = ref(false);

// 使用nextTick确保状态更新后再触发DOM更新
// 修复：分离关注点，避免双向同步导致的循环更新问题
watch(drawerVisible, (newVal) => {
  // 使用nextTick延迟执行状态更新，避免UI堆叠更新
  nextTick(() => {
    appStoreObj.isCollapse = newVal;
  });
}, { flush: 'post' }); // 使用post时机更新，减少渲染冲突

// 单向监听store状态变化，避免循环触发
watch(() => appStoreObj.isCollapse, (newVal) => {
  if (drawerVisible.value !== newVal) {
    drawerVisible.value = newVal;
  }
}, { immediate: true });

// 修复:监听窗口宽度变化，只在宽度变大时关闭抽屉
let oldWidth = ref(0);
onMounted(() => {
  oldWidth.value = width.value;
});

watch(width, (newWidth) => {
  // 只在窗口从小变大且超过991px时关闭抽屉
  if (newWidth > 991 && oldWidth.value <= 991 && drawerVisible.value) {
    // 直接修改状态，避免走store更新路径
    drawerVisible.value = false;
    // 确保store状态同步，但避免触发更新循环
    nextTick(() => {
      appStoreObj.isCollapse = false;
    });
  }
  oldWidth.value = newWidth;
});

// 关闭抽屉的函数 - 关键优化点，直接修改状态
const closeDrawer = () => {
  drawerVisible.value = false;
  // 延迟更新store状态，避免DOM更新冲突
  nextTick(() => {
    appStoreObj.isCollapse = false;
  });
};

// 登录并关闭抽屉
const loginAndClose = () => {
  closeDrawer(); // 先关闭抽屉
  nextTick(() => { // 等抽屉关闭动画开始后再显示登录弹窗
    appStoreObj.loginDialogVisible = true;
  });
};

// 注销
const logout = () => {
  if (route.path === "/user") {
    router.go(-1);
  }
  userStoreObj.logout();
  closeDrawer();
  
  // 使用全局消息API
  nextTick(() => {
    if (typeof window !== 'undefined' && window.$message) {
      window.$message.success('退出成功');
    }
  });
};

defineExpose({
  name: 'Drawer'
});
</script>

<style lang="scss" scoped>
.side-menu {
  text-align: center;
  line-height: 3;
  padding: 1rem 1rem 1.25rem;
  background-color: transparent;
  contain: content; /* 提高渲染性能 */

  .item {
    color: var(--grey-5);
    border-radius: 0.9375rem;
    margin-bottom: 0.625rem;
    transition: background-color 0.2s ease-out; /* 简化过渡属性 */
    cursor: pointer;
    contain: content; /* 提高元素渲染性能 */

    &:hover {
      background-color: rgba(0, 0, 0, 0.1);
      color: inherit;

      .submenu {
        display: block;
      }
    }

    .submenu {
      display: none;
    }
  }
}

.item.expand {
  background-color: rgba(0, 0, 0, 0.05);
}

.item.expand .submenu {
  display: block;
}

.item.active {
  color: var(--grey-0);
  background-image: linear-gradient(to right, var(--color-pink) 0, var(--color-orange) 100%);
  box-shadow: 0 0 0.75rem var(--color-pink-a3);

  &:hover {
    color: var(--grey-0);
    box-shadow: 0 0 0.75rem var(--color-pink);
  }
}

/* 优化Slideover组件的样式 */
:deep(.slideover-container) {
  background-color: var(--bg-color);
  transform: translateZ(0); /* 启用硬件加速 */
  contain: layout; /* 提升渲染性能 */
  backface-visibility: hidden; /* 提升渲染性能 */
}

/* 防止子元素动画影响父级性能 */
:deep(.slideover-overlay) {
  will-change: opacity;
  backdrop-filter: blur(4px);
}

.author-container {
  margin-bottom: 1rem;
  text-align: center;
}

.author-avatar {
  width: 6rem;
  height: 6rem;
  border-radius: 50%;
  margin: 0 auto;
  display: block;
}

.author-name {
  font-size: 1.2rem;
  font-weight: bold;
  margin-top: 0.5rem;
}

.site-desc {
  font-size: 0.9rem;
  color: var(--text-color-2);
  margin-top: 0.5rem;
  padding: 0 1rem;
}
</style> 