<template>
  <div class="anime-page">
    <div class="page-header">
      <h1 class="page-title">追番列表</h1>
      <img class="page-cover" :src="blog.blogInfo?.siteConfig?.animeWallpaper || ''" alt="">
      <!-- 波浪 -->
      <Waves></Waves>
    </div>
    <div class="bg">
      <div class="page-container">
        <div class="anime-content">
          <!-- Tabs组件 - 状态筛选 -->
          <UTabs v-model="activeTab" :items="tabItems" class="w-full mb-4" />
          
          <!-- 平台筛选和排序控制 -->
          <div class="flex justify-between items-center w-full mb-4">
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
            description="bilibili接口已开放权限可以做到实时更新，其他视频平台接口做了反爬处理，可获取的有用数据较少，目前暂时做不到数据的实时更新，采用静态数据展示。"
            class="mb-4"
          />
          
          <!-- 番剧列表 -->
          <div class="anime-list">
            <div v-for="anime in filteredAnimeList" :key="anime.id" class="anime-item" @click="openAnimeLink(anime)">
              <div class="anime-cover">
                <img :src="anime.cover" alt="番剧封面" class="cover-img">
                <div class="anime-status">
                  <span :class="getWatchStatusClass(anime.watchStatus)">{{ getWatchStatusLabel(anime.watchStatus) }}</span>
                </div>
              </div>
              <div class="anime-info">
                <h3 class="anime-title">{{ anime.animeName }}</h3>
                <div class="anime-meta">
                  <span v-if="anime.views" class="meta-item">{{ formatNumber(anime.views) }}播放</span>
                  <span v-if="anime.favorites" class="meta-item">{{ formatNumber(anime.favorites) }}收藏</span>
                  <span v-if="anime.seriesFollow" class="meta-item">{{ formatNumber(anime.seriesFollow) }}追番</span>
                </div>
                <div class="anime-tags">
                  <span v-if="anime.styles && anime.styles.length">{{ anime.styles.join(' / ') }}</span>
                  <span v-if="anime.publishTime">{{ getYearFromPublishTime(anime.publishTime) }}</span>
                  <span :class="getAnimeStatusClass(anime.animeStatus)">{{ getAnimeStatusLabel(anime.animeStatus) }}</span>
                  <span v-if="anime.indexShow">{{ anime.indexShow }}</span>
                </div>
                <div class="anime-cast" v-if="anime.actors">
                  <span class="cast-label">配音：</span>
                  <span class="cast-content">{{ truncateText(anime.actors, 50) }}</span>
                </div>
                <div class="anime-desc">
                  <div class="desc-content" :class="{'expanded': isDescriptionExpanded(anime.id)}">
                    <span>简介：</span>{{ isDescriptionExpanded(anime.id) ? anime.description : truncateText(anime.description, 120) }}
                  </div>
                  <div 
                    v-if="needsExpansion(anime.description)"
                    class="desc-expand" 
                    @click.stop="toggleDescription(anime.id)"
                  >
                    {{ isDescriptionExpanded(anime.id) ? '收起' : '展开' }}
                  </div>
                </div>
                <div class="anime-footer">
                  <div class="anime-rating" v-if="anime.rating">
                    <div class="rating-score">{{ anime.rating }}<span class="rating-suffix">分</span></div>
                    <div class="rating-count" v-if="anime.ratingCount">{{ formatNumber(anime.ratingCount) }}人评分</div>
                  </div>
                  <div class="anime-episodes" v-if="anime.totalEpisodes">
                    <template v-if="anime.platform === 1">
                      {{ anime.currentEpisodes || 0 }}/{{ anime.totalEpisodes }}集
                    </template>
                    <template v-else>
                      {{ anime.totalEpisodes }}集
                    </template>
                  </div>
                  <div class="anime-source">
                    <img v-if="anime.platform === 1" class="platform-icon" src="https://www.bilibili.com/favicon.ico" alt="bilibili">
                    <img v-else-if="anime.platform === 2" class="platform-icon" src="https://v.qq.com/favicon.ico" alt="腾讯视频">
                    <img v-else-if="anime.platform === 3" class="platform-icon" src="https://www.iqiyi.com/favicon.ico" alt="爱奇艺">
                    <img v-else-if="anime.platform === 4" class="platform-icon" src="https://www.youku.com/favicon.ico" alt="优酷">
                    <span class="platform-name">{{ getPlatformLabel(anime.platform) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 分页 -->
          <Pagination v-if="total > queryParams.size" v-model:current="queryParams.current" :per-page="queryParams.size" :total="total" />
          
          <!-- 无数据提示 -->
          <div v-if="filteredAnimeList.length === 0" class="no-data">
            <UIcon name="i-lucide-tv-2" class="no-data-icon" />
            <p>暂无番剧数据</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBlogStore } from "~/stores/blog";
import type { TabsItem } from '@nuxt/ui';

// 定义页面元数据
definePageMeta({
  title: '追番'
});

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
  current: 1,
  size: 12,
  animeName: '',
  platform: undefined,
  animeStatus: undefined,
  watchStatus: undefined,
  sortBy: 'rating' // 默认按评分排序
});

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

