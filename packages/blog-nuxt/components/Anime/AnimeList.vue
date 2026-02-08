<template>
  <div class="anime-list-wrapper">
    <!-- 首次加载状态 -->
    <div v-if="loading && animes.length === 0" class="flex justify-center items-center py-10">
      <UIcon name="i-lucide-loader-2" class="animate-spin text-3xl text-gray-400" />
    </div>

    <!-- 番剧列表 -->
    <div v-show="animes.length > 0" class="anime-list">
      <div v-for="anime in animes" :key="anime.id" class="anime-item" @click="openAnimeDetail(anime)">
        <div class="anime-cover">
          <img :src="anime.cover || ''" alt="番剧封面" class="cover-img">
          <div class="anime-status w-full justify-between px-2">
            <span :class="getWatchStatusClass(anime.watchStatus)">{{ getWatchStatusLabel(anime.watchStatus) }}</span>
            <span v-if="anime.area" :class="getAreaTagClass(anime.area.id)">{{ anime.area.name }}</span>
          </div>
          <!-- 追番按钮 -->
          <div class="anime-collect-btn" @click.stop="toggleCollection(anime)">
            <UIcon name="i-icon-heart" :class="`icon-heart ${isAnimeCollected(anime.id) ? '!text-red-500' : ''}`" />
          </div>
        </div>
        <div class="anime-info">
          <h3 class="anime-title">{{ anime.animeName || '未知番剧' }}</h3>
          <div class="anime-meta">
            <span v-if="anime.views" class="meta-item">{{ formatNumber(anime.views) }}播放</span>
            <span v-if="anime.favorites" class="meta-item">{{ formatNumber(anime.favorites) }}收藏</span>
            <span v-if="anime.seriesFollow" class="meta-item">{{ formatNumber(anime.seriesFollow) }}追番</span>
          </div>
          <div class="anime-tags">
            <span v-if="anime.styles && anime.styles.length">{{ formatStyles(anime.styles) }}</span>
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
    
    <!-- 无数据提示 -->
    <div v-if="animes.length === 0 && !loading" class="no-data">
      <UIcon name="i-lucide-tv-2" class="no-data-icon" />
      <p>{{ emptyText }}</p>
      <slot name="empty-action"></slot>
    </div>
    
    <!-- 加载更多 -->
    <div v-if="hasMore && !loading && animes.length > 0" class="load-more">
      <UButton @click="loadMore">加载更多</UButton>
    </div>
    
    <!-- 底部加载器 -->
    <div v-if="loadingMore" class="flex justify-center py-4">
      <UIcon name="i-lucide-loader-2" class="animate-spin text-2xl text-gray-400" />
    </div>
    
    <!-- 全部加载完毕 -->
    <div v-if="!hasMore && animes.length > 0 && !loading" class="end-text">
      已经到底了~
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted } from 'vue';
import { useApi } from '~/composables/useApi';
import { useUserStore } from '~/stores/user';
import { useRouter } from 'vue-router';
import { useAppStore } from '~/stores/app';

const { anime: animeApi } = useApi();
const userStore = useUserStore();
const router = useRouter();
const toast = useToast();
const appStore = useAppStore();

// 定义组件prop
const props = defineProps({
  // 是否是个人收藏模式
  isCollection: {
    type: Boolean,
    default: false
  },
  // 查询参数
  queryParams: {
    type: Object,
    default: () => ({
      page: 1,
      limit: 10,
      sortBy: 'rating'
    })
  },
  // 空数据提示文本
  emptyText: {
    type: String,
    default: '暂无番剧数据'
  }
});

// 定义emit事件
const emit = defineEmits(['update:queryParams', 'collected', 'uncollected']);

// 状态
const animes = ref([]);
const loading = ref(false);
const loadingMore = ref(false);
const hasMore = ref(true);
const total = ref(0);
const expandedDescriptions = ref({});
const collectedAnimeIds = ref(new Set());
const currentParams = ref({ ...props.queryParams });
// 用于防止 watch 在加载更多时触发重置
const isLoadingMore = ref(false);

// 声明滚动事件处理函数
let handleScroll;

// 初始化
onMounted(async () => {
  await fetchAnimeList();
  if (userStore.isLogin) {
    await fetchCollectedAnimes();
  }
  
  // 添加页面滚动监听
  useInfiniteScroll();
});

