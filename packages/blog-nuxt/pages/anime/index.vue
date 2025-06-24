<template>
  <div class="anime-page">
    <div class="page-header">
      <h1 class="page-title">追番列表</h1>
      <img class="page-cover" :src="blog.blogInfo?.siteConfig?.albumWallpaper || ''" alt="">
      <!-- 波浪 -->
      <Waves></Waves>
    </div>
    <div class="bg">
      <div class="page-container">
        <div class="anime-content">
          <!-- Tabs组件 - 状态筛选 -->
          <UTabs v-model="activeTab" :items="tabItems" class="w-full mb-4" />
          
          <!-- Tabs组件 - 地区筛选 -->
          <UTabs v-model="activeAreaTab" :items="areaTabItems" class="w-full mb-4" />
          
          <!-- 平台筛选和排序控制 -->
          <div class="sm:flex justify-between items-center w-full mb-4">
            <!-- Tabs组件 - 平台筛选 -->
            <UTabs v-model="activePlatformTab" :items="platformTabItems" class="flex-grow" />
            
            <!-- 排序下拉框 - 自定义样式 -->
            <div class="sort-dropdown menu-item dropdown">
              <a class="menu-btn drop">
                <UIcon name="i-icon-sort" class="icon" />
                {{ getSortLabel(sortBy) }}
              </a>
              <ul class="submenu">
                <li v-for="option in sortOptions" :key="option.value" 
                    class="subitem" 
                    :class="{ active: sortBy === option.value }"
                    @click="changeSortOption(option.value)">
                  <a class="link">
                    <UIcon :name="getSortIcon(option.value)" class="icon" />
                    {{ option.label }}
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          <!-- 在番剧列表前添加Alert组件 -->
          <UAlert
            type="warning"
            title="接口说明"
            description="bilibili接口已开放权限可以实时更新番剧信息，而其他视频平台接口采取了反爬虫措施，可获取的有效数据有限，目前暂时无法实现数据的实时同步更新，因此采用静态数据展示。"
            class="mb-4"
          />
          
          <!-- 番剧列表组件 -->
          <AnimeList 
            v-model:queryParams="queryParams"
            :emptyText="'暂无符合条件的番剧'"
            @collected="handleCollected"
            @uncollected="handleUncollected"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBlogStore } from "~/stores/blog";
import { useUserStore } from "~/stores/user";
import type { TabsItem } from '@nuxt/ui';
import AnimeList from '~/components/Anime/AnimeList.vue';
import { ref, onMounted, onUnmounted } from 'vue';

// 定义页面元数据
definePageMeta({
  title: '追番'
});

// 注入
const { $message } = useNuxtApp();
const user = useUserStore();

// 状态枚举
const WATCH_STATUS = {
  WANT_TO_WATCH: 1, // 想看
  WATCHING: 2,      // 在看
  WATCHED: 3,       // 已看
};

const ANIME_STATUS = {
  ONGOING: 1,       // 连载中
  FINISHED: 2,      // 已完结
};

// 博客store
const blog = useBlogStore();

// 查询参数
const queryParams = reactive({
  page: 1,
  limit: 10,
  animeName: '',
  platform: undefined as number | undefined,
  animeStatus: undefined as number | undefined,
  watchStatus: undefined as number | undefined,
  sortBy: 'rating', // 默认按评分排序
  area: undefined as number | undefined
});

// 吸顶相关状态
const isScrolled = ref(false);
const filterContainerTop = ref(0);

// 当前激活的标签
const activeTab = ref('all');

// 标签选项
const tabItems: TabsItem[] = [
  { label: '全部', value: 'all' },
  { label: '想看', value: 'want-to-watch' },
  { label: '在看', value: 'watching' },
  { label: '已看', value: 'watched' },
  { label: '连载中', value: 'ongoing' },
  { label: '已完结', value: 'finished' }
];

// 当前激活的平台标签
const activePlatformTab = ref('all');

// 当前激活的地区标签
const activeAreaTab = ref('all');

// 平台标签选项
const platformTabItems: TabsItem[] = [
  { label: '全部', value: 'all' },
  { label: 'bilibili', value: '1' },
  { label: '腾讯视频', value: '2' },
  { label: '爱奇艺', value: '3' },
  { label: '优酷', value: '4' }
];

// 地区标签选项
const areaTabItems: TabsItem[] = [
  { label: '全部', value: 'all' },
  { label: '国漫', value: '1' },
  { label: '日漫', value: '2' },
  { label: '美漫', value: '3' }
];

// 排序相关
const sortBy = ref('rating');
const sortOptions = [
  { label: '按评分', value: 'rating' },
  { label: '按发布时间', value: 'publishTime' }
];

// 获取排序选项标签
const getSortLabel = (value) => {
  const option = sortOptions.find(opt => opt.value === value);
  return option ? option.label : '排序方式';
};

// 获取排序图标
const getSortIcon = (value) => {
  const iconMap = {
    'rating': 'i-icon-star',
    'publishTime': 'i-icon-calendar'
  };
  return iconMap[value] || 'i-icon-sort';
};

// 更改排序选项
const changeSortOption = (value) => {
  sortBy.value = value;
  queryParams.sortBy = value;
  queryParams.page = 1;
};

