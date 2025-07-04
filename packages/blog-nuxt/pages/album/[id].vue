<template>
  <div>
    <ClientOnly>
      <div class="page-header">
        <h1 class="page-title">{{ photoInfo.albumName }}</h1>
        <img class="page-cover" :src="wallpaper" alt="相册封面" />
        <Waves></Waves>
      </div>
    </ClientOnly>
    
    <div class="bg">
      <div class="page-container">
        <!-- 瀑布流照片布局 -->
        <ClientOnly>
          <div 
            ref="galleryRef"
            v-if="photoInfo.photoVOList && photoInfo.photoVOList.length > 0" 
            v-masonry
            fit-width="true"
            transition-duration="0.3s"
            item-selector=".photo-card"
            class="photo-gallery"
          >
            <div
              v-for="photo in photoInfo.photoVOList" 
              :key="photo.id"
              v-masonry-tile
              class="photo-card"
            >
              <img class="photo-img" data-not-lazy :src="photo.photoUrl" alt="相册照片" />
            </div>
          </div>
        </ClientOnly>
        
        <!-- 加载中状态 -->
        <div v-if="loading" class="loading-container">
          <div class="loading-spinner"></div>
          <p>加载中...</p>
        </div>
        
        <!-- 无数据状态 -->
        <div v-else-if="!photoInfo.photoVOList || photoInfo.photoVOList.length === 0" class="no-data">
          <p>暂无照片</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, onUnmounted } from 'vue';
import { useBlogStore } from '~/stores';
import 'viewerjs/dist/viewer.css';
import Viewer from 'viewerjs';

// 定义页面元数据
definePageMeta({
  title: '相册详情'
});

// 获取博客信息
const blog = useBlogStore();
const route = useRoute();
const albumId = computed(() => Number(route.params.id));

// 获取封面图片
const wallpaper = computed(() => {
  return route.query.wallpaper as string || blog.blogInfo.siteConfig?.albumWallpaper;
});

// 照片信息和加载状态
interface Photo {
  id: number;
  photoUrl: string;
}

interface PhotoInfo {
  albumName: string;
  photoVOList: Photo[];
}

interface ApiResponse {
  flag: boolean;
  data?: PhotoInfo;
}

const photoInfo = ref<PhotoInfo>({
  albumName: "",
  photoVOList: []
});
const loading = ref(true);
const galleryRef = ref<HTMLElement | null>(null);
let viewer: any = null;

// 使用API获取照片列表
const { album } = useApi();

// v-viewer 配置选项
const viewerOptions = {
  inline: false,
  button: true,
  navbar: true,
  title: false,
  toolbar: {
    zoomIn: true,
    zoomOut: true,
    oneToOne: true,
    reset: true,
    prev: true,
    next: true,
    rotateLeft: true,
    rotateRight: true,
    flipHorizontal: true,
    flipVertical: true,
  },
  tooltip: true,
  movable: true,
  zoomable: true,
  rotatable: true,
  scalable: true,
  transition: true,
  fullscreen: true,
  keyboard: true,
};

// 页面挂载时获取数据
onMounted(async () => {
  try {
    const response = await album.getPhotoList(albumId.value) as ApiResponse;
    if (response.flag) {
      photoInfo.value = response.data || { albumName: "", photoVOList: [] };
      
      // 等待DOM更新后初始化viewer
      await nextTick();
      if (galleryRef.value && photoInfo.value.photoVOList.length > 0) {
        // 销毁之前的viewer实例（如果存在）
        if (viewer) {
          viewer.destroy();
        }
        
        // 创建新的viewer实例
        viewer = new Viewer(galleryRef.value, viewerOptions);
      }
    }
  } catch (error) {
    console.error('获取照片列表失败', error);
  } finally {
    loading.value = false;
  }
});

// 组件卸载时销毁viewer
onUnmounted(() => {
  if (viewer) {
    viewer.destroy();
    viewer = null;
  }
});
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

.photo-gallery {
  width: 100%;
  cursor: pointer;
}

.photo-card {
  width: 100%;
  max-width: 280px;
  margin: 0.25rem;
  border-radius: 5px;
  box-shadow: 0px 2px 10px 1px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.photo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 5px;
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

@media (max-width: 768px) {
  .page-title {
    font-size: 2rem !important;
  }
  
  .page-container {
    padding: 1.5rem;
  }
  
  .photo-card {
    max-width: 150px;
    margin: 0.15rem;
  }
}
</style> 