// 组件卸载时移除监听
onUnmounted(() => {
  if (handleScroll) {
    window.removeEventListener('scroll', handleScroll);
  }
});

// 监听queryParams变化
watch(() => props.queryParams, (newParams) => {
  // 如果正在加载更多，不处理
  if (isLoadingMore.value) return;

  // 只比较非分页参数
  const currentParamsForCompare = { ...currentParams.value };
  const newParamsForCompare = { ...newParams };

  // 移除页码参数进行比较
  delete currentParamsForCompare.page;
  delete newParamsForCompare.page;

  if (JSON.stringify(newParamsForCompare) !== JSON.stringify(currentParamsForCompare)) {
    // 筛选条件变化，重置列表
    currentParams.value = { ...newParams, page: 1 };
    resetList();
    fetchAnimeList();
  }
}, { deep: true });

// 重置列表
const resetList = () => {
  animes.value = [];
  hasMore.value = true;
  total.value = 0;
};

// 获取用户已追番的列表
async function fetchCollectedAnimes() {
  try {
    await userStore.fetchUserInfo();
    console.log(userStore, 'userStore')
    const { userInfo } = userStore;
    if (userInfo?.animeCollectionSet) {
      collectedAnimeIds.value = new Set(userInfo.animeCollectionSet);
    }
  } catch (error) {
    console.error('获取追番列表失败:', error);
  }
}

// 获取番剧列表
async function fetchAnimeList() {
  try {
    loading.value = true;

    let response;
    if (props.isCollection) {
      // 获取用户收藏的番剧列表
      response = await animeApi.getUserCollection(currentParams.value);
    } else {
      // 获取普通番剧列表
      response = await animeApi.getList(currentParams.value);
    }

    if (response && response.data) {
      if (currentParams.value.page === 1) {
        animes.value = response.data.list || [];
      } else {
        animes.value = [...animes.value, ...(response.data.list || [])];
      }

      total.value = response.data.total || 0;
      hasMore.value = animes.value.length < total.value;
    }
  } catch (error) {
    console.error('获取番剧列表失败:', error);
    toast.add({
      title: '错误',
      description: '获取番剧列表失败',
      color: 'error'
    });
  } finally {
    loading.value = false;
    loadingMore.value = false;
  }
}

// 提供刷新数据的方法
async function refresh() {
  // 重置到第一页并重新获取数据
  currentParams.value.page = 1;
  resetList();
  await fetchAnimeList();
  // 重新获取收藏状态
  if (userStore.isLogin) {
    await fetchCollectedAnimes();
  }
}

// 加载更多
function loadMore() {
  if (loadingMore.value || !hasMore.value) return;

  loadingMore.value = true;
  isLoadingMore.value = true;
  currentParams.value.page++;
  // 不通过 emit 更新父组件，直接在内部处理分页
  fetchAnimeList().finally(() => {
    isLoadingMore.value = false;
  });
}

// 无限滚动处理
function useInfiniteScroll() {
  handleScroll = () => {
    if (loading.value || loadingMore.value || !hasMore.value) return;

    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    // 当距离底部100px时加载更多
    if (scrollTop + windowHeight >= documentHeight - 100) {
      loadMore();
    }
  };

  window.addEventListener('scroll', handleScroll);
}

