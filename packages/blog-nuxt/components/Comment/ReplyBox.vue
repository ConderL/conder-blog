<template>
  <div class="reply-box" v-if="show">
    <div class="box-normal">
      <div class="reply-box-avatar">
        <img
          class="avatar"
          v-if="userStore.userInfo?.avatar"
          :src="userStore.userInfo.avatar"
          alt="用户头像"
        />
        <img
          class="avatar"
          v-else
          :src="blogStore.blogInfo.siteConfig.touristAvatar"
          alt="游客头像"
        />
      </div>
      <div class="reply-box-warp">
        <textarea
          class="reply-box-textarea"
          v-model="commentContent"
          :style="sendActive ? lineStyle : ''"
          @input="inputActive"
          :placeholder="placeholderText"
        ></textarea>
      </div>
      <div
        class="reply-box-send"
        :class="sendActive ? 'send-active' : ''"
        @click="handleAdd"
      >
        评论
      </div>
    </div>
    <div class="box-expand">
      <div class="emoji-container">
        <div class="emoji-tabs">
          <span 
            v-for="(tab, index) in emojiTabs" 
            :key="index"
            :class="{ active: emojiType === index }"
            @click="handleType(index)"
          >
            {{ tab }}
          </span>
        </div>
        <div class="emoji-list">
          <span 
            v-for="emoji in getEmojiList()"
            :key="emoji"
            class="emoji-item"
            @click="handleEmoji(emoji)"
          >
            {{ emoji }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, toRefs } from 'vue';
import { useUserStore } from '../../stores/user';
import { useBlogStore } from '../../stores/blog';
import { useAppStore } from '../../stores/app';
import { processEmoji } from '../../utils/emojiProcessor';

// 使用Store
const userStore = useUserStore();
const blogStore = useBlogStore();
const appStore = useAppStore();

// 激活样式
const lineStyle = {
  lineHeight: "normal",
  borderColor: "#ed6ea0",
  backgroundColor: "var(--grey-0)",
};

// 组件事件
const emit = defineEmits(["reload"]);

// 组件属性
const props = defineProps({
  commentType: {
    type: Number,
    default: 1, // 1-文章评论，2-留言板
  },
  show: {
    type: Boolean,
    default: true,
  },
  typeId: {
    type: Number,
    default: 0,
  },
});

// 组件状态
const data = reactive({
  nickname: "",
  sendActive: false,
  show: props.show,
  commentContent: "",
  emojiType: 0,
  commentForm: {
    typeId: props.typeId,
    commentType: props.commentType,
    parentId: undefined,
    replyId: undefined,
    toUid: undefined,
    commentContent: "",
  },
});

// 解构状态
const { nickname, sendActive, show, commentContent, emojiType, commentForm } = toRefs(data);

// 表情选项卡
const emojiTabs = ['常用', '表情', '动物'];

// 计算属性：placeholder文本
const placeholderText = computed(() =>
  nickname.value ? `回复 @${nickname.value}：` : "发一条友善的评论"
);

// 根据类型获取表情列表
function getEmojiList() {
  switch (emojiType.value) {
    case 0: // 常用
      return ['😊', '😢', '😃', '😛', '❤️', '👍', '🎉', '🔥'];
    case 1: // 表情
      return ['😄', '😭', '🤔', '😡', '😱', '🤣', '😴', '🥰'];
    case 2: // 动物
      return ['🐶', '🐱', '🐼', '🐰', '🦊', '🐻', '🐨', '🦁'];
    default:
      return [];
  }
}

// 处理输入变化
function inputActive() {
  sendActive.value = commentContent.value.length > 0;
}

// 处理添加表情
function handleEmoji(emoji: string) {
  commentContent.value += emoji;
  sendActive.value = true;
}

// 处理切换表情类型
function handleType(type: number) {
  emojiType.value = type;
}

// 处理添加评论
function handleAdd() {
  if (!userStore.isLogin) {
    appStore.setLoginFlag(true);
    return;
  }
  
  if (commentContent.value.trim() === "") {
    alert("评论不能为空");
    return;
  }

  // 使用工具函数处理表情
  commentForm.value.commentContent = processEmoji(
    commentContent.value,
    emojiType.value,
  );

  // 在实际项目中调用API发送评论
  // 这里模拟API调用
  setTimeout(() => {
    sendActive.value = false;
    commentContent.value = "";
    
    if (blogStore.blogInfo.siteConfig.commentCheck) {
      alert("评论成功，正在审核中");
    } else {
      alert("评论成功");
    }
    
    // 重新加载评论列表
    emit("reload");
  }, 500);
}

// 设置回复状态
function setReply(flag: boolean) {
  show.value = flag;
}

// 暴露给父组件的方法和属性
defineExpose({ commentForm, nickname, setReply });
</script>

<style lang="scss" scoped>
.reply-box {
  margin-bottom: 1rem;
  border-radius: 8px;
  background-color: var(--card-bg);
  
  .box-normal {
    display: flex;
    padding: 1rem;
    
    .reply-box-avatar {
      margin-right: 1rem;
      
      .avatar {
        width: 2.5rem;
        height: 2.5rem;
        border-radius: 50%;
        object-fit: cover;
      }
    }
    
    .reply-box-warp {
      flex: 1;
      
      .reply-box-textarea {
        width: 100%;
        min-height: 5rem;
        padding: 0.75rem;
        border: 1px solid var(--border-color);
        border-radius: 4px;
        background-color: var(--card-bg);
        resize: vertical;
        transition: all 0.3s;
        
        &:focus {
          outline: none;
          border-color: var(--color-pink);
        }
      }
    }
    
    .reply-box-send {
      margin-left: 1rem;
      align-self: flex-end;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      background-color: var(--grey-4);
      color: white;
      cursor: pointer;
      transition: all 0.3s;
      
      &.send-active {
        background-color: var(--color-pink);
      }
    }
  }
  
  .box-expand {
    padding: 0 1rem 1rem;
    
    .emoji-container {
      .emoji-tabs {
        display: flex;
        margin-bottom: 0.5rem;
        
        span {
          padding: 0.25rem 0.75rem;
          cursor: pointer;
          border-radius: 4px;
          
          &.active {
            background-color: var(--grey-1);
          }
        }
      }
      
      .emoji-list {
        display: flex;
        flex-wrap: wrap;
        
        .emoji-item {
          padding: 0.5rem;
          font-size: 1.5rem;
          cursor: pointer;
          transition: transform 0.2s;
          
          &:hover {
            transform: scale(1.2);
          }
        }
      }
    }
  }
}
</style> 