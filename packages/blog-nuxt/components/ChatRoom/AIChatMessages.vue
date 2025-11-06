<template>
  <div id="ai-chat-content" class="chat-content">
    <div
      v-for="(message, index) of messages"
      :key="index"
      class="chat-item"
      :class="isUserMessage(message) ? 'my-chat' : ''"
    >
      <img 
        class="user-avatar" 
        :src="isUserMessage(message) ? message.avatar : '/images/robot-avatar.avif'"
        :alt="message.nickname"
      />
      <div :class="isUserMessage(message) ? 'right-info' : 'left-info'">
        <div
          class="user-info"
          :class="isUserMessage(message) ? 'my-chat' : ''"
        >
          <span style="color: var(--color-red)">{{ message.nickname }}</span>
          <span
            style="color: var(--color-blue)"
            :class="isUserMessage(message) ? 'right-info' : 'left-info'"
          >
            {{ formatMessageTime(message) }}
          </span>
        </div>
        <div
          class="user-content"
          :class="isUserMessage(message) ? 'my-content' : ''"
        >
          <AIMessageContent
            v-if="!isUserMessage(message)"
            :content="message.content"
            :metadata="message.metadata"
            :actions="message.actions"
            :animes="message.animes"
            @action="(key) => handleMessageAction(key, index)"
          />
          <div v-else v-html="processMessageContent(message.content)"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatDateTime } from '~/utils/date';
import { cleanupContent } from '~/utils/emojiProcessor';
import AIMessageContent from './AIMessageContent.vue';

interface AIMetadata {
  usage?: {
    total_tokens?: number;
    latency?: number;
    prompt_tokens?: number;
    completion_tokens?: number;
  };
  retriever_resources?: any[];
  annotation_reply?: any;
}

interface Action {
  key: string;
  label: string;
  icon?: string;
  class?: string;
}

interface Anime {
  id: number;
  animeName: string;
  cover?: string;
  description?: string;
  rating?: number;
  ratingCount?: number;
  animeStatus?: number;
  totalEpisodes?: number;
  currentEpisodes?: number;
  platform?: number;
  area?: { id: number; name: string };
  styles?: string | string[];
  views?: number;
  publishTime?: string;
}

interface AIMessage {
  id?: number;
  nickname: string;
  avatar: string;
  content: string;
  userId?: number;
  ipAddress?: string;
  createTime?: string;
  metadata?: AIMetadata;
  actions?: Action[];
  needLogin?: boolean; // 是否需要登录
  animes?: Anime[]; // 番剧推荐列表
}

interface Props {
  messages: AIMessage[];
  currentUserId?: number;
  currentIpAddress?: string;
}

interface Emits {
  (e: 'action', key: string, message: AIMessage): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const handleMessageAction = (key: string, messageIndex?: number) => {
  // 如果提供了索引，直接使用；否则查找包含该action的消息
  let message: AIMessage | undefined;
  if (messageIndex !== undefined && props.messages[messageIndex]) {
    message = props.messages[messageIndex];
  } else {
    message = props.messages.find(m => m.actions?.some(a => a.key === key));
  }
  if (message) {
    emit('action', key, message);
  }
};

const isUserMessage = (message: AIMessage) => {
  return (
    message.userId !== undefined && message.userId === props.currentUserId
  ) || (
    message.ipAddress === props.currentIpAddress && message.nickname !== 'AI助手'
  );
};

const formatMessageTime = (message: AIMessage) => {
  if (!message || !message.createTime) return '';
  return formatDateTime(message.createTime);
};

const processMessageContent = (content: string): string => {
  if (!content) return '';
  return cleanupContent(content);
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
    max-width: 80%;
    white-space: pre-line;
    word-wrap: break-word;
    word-break: break-word;
  }

  .my-content {
    float: right;
    border-radius: 20px 5px 20px 20px;
    background: var(--color-blue);
    color: var(--grey-0);
  }
}
</style>

