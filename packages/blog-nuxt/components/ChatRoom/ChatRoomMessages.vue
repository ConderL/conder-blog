<template>
  <div id="chat-content" class="chat-content">
    <div
      v-for="(chat, index) of messages"
      :key="index"
      class="chat-item"
      :class="isMy(chat) ? 'my-chat' : ''"
    >
      <img class="user-avatar" :src="chat.avatar" alt="用户头像" />
      <div :class="isMy(chat) ? 'right-info' : 'left-info'">
        <div
          class="user-info"
          :class="isMy(chat) ? 'my-chat' : ''"
        >
          <span style="color: var(--color-red)">{{ chat.nickname }}</span>
          <span
            style="color: var(--color-blue)"
            :class="isMy(chat) ? 'right-info' : 'left-info'"
          >
            {{ formatMessageTime(chat) }}
          </span>
        </div>
        <div
          class="user-content"
          :class="isMy(chat) ? 'my-content' : ''"
          @contextmenu.prevent.stop="showBack(chat, index, $event)"
        >
          <div v-html="processMessageContent(chat.content)"></div>
          <div
            ref="backBtn"
            class="back-menu"
            @click="back(chat, index)"
          >
            撤回
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { formatDateTime } from '~/utils/date';
import { cleanupContent } from '~/utils/emojiProcessor';

interface ChatRecord {
  id?: number;
  nickname: string;
  avatar: string;
  content: string;
  userId?: number;
  senderId?: string;
  ipAddress?: string;
  ipSource?: string;
  createTime?: string;
  time?: string;
}

interface Props {
  messages: ChatRecord[];
  currentIpAddress: string;
  currentUserId?: number;
  currentSenderId?: string;
  onRecall?: (id: number) => void;
}

const props = defineProps<Props>();

const backBtn = ref<any>([]);

const isMy = (chat: ChatRecord) => {
  return (
    chat.ipAddress === props.currentIpAddress ||
    (chat.userId !== undefined && chat.userId === props.currentUserId) ||
    (chat.senderId !== undefined && chat.senderId === props.currentSenderId)
  );
};

const formatMessageTime = (chat: ChatRecord) => {
  if (!chat) return '';
  const timeValue =
    chat.createTime || (chat.time ? new Date(chat.time).toISOString() : '');
  return formatDateTime(timeValue || new Date());
};

const processMessageContent = (content: string): string => {
  if (!content) return '';
  return cleanupContent(content);
};

const showBack = (chat: ChatRecord, index: number, e: any) => {
  if (backBtn.value && backBtn.value.length) {
    backBtn.value.forEach((item: any) => {
      if (item) item.style.display = 'none';
    });
    
    if (
      chat.ipAddress === props.currentIpAddress ||
      (chat.userId != null && chat.userId === props.currentUserId)
    ) {
      backBtn.value[index].style.left = e.offsetX + 'px';
      backBtn.value[index].style.bottom = e.offsetY + 'px';
      backBtn.value[index].style.display = 'block';
    }
  }
};

const back = (item: ChatRecord, index: number) => {
  if (item.id && props.onRecall) {
    props.onRecall(item.id);
  }
  if (backBtn.value && backBtn.value[index]) {
    backBtn.value[index].style.display = 'none';
  }
};
</script>

<style lang="scss" scoped>
.chat-content {
  position: absolute;
  top: 80px;
  bottom: 46px;
  width: 100%;
  padding: 20px 16px 0 16px;
  background-color: var(--chat-bg);
  overflow-y: auto;
  overflow-x: hidden;
}

.my-chat {
  flex-direction: row-reverse;
}

.chat-item {
  display: flex;
  margin-bottom: 0.5rem;

  .user-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
  }

  .left-info {
    margin-left: 0.5rem;
  }

  .right-info {
    margin-right: 0.5rem;
  }

  .user-info {
    display: flex;
    align-items: center;
    font-size: 12px;
  }

  .user-content {
    position: relative;
    padding: 10px;
    border-radius: 5px 20px 20px 20px;
    background: var(--grey-0);
    width: fit-content;
    white-space: pre-line;
    word-wrap: break-word;
    word-break: break-all;
  }

  .my-content {
    float: right;
    border-radius: 20px 5px 20px 20px;
    background: var(--color-blue);
    color: var(--grey-0);
  }
}

.back-menu {
  position: absolute;
  width: 80px;
  height: 35px;
  line-height: 35px;
  font-size: 13px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.9);
  color: #000;
  text-align: center;
  display: none;
}
</style>

