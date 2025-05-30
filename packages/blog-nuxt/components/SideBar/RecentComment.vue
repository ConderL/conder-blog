<template>
  <!-- 标题 -->
  <div class="comment-title">
    <UIcon name="icon:comment" class="title-icon" />
    最新评论
  </div>
  
  <!-- 使用ClientOnly包装所有动态内容 -->
  <ClientOnly>
    <!-- 评论列表 -->
    <template #default>
      <div v-if="commentList.length > 0">
        <div v-for="comment in commentList" :key="comment.id" class="comment-item">
          <!-- 头像 -->
          <img class="user-avatar" :src="comment.avatar" alt="" />
          <div class="comment-content">
            <div class="info">
              <!-- 昵称 -->
              <span class="comment-name">{{ comment.fromNickname }}</span>
              <!-- 时间 -->
              <div>{{ formatCommentDate(comment.createTime) }}</div>
            </div>
            <!-- 内容 -->
            <span class="content" v-html="processCommentContent(comment.commentContent)"></span>
          </div>
        </div>
      </div>
  
      <!-- 当没有评论时显示的内容 -->
      <div v-if="commentList.length === 0" class="no-comment">
        暂无评论
      </div>

    </template>
    
    <!-- 服务端渲染的占位内容 -->
    <template #fallback>
      <div class="no-comment">
        评论加载中...
      </div>
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
import { ref, onMounted, defineComponent } from 'vue';
import { formatDate } from '../../utils/date';
import { cleanupContent } from '../../utils/emojiProcessor';

// 添加默认导出
defineComponent({
  name: 'RecentComment'
});

const { comment: commentApi } = useApi();
const { data, status } = await commentApi.getList();
const commentList = computed(() => unref(data)?.recordList ?? []);

// 处理评论内容，转换表情代码为图片
const processCommentContent = (content: string) => {
  if (!content) return '';
  return cleanupContent(content);
};

// 安全的日期格式化
const formatCommentDate = (date: string | Date | null | undefined) => {
  if (!date) return '';
  // 尝试格式化，如果失败则返回默认值
  try {
    return formatDate(date);
  } catch (error) {
    console.warn('日期格式化失败:', date);
    return '近期';
  }
};

</script>

<style lang="scss" scoped>
.comment-title {
  font-size: 1.2em;
  display: flex;
  align-items: center;
}

.title-icon {
  width: 1.1875rem;
  height: 1.1875rem;
  margin-right: 0.5rem;
}

.comment-name {
  overflow: hidden;
  text-overflow: ellipsis;
  display: inherit;
}

.comment-item {
  display: flex;
  align-items: center;
  padding: 0.375rem 0;
}

.user-avatar {
  width: 4.2rem;
  height: 4.2rem;
  border-radius: 0.75rem;
}

.comment-content {
  width: calc(100% - 4.2rem);
  padding-left: 0.625rem;
  
  .info {
    font-size: 0.8rem;
    line-height: 1rem;
    color: var(--grey-6);
  }
  
  .content {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    font-size: 95%;
    line-height: 1.5;
    overflow: hidden;
  }
}

.no-comment {
  text-align: center;
  color: var(--grey-5);
  padding: 1rem 0;
}
</style> 