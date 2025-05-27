<template>
  <div>
    <ClientOnly>
      <div class="page-header">
        <h1 class="page-title">相册</h1>
        <img
          class="page-cover"
          :src="blog.blogInfo.siteConfig?.albumWallpaper"
          alt="相册封面"
        />
        <!-- 波浪 -->
        <Waves></Waves>
      </div>
    </ClientOnly>
    
    <div class="bg">
      <div class="page-container">
        <div v-if="albumList.length > 0" class="album-container">
          <div
            v-for="album in albumList"
            :key="album.id"
            class="album-item"
          >
            <img class="album-cover" :src="album.albumCover" />
            <NuxtLink
              :to="`/album/${album.id}?wallpaper=${album.albumCover}`"
              class="album-info"
            >
              <div class="album-name">{{ album.albumName }}</div>
              <div class="album-desc">{{ album.albumDesc }}</div>
            </NuxtLink>
          </div>
        </div>
        
        <!-- 加载中状态 -->
        <div v-else-if="loading" class="loading-container">
          <div class="loading-spinner"></div>
          <p>加载中...</p>
        </div>
        
        <!-- 无数据状态 -->
        <div v-else class="no-data">
          <p>暂无相册内容</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useBlogStore } from '~/stores';

// 定义页面元数据
definePageMeta({
  title: '相册'
});

// 获取博客信息
const blog = useBlogStore();

// 相册列表和加载状态
const albumList = ref([]);
const loading = ref(true);

// 使用API获取相册列表
const { album: albumApi } = useApi();

// 页面挂载时获取数据
onMounted(async () => {
  try {
    const response = await albumApi.getAlbumList();
    if (response.flag) {
      albumList.value = response.data || [];
    }
  } catch (error) {
    console.error('获取相册列表失败', error);
  } finally {
    loading.value = false;
  }
});

// 客户端组件，无需SSR
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
}

.album-container {
  display: flex;
  flex-wrap: wrap;
}

.album-item {
  position: relative;
  width: calc(50% - 0.5rem);
  height: 15.625rem;
  margin: 0.375rem 0.25rem;
  border-radius: 0.5rem;
  background: #000;
  overflow: hidden;
}

.album-cover {
  position: relative;
  max-width: none;
  width: calc(100% + 1.25rem);
  height: 15.625rem;
  transition: opacity 0.35s, transform 0.35s;
  transform: translate3d(-10px, 0, 0);
  object-fit: cover;
  opacity: 0.8;
}

.album-info {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1.8rem 2rem;
  color: #fff !important;
}

.album-name {
  position: relative;
  font-weight: 700;
  font-size: 1.25rem;
  padding: 0.7rem 0;
  overflow: hidden;

  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background: #fff;
    transition: transform 0.35s;
    transform: translate3d(-100%, 0, 0);
  }
}

.album-desc {
  padding: 0.4rem 0 0;
  line-height: 1.5;
  transition: opacity 0.35s, transform 0.35s;
  transform: translate3d(100%, 0, 0);
  opacity: 0;
}

.album-item:hover .album-desc {
  opacity: 1;
  transform: translateZ(0);
}

.album-item:hover .album-name::after {
  transform: translate3d(0, 0, 0);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  
  .loading-spinner {
    border: 4px solid rgba(0, 0, 0, 0.1);
    border-radius: 50%;
    border-top: 4px solid var(--primary-color);
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }
  
  p {
    color: var(--grey-5);
  }
}

.no-data {
  text-align: center;
  padding: 3rem 0;
  color: var(--grey-5);
  font-size: 1.1rem;
  background-color: var(--card-bg);
  border-radius: 8px;
  margin: 2rem 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 567px) {
  .album-item {
    width: calc(100% - 0.5rem);
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