// 平台标签选项
const platformTabItems: TabsItem[] = [
  { label: '全部', value: 'all' },
  { label: 'bilibili', value: '1' },
  { label: '腾讯视频', value: '2' },
  { label: '爱奇艺', value: '3' },
  { label: '优酷', value: '4' }
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
  queryParams.current = 1;
  refresh();
};

// 处理排序变化
const handleSortChange = () => {
  queryParams.sortBy = sortBy.value;
  queryParams.current = 1;
  refresh();
};

// 获取番剧数据
const { anime } = useApi();
const { data, refresh } = await anime.getList(queryParams);

console.log(data, 'data')

// 计算属性：番剧列表和总数
const animeList = computed(() => unref(data)?.list || []);
const total = computed(() => unref(data)?.total || 0);

// 简介展开状态管理
const expandedDescriptions = ref<{[key: number]: boolean}>({});

// 切换简介展开状态
const toggleDescription = (animeId: number) => {
  expandedDescriptions.value[animeId] = !expandedDescriptions.value[animeId];
};

// 检查简介是否已展开
const isDescriptionExpanded = (animeId: number) => {
  return !!expandedDescriptions.value[animeId];
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
  
  // 重置页码并刷新数据
  queryParams.current = 1;
  refresh();
});

// 当平台标签改变时更新查询参数
watch(activePlatformTab, (newValue) => {
  // 设置平台参数
  queryParams.platform = newValue === 'all' ? undefined : parseInt(newValue);
  
  // 重置页码并刷新数据
  queryParams.current = 1;
  refresh();
});

// 当分页参数变化时刷新数据
watch(() => [queryParams.current, queryParams.size], () => {
  refresh();
}, { deep: true });

// 根据当前标签过滤番剧列表
const filteredAnimeList = computed(() => {
  return animeList.value;
});

// 辅助函数
const truncateText = (text, length) => {
  if (!text) return '';
  return text.length > length ? text.substring(0, length) + '...' : text;
};

// 判断文本是否需要展开/收起按钮
const needsExpansion = (text) => {
  if (!text) return false;
  return text.length > 120;
};

// 打开番剧链接
const openAnimeLink = (anime) => {
  if (anime.link) {
    window.open(anime.link, '_blank');
  } else if (anime.platform === 1 && anime.animeId) {
    window.open(`https://www.bilibili.com/bangumi/play/ss${anime.animeId}`, '_blank');
  } else if (anime.platform === 2 && anime.animeId) {
    window.open(`https://v.qq.com/detail/m/${anime.animeId}.html`, '_blank');
  }
};

// 格式化数字（万、亿）
const formatNumber = (num) => {
  if (!num) return '0';
  if (num >= 100000000) {
    return (num / 100000000).toFixed(1) + '亿';
  } else if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万';
  }
  return num.toString();
};

// 从发布时间中提取年份
const getYearFromPublishTime = (publishTime) => {
  if (!publishTime) return '';
  const match = publishTime.match(/(\d{4})/);
  return match ? match[1] : '';
};

// 获取平台标签
const getPlatformLabel = (platform) => {
  const platformMap = {
    1: 'bilibili',
    2: '腾讯视频',
    3: '爱奇艺',
    4: '优酷'
  };
  return platformMap[platform] || '未知平台';
};

// 获取追番状态标签
const getWatchStatusLabel = (status) => {
  const statusMap = {
    1: '想看',
    2: '在看',
    3: '已看'
  };
  return statusMap[status] || '未知状态';
};

// 获取番剧状态标签
const getAnimeStatusLabel = (status) => {
  const statusMap = {
    1: '连载中',
    2: '已完结'
  };
  return statusMap[status] || '未知状态';
};