// 当标签改变时更新查询参数
watch(activeTab, (newValue) => {
  // 重置查询参数
  queryParams.watchStatus = undefined;
  queryParams.animeStatus = undefined;
  
  // 根据选项卡设置查询参数
  switch(newValue) {
    case 'want-to-watch':
      queryParams.watchStatus = WATCH_STATUS.WANT_TO_WATCH;
      break;
    case 'watching':
      queryParams.watchStatus = WATCH_STATUS.WATCHING;
      break;
    case 'watched':
      queryParams.watchStatus = WATCH_STATUS.WATCHED;
      break;
    case 'ongoing':
      queryParams.animeStatus = ANIME_STATUS.ONGOING;
      break;
    case 'finished':
      queryParams.animeStatus = ANIME_STATUS.FINISHED;
      break;
  }
  
  // 重置页码
  queryParams.page = 1;
});

// 当平台标签改变时更新查询参数
watch(activePlatformTab, (newValue) => {
  // 设置平台参数
  queryParams.platform = newValue === 'all' ? undefined : Number(newValue);
  
  // 重置页码
  queryParams.page = 1;
});

// 当地区标签改变时更新查询参数
watch(activeAreaTab, (newValue) => {
  // 设置地区参数
  queryParams.area = newValue === 'all' ? undefined : Number(newValue);
  
  // 重置页码
  queryParams.page = 1;
});

// 处理收藏/取消收藏事件
const handleCollected = (animeId) => {
  console.log('追番成功:', animeId);
};

const handleUncollected = (animeId) => {
  console.log('取消追番成功:', animeId);
};

// 吸顶效果处理
const handleScroll = () => {
  if (filterContainerTop.value === 0) {
    const filterContainer = document.querySelector('.filter-container');
    if (filterContainer) {
      // 获取元素相对于视窗的位置
      const rect = filterContainer.getBoundingClientRect();
      // 记录元素的初始顶部位置（相对于文档）
      filterContainerTop.value = rect.top + window.scrollY;
    }
  }
  
  // 判断是否应该激活吸顶
  isScrolled.value = window.scrollY > filterContainerTop.value;
};

// 组件挂载和卸载
onMounted(() => {
  window.addEventListener('scroll', handleScroll);
  // 初始计算一次位置
  setTimeout(() => {
    handleScroll();
  }, 100);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});

// SEO优化
useHead({
  title: '我的追番 - 博客网站',
  meta: [
    { name: 'description', content: '我的番剧追番列表，展示了正在追的、已看完的以及想看的动漫作品' },
    { name: 'keywords', content: '追番,番剧,动漫,bilibili,anime' }
  ]
});
</script>

<style lang="scss" scoped>
.anime-page {
  width: 100%;
}

.page-header {
  position: relative;
  padding: 3rem 0;
  color: #fff;
  text-align: center;
  
  .page-title {
    font-size: 2rem;
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
  padding: 2rem;
}

.anime-content {
  margin-top: 20px;
}

@keyframes slideDown {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.sort-dropdown {
  position: relative;
  z-index: 10;
}

.menu-item {
  position: relative;
  display: inline-block;
  padding: 0 0.625rem;
  letter-spacing: 0.0625rem;
  font-size: 17px;
  text-align: center;

  &:hover .submenu {
    display: block;
  }
}

.menu-btn {
  display: flex;
  align-items: center;
  padding: 0.3rem 0.5rem;
  color: var(--text-color);
  cursor: pointer;
  
  .icon {
    margin-right: 0.3rem;
  }
}

.drop::after {
  content: "";
  display: inline-block;
  vertical-align: middle;
  border: 0.3rem solid transparent;
  border-top-color: currentColor;
  border-bottom: 0;
  margin-left: 0.3rem;
}

.submenu {
  display: none;
  position: absolute;
  right: 0;
  width: max-content;
  margin-top: 0.5rem;
  padding: 0;
  background: var(--grey-0);
  box-shadow: 0 0.3125rem 1.25rem -0.25rem var(--grey-9-a1);
  border-radius: 0.625rem 0;
  animation: slideUpIn 0.3s;
  z-index: 100;

  &::before {
    position: absolute;
    top: -1.25rem;
    left: 0;
    width: 100%;
    height: 2.5rem;
    content: "";
  }
}

.subitem {
  display: block;
  font-size: 1rem;
  list-style: none;

  &:first-child {
    border-radius: 0.625rem 0 0 0;
  }

  &:last-child {
    border-radius: 0 0 0.625rem 0;
  }

  .link {
    display: flex;
    align-items: center;
    padding: 0.3rem 0.7rem;
    width: 100%;
    text-shadow: none;
    cursor: pointer;
    
    .icon {
      margin-right: 0.3rem;
    }
  }

  &:hover .link {
    transform: translateX(0.3rem);
  }
}

.submenu .subitem.active,
.submenu .subitem:hover {
  color: var(--grey-0);
  background-image: linear-gradient(to right, var(--color-pink) 0, var(--color-orange) 100%);
  box-shadow: 0 0 0.75rem var(--color-pink-a3);
}

@keyframes slideUpIn {
  from {
    transform: translateY(10px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .page-container {
    padding: 0.75rem;
  }
  
  .filter-container {
    padding: 10px;
    
    &.sticky-active {
      padding-top: 5px;
      padding-bottom: 5px;
    }
  }
}


@media (width <= 768px) {
  .sort-dropdown {
    display: flex;
    justify-content: flex-end;
  }
}
</style>