// 切换追番状态
async function toggleCollection(animeItem) {
  // 如果用户未登录，显示登录提示
  if (!userStore.isLogin) {
    appStore.setLoginFlag(true);
    return;
  }
  
  try {
    const animeId = animeItem.id;
    const isCollected = isAnimeCollected(animeId);
    
    if (isCollected) {
      // 取消追番
      const response = await animeApi.uncollect(animeId);
      if (response && response.flag) {
        collectedAnimeIds.value.delete(animeId);
        // 更新userStore中的收藏状态
        userStore.animeCollect(animeId);
        
        toast.add({
          title: '成功',
          description: '取消追番成功',
          color: 'success',
          timeout: 5000,
          actions: [
            {
              label: '查看',
              onClick: () => router.push('/user'),
              color: 'primary',
              variant: 'link',
              class: 'absolute right-3 bottom-3'
            }
          ]
        });
        
        // 如果是收藏模式，从列表中移除
        if (props.isCollection) {
          animes.value = animes.value.filter(anime => anime.id !== animeId);
          total.value--;
        }
        
        emit('uncollected', animeId);
      }
    } else {
      // 追番
      const response = await animeApi.collect(animeId);
      if (response && response.flag) {
        collectedAnimeIds.value.add(animeId);
        // 更新userStore中的收藏状态
        userStore.animeCollect(animeId);
        
        toast.add({
          title: '成功',
          description: '追番成功',
          color: 'success',
          timeout: 5000,
          actions: [
            {
              label: '查看',
              onClick: () => router.push('/user'),
              color: 'primary',
              variant: 'link',
              class: 'absolute right-3 bottom-3'
            }
          ]
        });
        
        emit('collected', animeId);
      }
    }
  } catch (error) {
    console.error('操作追番失败:', error);
    toast.add({
      title: '错误',
      description: '操作失败，请重试',
      color: 'error'
    });
  }
}

// 检查番剧是否被收藏
function isAnimeCollected(animeId) {
  return collectedAnimeIds.value.has(animeId);
}

// 打开番剧详情
function openAnimeDetail(anime) {
  if (anime.link) {
    window.open(anime.link, '_blank');
  } else if (anime.platform === 1 && anime.animeId) {
    window.open(`https://www.bilibili.com/bangumi/play/ss${anime.animeId}`, '_blank');
  } else if (anime.platform === 2 && anime.animeId) {
    window.open(`https://v.qq.com/detail/m/${anime.animeId}.html`, '_blank');
  } else {
    router.push(`/anime?id=${anime.id}`);
  }
}

// 切换简介展开状态
const toggleDescription = (animeId) => {
  expandedDescriptions.value[animeId] = !expandedDescriptions.value[animeId];
};

// 检查简介是否已展开
const isDescriptionExpanded = (animeId) => {
  return !!expandedDescriptions.value[animeId];
};

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

// 格式化番剧类型
const formatStyles = (styles) => {
  if (!styles) return '';
  if (typeof styles === 'string') {
    try {
      // 尝试解析JSON字符串
      const parsedStyles = JSON.parse(styles);
      return Array.isArray(parsedStyles) ? parsedStyles.join(' / ') : styles;
    } catch (e) {
      // 如果不是有效的JSON，直接返回原字符串
      return styles;
    }
  } else if (Array.isArray(styles)) {
    return styles.join(' / ');
  }
  return '';
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

// 获取地区标签CSS类
const getAreaTagClass = (areaId) => {
  const areaMap = {
    1: 'area-tag-guo',
    2: 'area-tag-ri',
    3: 'area-tag-mei'
  };
  return areaMap[areaId] || 'area-tag';
};

// 暴露方法给父组件
defineExpose({
  refresh
});
</script>

<style lang="scss" scoped>
.anime-list-wrapper {
  width: 100%;
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
    display: flex;
    gap: 5px;
  }
  
  .anime-collect-btn {
    position: absolute;
    bottom: 10px;
    right: 10px;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    transition: all 0.3s;
    z-index: 2;
    
    &:hover {
      transform: scale(1.1);
      background-color: rgba(0, 0, 0, 0.7);
    }
    
    .icon-heart {
      color: var(--grey-0);
      font-size: 18px;
    }
  }
}

.anime-status span {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  color: white;
  text-align: center;
}

.area-tag {
  background-color: rgba(0, 0, 0, 0.6);
  border-left: 3px solid #ff9800;
}

/* 国漫标签 */
.area-tag-guo {
  background-color: rgba(0, 0, 0, 0.6);
  border-left: 3px solid var(--color-red);
  color: var(--color-red);
}

/* 日漫标签 */
.area-tag-ri {
  background-color: rgba(0, 0, 0, 0.6);
  border-left: 3px solid var(--color-blue);
  color: var(--color-blue);
}

/* 美漫标签 */
.area-tag-mei {
  background-color: rgba(0, 0, 0, 0.6);
  border-left: 3px solid var(--color-purple);
  color: var(--color-purple);
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

.load-more {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  margin-bottom: 30px;
}

.end-text {
  text-align: center;
  color: var(--text-muted);
  font-size: 14px;
  padding: 20px 0;
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
</style> 