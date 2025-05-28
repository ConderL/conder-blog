<template>
  <div>
    <!-- 页面头部 -->
    <ClientOnly>
      <div class="page-header">
        <h1 class="page-title">说说</h1>
        <img
          class="page-cover"
          :src="blog.blogInfo.siteConfig?.talkWallpaper"
          alt="说说封面"
        />
        <Waves></Waves>
      </div>
    </ClientOnly>
    
    <div class="bg">
      <div v-if="talkList" class="page-container">
        <NuxtLink
          v-for="t in talkList"
          :key="t.id"
          :to="`/talk/${t.id}`"
          class="talk-item"
        >
          <div class="talk-meta">
            <!-- 用户头像 -->
            <img class="user-avatar" :src="t.avatar" />
            <div class="talk-info">
              <span class="talk-user-name">
                {{ t.nickname }}
                <UIcon name="icon:badge" class="badge-icon" style="color: #EA387E" />
              </span>
              <span class="talk-time">{{ formatDateTime(t.createTime) }}</span>
            </div>
          </div>
          <!-- 说说内容 -->
          <div class="talk-content" v-html="t.talkContent"></div>
          <!-- 说说图片 -->
          <div v-if="t.imgList && t.imgList.length > 0" class="talk-image">
            <img
              v-for="(img, index) in t.imgList"
              :key="index"
              class="image cursor-pointer"
              :src="img"
              alt="说说图片"
              @click="viewImage(t.imgList, index)"
            />
          </div>
          <!-- 说说信息 -->
          <div class="info">
            <!-- 点赞量 -->
            <span class="talk-like info">
              <UIcon name="icon:like" class="meta-icon" />
              {{ t.likeCount }}
            </span>
            <!-- 评论量 -->
            <span class="talk-comment info">
              <UIcon name="icon:comment" class="meta-icon" />
              {{ t.commentCount }}
            </span>
          </div>
        </NuxtLink>
        
        <!-- 加载更多按钮 -->
        <div
          v-if="talkList.length > 0 && count > talkList.length"
          class="loading-wrap"
        >
          <UButton class="load-more-btn" @click="loadMore">加载更多...</UButton>
        </div>
        
        <!-- 无数据提示 -->
        <div v-if="talkList.length === 0" class="no-data">
          <p>暂无说说内容</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { useBlogStore } from '~/stores';
import { formatDateTime } from '~/utils/date';

// 定义页面元数据
definePageMeta({
  title: '说说'
});

// 获取博客信息
const blog = useBlogStore();

const queryParams = reactive({
  current: 1,
  size: 5
});

// 使用API获取说说列表
const { talk } = useApi();

const { data } = await talk.getTalkList(queryParams);
const talkList = computed(() => unref(data).recordList || []);
const count = computed(() => unref(data).count || 0);

// 加载更多
const loadMore = () => {
  queryParams.current++;
  getList();
};

// 查看图片
const viewImage = (images: string[], index: number) => {
  // 这里使用了photoswipe或其他图片查看器
  // 如果需要可以添加具体实现
};

// SEO优化
useHead({
  title: '说说 - ' + (blog.blogInfo.siteConfig?.siteName || '博客'),
  meta: [
    { 
      name: 'description', 
      content: '博客说说页面，记录生活点滴与日常感悟' 
    },
    { 
      name: 'keywords', 
      content: '说说,博客,日常,感悟,生活记录' 
    }
  ]
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

.talk-item {
  display: flex;
  flex-direction: column;
  padding: 1rem 1.25rem;
  border-radius: 0.5rem;
  background-color: var(--card-bg);
  box-shadow: 0 0.625rem 1.875rem -0.9375rem var(--box-bg-shadow);
  transition: all 0.2s ease-in-out 0s;
  
  &:hover {
    box-shadow: 0 0 2rem var(--box-bg-shadow);
    transform: translateY(-5px);
  }
  
  &:not(:first-child) {
    margin-top: 1.25rem;
  }
}

.talk-meta {
  display: flex;
  align-items: center;
  width: 100%;
  margin-bottom: 0.75rem;
}

.talk-info {
  display: flex;
  flex-direction: column;
  margin-left: 0.5rem;
}

.user-avatar {
  width: 2.8rem;
  height: 2.8rem;
  border-radius: 10px;
  object-fit: cover;
}

.talk-user-name {
  font-weight: 500;
  font-size: 1rem;
  color: var(--text-color);
  display: flex;
  align-items: center;
  
  .badge-icon {
    width: 1rem;
    height: 1rem;
    margin-left: 0.4rem;
  }
}

.talk-time {
  font-size: 0.8rem;
  color: var(--grey-5);
  margin-top: 0.25rem;
}

.talk-content {
  font-size: 1rem;
  line-height: 1.6;
  color: var(--text-color);
  margin-bottom: 0.75rem;
  
  :deep(a) {
    color: var(--primary-color);
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
  
  :deep(img) {
    max-width: 100%;
    border-radius: 4px;
  }
  
  :deep(pre) {
    background-color: var(--code-bg);
    padding: 1rem;
    border-radius: 4px;
    overflow-x: auto;
  }
}

.talk-image {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  
  .image {
    width: 100%;
    aspect-ratio: 1;
    border-radius: 4px;
    object-fit: cover;
    transition: all 0.3s;
    
    &:hover {
      transform: scale(1.02);
    }
  }
}

.info {
  display: flex;
  align-items: center;
  margin-top: 0.5rem;
  
  .talk-like,
  .talk-comment {
    display: flex;
    align-items: center;
    font-size: 0.9rem;
    color: var(--grey-5);
    margin-right: 1rem;
    
    .meta-icon {
      width: 1rem;
      height: 1rem;
      margin-right: 0.25rem;
    }
  }
}

.loading-wrap {
  text-align: center;
  margin-top: 2rem;
  
  .load-more-btn {
    background-color: var(--primary-color);
    color: white;
    padding: 0.5rem 2rem;
    border-radius: 4px;
    transition: all 0.3s;
    
    &:hover {
      opacity: 0.9;
      transform: translateY(-2px);
    }
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

@media (max-width: 768px) {
  .page-title {
    font-size: 2rem !important;
  }
  
  .page-container {
    padding: 1.5rem;
  }
  
  .talk-image {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }
}
</style> 