// 获取追番状态CSS类
const getWatchStatusClass = (status) => {
  const statusMap = {
    1: 'status-want',   // 想看
    2: 'status-watching',  // 在看
    3: 'status-watched'    // 已看
  };
  return `status-tag ${statusMap[status] || ''}`;
};

// 获取番剧状态CSS类
const getAnimeStatusClass = (status) => {
  const statusMap = {
    1: 'status-ongoing',   // 连载中
    2: 'status-finished'   // 已完结
  };
  return `status-tag status-small ${statusMap[status] || ''}`;
};

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

.anime-content {
  margin-top: 20px;
}

.anime-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 30px;
  margin-bottom: 30px;
}

.anime-item {
  display: flex;
  border-radius: 8px;
  overflow: hidden;
  background-color: var(--card-bg);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 20px;
  transition: transform 0.3s, box-shadow 0.3s;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.08);
  }
}

.anime-cover {
  position: relative;
  width: 165px;
  height: 221px;
  flex-shrink: 0;
  border-radius: 6px;
  overflow: hidden;
  
  .cover-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.6s;
    
    &:hover {
      transform: scale(1.1);
    }
  }
  
  .anime-status {
    position: absolute;
    top: 10px;
    left: 10px;
    display: flex;
    gap: 5px;
  }
}

.status-tag {
  font-size: 12px;
  padding: 3px 8px;
  border-radius: 4px;
  color: white;
  font-weight: 500;
  
  &.status-small {
    padding: 1px 5px;
    font-size: 11px;
  }
}

.status-want {
  background-color: #00AEEC; // B站蓝
}

.status-watching {
  background-color: #FF7F24; // 橙色
}

.status-watched {
  background-color: #2AC864; // 绿色
}

.status-ongoing {
  background-color: #F85A54; // 红色
}

.status-finished {
  background-color: #9499A0; // 灰色
}

.anime-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding-left: 20px;
  overflow: hidden;
}

.anime-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 6px;
  color: var(--text-color);
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  
  &:hover {
    color: #00AEEC;
  }
}

.anime-meta {
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 8px;
  
  .meta-item {
    margin-right: 15px;
    
    &:not(:last-child)::after {
      content: "·";
      margin-left: 15px;
    }
  }
}

.anime-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  font-size: 13px;
  margin-bottom: 10px;
  color: var(--text-muted);
  
  span:not(.status-tag) {
    position: relative;
    
    &:not(:last-child)::after {
      content: "·";
      margin-left: 10px;
    }
  }
}

.anime-cast {
  font-size: 13px;
  margin-bottom: 10px;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  
  .cast-label {
    color: #9499A0;
    margin-right: 4px;
  }
}

.anime-desc {
  position: relative;
  font-size: 13px;
  color: var(--text-light);
  margin-bottom: 15px;
  flex: 1;
  
  .desc-content {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-height: 1.5;
    
    &.expanded {
      display: block;
      -webkit-line-clamp: unset;
    }
    
    span {
      color: #9499A0;
    }
  }
  
  .desc-expand {
    position: absolute;
    right: 0;
    bottom: -15px;
    background-color: var(--card-bg);
    padding: 0 5px;
    color: #00AEEC;
    cursor: pointer;
  }
}

.anime-footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: auto;
}

.anime-rating {
  display: flex;
  flex-direction: column;
  
  .rating-score {
    font-size: 24px;
    font-weight: 600;
    color: #FF7F24;
    line-height: 1;
    
    .rating-suffix {
      font-size: 13px;
    }
  }
  
  .rating-count {
    font-size: 12px;
    color: #9499A0;
    margin-top: 2px;
  }
}

.anime-episodes {
  font-size: 13px;
  color: var(--text-muted);
  margin-right: 15px;
}

.anime-source {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #9499A0;
  
  .platform-icon {
    width: 16px;
    height: 16px;
    margin-right: 5px;
  }
}

.no-data {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px 0;
  color: var(--text-muted);
  
  .no-data-icon {
    font-size: 48px;
    margin-bottom: 10px;
  }
  
  p {
    font-size: 16px;
  }
}

@media (max-width: 1200px) {
  .anime-list {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .anime-item {
    flex-direction: column;
    padding: 15px;
  }
  
  .anime-cover {
    width: 100%;
    height: auto;
    aspect-ratio: 3/4;
    margin-bottom: 15px;
  }
  
  .anime-info {
    padding-left: 0;
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
</style>
