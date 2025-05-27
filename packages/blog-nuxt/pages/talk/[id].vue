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
      <div v-if="talk" class="page-container">
        <div class="talk-item">
          <div class="talk-meta">
            <img class="user-avatar" :src="talk.avatar" />
          </div>
          <div class="talk-content-wrap">
            <div class="talk-info">
              <span class="talk-user-name">
                {{ talk.nickname }}
                <UIcon name="icon:badge" class="badge-icon" />
              </span>
              <span class="talk-time">{{ formatDateTime(talk.createTime) }}</span>
            </div>
            <div class="talk-content" v-html="talk.talkContent"></div>
            <div v-if="talk.imgList && talk.imgList.length > 0" class="talk-image">
              <img
                v-for="(img, index) in talk.imgList"
                :key="index"
                class="image"
                :src="img"
                alt="说说图片"
                @click.stop.prevent="viewImage(talk.imgList, index)"
              />
            </div>
            <div class="action-info">
              <ClientOnly>
                <span class="talk-like info" @click="like">
                  <UIcon 
                    name="icon:like" 
                    :class="{ 'like-active': isLiked }" 
                    class="like-icon" 
                  />
                  {{ talk.likeCount }}
                </span>
                <span class="talk-comment info">
                  <UIcon name="icon:comment" class="meta-icon" />
                  {{ commentCount }}
                </span>
              </ClientOnly>
            </div>
          </div>
        </div>
        
        <!-- 评论列表 -->
        <CommentList
          :comment-type="3"
          :type-id="talkId"
          @get-comment-count="getCommentCount"
        ></CommentList>
      </div>
      
      <!-- 加载中状态 -->
      <div v-else class="loading-container">
        <div class="loading-spinner"></div>
        <p>加载中...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, unref, watch } from 'vue';
import { useBlogStore, useUserStore, useAppStore } from '~/stores';
import { formatDateTime } from '~/utils/date';

// 定义页面元数据
definePageMeta({
  title: '说说详情'
});

// 获取store
const blog = useBlogStore();
const user = useUserStore();
const app = useAppStore();

// 获取路由参数
const route = useRoute();
const talkId = computed(() => Number(route.params.id));

// 状态数据
interface TalkDetail {
  id: number;
  nickname: string;
  avatar: string;
  talkContent: string;
  imgList: string[];
  likeCount: number;
  commentCount: number;
  createTime: string;
  [key: string]: any;
}

const commentCount = ref(0);

// 是否已点赞
const isLiked = computed(() => {
  return unref(user.talkLikeSet)?.includes(unref(talkId));
});

console.log(isLiked.value, 'isLiked');

// 使用API
const { talk: talkApi } = useApi();

// 使用asyncData预加载数据
const { data, refresh } = await talkApi.getTalk(talkId.value);

const talk = computed(() =>  unref(data));

// 监听路由参数变化
watch(() => route.params.id, async (newId) => {
  if (newId) {
    await refresh();
    talk.value = unref(data.value?.data) || null;
  }
});

// 初始加载数据
onMounted(async () => {
  // 如果asyncData失败，尝试重新获取
  if (!talk.value) {
    await fetchTalkDetail();
  }
});

// 获取说说详情
const fetchTalkDetail = async () => {
  try {
    const { data } = await talkApi.getTalk(talkId.value);
    talk.value = data;
  } catch (error) {
    console.error('获取说说详情失败', error);
  }
};

// 点赞说说
const like = async () => {
  if (!user.id) {
    app.setLoginFlag(true);
    return;
  }
  
  if (!talk.value) return;
  
  try {
    const { data } = await talkApi.likeTalk(talkId.value);
    if (data) {
      // 判断是否点赞
      if (isLiked.value) {
        talk.value.likeCount = Math.max(0, talk.value.likeCount - 1);
      } else {
        talk.value.likeCount += 1;
      }
      user.talkLike(talkId.value);
    }
  } catch (error) {
    console.error('点赞失败', error);
  }
};

// 获取评论数量
const getCommentCount = (count: number) => {
  commentCount.value = count;
};

// 查看图片
const viewImage = (images: string[], index: number) => {
  // 这里使用了photoswipe或其他图片查看器
  // 如果需要可以添加具体实现
};

// SEO优化
useHead({
  title: computed(() => `说说 - ${blog.blogInfo.siteConfig?.siteName || '博客'}`),
  meta: [
    { 
      name: 'description', 
      content: computed(() => talk.value ? `${talk.value.nickname}的说说` : '说说详情') 
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
  background-color: var(--card-bg);
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
}

.talk-meta {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  width: 3rem;
  height: 3.125rem;
}

.user-avatar {
  width: 100%;
  height: 3rem;
  border-radius: 50%;
  object-fit: cover;
}

.talk-content-wrap {
  flex: 1;
  margin-left: 1rem;
}

.talk-info {
  display: flex;
  flex-direction: column;
  margin-bottom: 0.75rem;
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
  margin-bottom: 1rem;
  
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
  margin-bottom: 1rem;
  
  .image {
    width: 100%;
    aspect-ratio: 1;
    border-radius: 4px;
    object-fit: cover;
    cursor: pointer;
    transition: all 0.3s;
    
    &:hover {
      transform: scale(1.02);
    }
  }
}

.action-info {
  display: flex;
  align-items: center;
  
  .talk-like,
  .talk-comment {
    display: flex;
    align-items: center;
    font-size: 0.9rem;
    color: var(--grey-5);
    margin-right: 1.5rem;
    cursor: pointer;
    
    .meta-icon,
    .like-icon {
      width: 1rem;
      height: 1rem;
      margin-right: 0.25rem;
    }
    
    .like-active {
      color: var(--color-pink);
    }
  }
  
  .talk-like:hover {
    color: var(--color-pink);
  }
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
  
  .talk-item {
    padding: 1rem;
  }
  
  .talk-image {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }
}
</style> 