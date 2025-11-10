<template>
  <div v-if="(blog.blogInfo.siteConfig as any)?.isChat">
    <div v-show="show" class="chat-container">
      <!-- 头部组件 -->
      <ChatHeader
        :title="headerTitle"
        :subtitle="headerSubtitle"
        :switch-icon="chatMode === 'chat' ? 'icon:robot' : 'icon:chat'"
        :switch-tooltip="chatMode === 'chat' ? '切换到AI助手' : '切换到聊天室'"
        @switch="toggleChatMode"
        @close="show = false"
      />

      <!-- 消息内容区域 -->
      <ChatRoomMessages
        v-if="chatMode === 'chat'"
        :messages="chatRoomMessages"
        :current-ip-address="ipAddress"
        :current-user-id="user.id"
        :current-sender-id="websocket?.id"
        @recall="handleRecall"
      />

      <AIChatMessages
        v-else
        :messages="aiMessages"
        :current-user-id="user.id"
        :current-ip-address="ipAddress"
        @action="handleAIMessageAction"
      />

      <!-- 底部输入框组件 -->
      <ChatFooter
        v-model:content="chatContent"
        :placeholder="chatMode === 'chat' ? '开始聊天吧' : '向AI助手提问...'"
        @send="handleSend"
        @emoji="handleEmoji"
        @type="handleType"
      />
    </div>
    <div class="chat-btn cursor-pointer" @click="handleOpen">
      <span v-if="unreadCount > 0" class="unread">{{ unreadCount }}</span>
      <UIcon name="icon:chat" class="!w-8 !h-8 text-[var(--color-pink)]" alt="聊天按钮" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, toRefs, computed, onUpdated, watch } from "vue";
import { useToast } from "#imports";
import { useBlogStore, useUserStore, useAppStore } from "~/stores";
import { useStreamResponse } from "~/composables/useStreamResponse";
import ChatHeader from "./ChatHeader.vue";
import ChatRoomMessages from "./ChatRoomMessages.vue";
import AIChatMessages from "./AIChatMessages.vue";
import ChatFooter from "./ChatFooter.vue";

// 导入基本类型
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

interface AIMetadata {
  usage?: {
    total_tokens?: number;
    latency?: number;
    prompt_tokens?: number;
    completion_tokens?: number;
  };
  retriever_resources?: any[];
  annotation_reply?: any;
  intent?: string;
  animes?: Anime[];
}

interface Action {
  key: string;
  label: string;
  icon?: string;
  class?: string;
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
  needLogin?: boolean;
  animes?: Anime[]; // 番剧推荐列表
}

const user = useUserStore();
const blog = useBlogStore();
const app = useAppStore();
const { $io } = useNuxtApp();

// 流式响应处理
const streamResponse = useStreamResponse();

const data = reactive({
  show: false,
  ipAddress: "",
  ipSource: "",
  chatRoomMessages: [] as ChatRecord[], // 聊天室消息
  aiMessages: [
    {
      nickname: 'AI助手',
      avatar: '/icons/chat.svg',
      content: '你好呀，我是Conder博客里的AI助手~ 想聊聊天，还是想让我推荐番剧？',
      createTime: new Date().toISOString(),
    },
  ] as AIMessage[], // AI对话消息
  chatContent: "",
  emojiType: 0,
  unreadCount: 0,
  webSocketState: false,
  onlineCount: 0,
  chatMode: 'ai' as 'chat' | 'ai',
  aiConversationId: '',
});

const {
  show,
  chatRoomMessages,
  aiMessages,
  ipAddress,
  ipSource,
  chatContent,
  emojiType,
  unreadCount,
  webSocketState,
  onlineCount,
  chatMode,
  aiConversationId,
} = toRefs(data);

const websocket = ref<any>();
const timeout = ref<NodeJS.Timeout>();
const serverTimeout = ref<NodeJS.Timeout>();

const headerTitle = computed(() => {
  return chatMode.value === 'chat' ? '聊天室' : 'AI助手';
});

const headerSubtitle = computed(() => {
  return chatMode.value === 'chat' 
    ? `当前${onlineCount.value}人在线` 
    : 'Conder Blog 智能助手';
});

const userNickname = computed(() => {
  if (user.isLogin && user.nickname) {
    return user.nickname;
  }
  return ipAddress.value || "访客";
});

const userAvatar = computed(() =>
  user.avatar ? user.avatar : blog.blogInfo.siteConfig?.touristAvatar
);

const handleOpen = () => {
  if (websocket.value === undefined) {
    if (!$io) {
      console.error("Socket.IO客户端库未加载，请确保已正确引入");
      return;
    }

    const connectionOptions = {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      query: {} as { [key: string]: any },
    };

    if (user.isLogin) {
      connectionOptions.query.userId = user.id;
      connectionOptions.query.nickname = user.nickname;
      connectionOptions.query.avatar =
        user.avatar || blog.blogInfo.siteConfig?.touristAvatar;
      console.log("用户已登录，传递用户信息:", user.nickname, user.id);
    }

    const socket = $io(
      (blog.blogInfo.siteConfig as any)?.websocketUrl,
      connectionOptions,
    );

    websocket.value = socket;

    socket.on("connect", () => {
      console.log("WebSocket已连接!", socket.id);
      webSocketState.value = true;
      startHeart();
    });

    socket.on("connect_error", (error: Error) => {
      console.error("WebSocket连接错误:", error);
      console.log(
        "尝试连接的URL:",
        (blog.blogInfo.siteConfig as any)?.websocketUrl,
      );
    });

    socket.on("chat-message", (data: any) => {
      console.log("收到消息:", data);
      chatRoomMessages.value.push(data);
      if (!show.value) {
        unreadCount.value++;
      }
    });

    socket.on("online", (data: any) => {
      console.log("在线人数:", data);
      onlineCount.value = data.count;
    });

    socket.on("history", (messages: any) => {
      console.log("收到历史消息:", messages);
      chatRoomMessages.value = messages;
    });

    socket.on("init", (data: any) => {
      console.log("收到初始化数据:", data);
      ipAddress.value = data.ip;
      ipSource.value = data.ipSource || "";
    });

    socket.on("recall", (messageId: number) => {
      console.log("收到撤回消息:", messageId);
      const index = chatRoomMessages.value.findIndex(msg => msg.id === messageId);
      if (index !== -1) {
        chatRoomMessages.value.splice(index, 1);
      }
    });

    socket.on("error", (error: any) => {
      console.error("Socket错误:", error);
      const toast = useToast();
      if (toast) {
        toast.add({
          title: '错误',
          description: error.message || "发生错误",
          color: 'error'
        });
      }
    });

    socket.on("disconnect", () => {
      webSocketState.value = false;
      clear();
    });

    socket.on("warning", (data: any) => {
      console.warn("敏感词警告:", data);
      const toast = useToast();
      if (toast) {
        toast.add({
          title: '警告',
          description: data.message,
          color: 'warning'
        });
      }
    });
  }
  unreadCount.value = 0;
  show.value = !show.value;
};

const handleRecall = (messageId: number) => {
  if (websocket.value) {
    websocket.value.emit("recall", messageId);
  }
};

const handleSend = async () => {
  if (chatContent.value.trim() == "") {
    const toast = useToast();
    if (toast) {
      toast.add({
        title: '错误',
        description: '内容不能为空',
        color: 'error'
      });
    }
    return;
  }

  if (chatMode.value === 'ai') {
    await handleAIChat();
    return;
  }

  // 聊天室模式
  const chat = {
    nickname: userNickname.value,
    avatar: userAvatar.value,
    content: chatContent.value,
    userId: user.id,
    ipAddress: ipAddress.value,
    ipSource: ipSource.value,
  };

  if (websocket.value) {
    websocket.value.emit("chat-message", chat);
  }

  chatContent.value = "";
};

const handleAIChat = async () => {
  const content = chatContent.value;
  const userNick = userNickname.value;
  const userAv = userAvatar.value || '/icons/chat.svg';

  // 添加用户消息
  const userMessage: AIMessage = {
    nickname: userNick,
    avatar: userAv,
    content: content,
    userId: user.id,
    ipAddress: ipAddress.value,
    createTime: new Date().toISOString(),
  };
  aiMessages.value.push(userMessage);

  chatContent.value = "";

  // 创建AI消息占位符
  const aiMessageIndex = aiMessages.value.length;
  const aiMessage: AIMessage = {
    nickname: 'AI助手',
    avatar: blog.blogInfo.siteConfig?.touristAvatar || '/icons/chat.svg',
    content: '',
    createTime: new Date().toISOString(),
  };
  aiMessages.value.push(aiMessage);

  try {
    const { ai } = useApi();
    
    // 重置流式响应状态
    streamResponse.reset();
    
    // 使用流式响应处理器
    const handleDifyMessage = streamResponse.handleDifyStream({
      onContent: (delta, fullContent) => {
        // 累积更新消息内容
        // delta: 本次接收到的增量内容
        // fullContent: 累积后的完整内容（由 hooks 内部维护）
        if (aiMessages.value[aiMessageIndex]) {
          aiMessages.value[aiMessageIndex].content = fullContent;
        }
      },
      onMetadata: (metadata) => {
        if (aiMessages.value[aiMessageIndex]) {
          aiMessages.value[aiMessageIndex].metadata = metadata;
          
          // 检查metadata中是否包含番剧数据（Dify工作流直接返回）
          if (metadata.animes && Array.isArray(metadata.animes)) {
            aiMessages.value[aiMessageIndex].animes = metadata.animes;
          }
        }
      },
      onConversationId: (conversationId) => {
        aiConversationId.value = conversationId;
      },
      onEvent: async (event, data) => {
        // 更新创建时间
        if (data.created_at && aiMessages.value[aiMessageIndex]) {
          aiMessages.value[aiMessageIndex].createTime = new Date(data.created_at * 1000).toISOString();
        }
        
      },
      onComplete: async () => {
        console.log('AI流式回复完成');
        
        // 结束时，若 metadata 已附带番剧数据，则保持；未提供则说明工作流未返回
        const currentMessage = aiMessages.value[aiMessageIndex];
        if (currentMessage && currentMessage.metadata?.animes && !currentMessage.animes) {
          currentMessage.animes = currentMessage.metadata.animes;
        }
      },
    });
    
    // 使用流式接口
    await ai.chatStream({
      query: content,
      user: user.id?.toString() || `user-${ipAddress.value || 'guest'}`,
      conversation_id: aiConversationId.value || undefined,
      onMessage: handleDifyMessage,
      onError: (error: any) => {
        // 移除空消息
        if (!aiMessages.value[aiMessageIndex]?.content) {
          aiMessages.value.splice(aiMessageIndex, 1);
        }
        
        // 401错误：显示登录提示，不显示错误toast
        if (error.isUnauthorized || error.status === 401) {
          const loginPromptMessage: AIMessage = {
            nickname: 'AI助手',
            avatar: blog.blogInfo.siteConfig?.touristAvatar || '/icons/chat.svg',
            content: '使用AI助手功能需要登录账号，请先登录后再试。',
            createTime: new Date().toISOString(),
            needLogin: true,
            actions: [
              {
                key: 'login',
                label: '去登录',
                icon: 'i-icon-user',
                class: 'primary'
              }
            ]
          };
          aiMessages.value.push(loginPromptMessage);
          return;
        }
        
        // 其他错误：显示错误提示
        const toast = useToast();
        if (toast) {
          toast.add({
            title: '错误',
            description: error.message || 'AI对话失败，请稍后重试',
            color: 'error'
          });
        }

        // 如果消息为空，添加错误消息
        if (!aiMessages.value[aiMessageIndex]?.content) {
          const errorMessage: AIMessage = {
            nickname: 'AI助手',
            avatar: blog.blogInfo.siteConfig?.touristAvatar || '/icons/chat.svg',
            content: '抱歉，我暂时无法回答这个问题，请稍后重试。',
            createTime: new Date().toISOString(),
          };
          aiMessages.value.push(errorMessage);
        }
      },
    });
  } catch (error: any) {
    // 移除空消息
    if (!aiMessages.value[aiMessageIndex]?.content) {
      aiMessages.value.splice(aiMessageIndex, 1);
    }

    // 401错误：显示登录提示，不显示错误toast
    if (error.isUnauthorized || error.status === 401) {
      const loginPromptMessage: AIMessage = {
        nickname: 'AI助手',
        avatar: blog.blogInfo.siteConfig?.touristAvatar || '/icons/chat.svg',
        content: '使用AI助手功能需要登录账号，请先登录后再试。',
        createTime: new Date().toISOString(),
        needLogin: true,
        actions: [
          {
            key: 'login',
            label: '去登录',
            icon: 'i-icon-user',
            class: 'primary'
          }
        ]
      };
      aiMessages.value.push(loginPromptMessage);
      return;
    }

    const toast = useToast();
    if (toast) {
      toast.add({
        title: '错误',
        description: error.message || 'AI对话失败，请稍后重试',
        color: 'error'
      });
    }

    // 如果消息为空，添加错误消息
    if (!aiMessages.value[aiMessageIndex]?.content) {
      const errorMessage: AIMessage = {
        nickname: 'AI助手',
        avatar: blog.blogInfo.siteConfig?.touristAvatar || '/icons/chat.svg',
        content: '抱歉，我暂时无法回答这个问题，请稍后重试。',
        createTime: new Date().toISOString(),
      };
      aiMessages.value.push(errorMessage);
    }
  }
};

// 处理AI消息操作
const handleAIMessageAction = (key: string, message: AIMessage) => {
  if (key === 'login') {
    // 打开登录弹窗
    app.setLoginFlag(true);
  }
};

const toggleChatMode = () => {
  chatMode.value = chatMode.value === 'chat' ? 'ai' : 'chat';
};

const startHeart = () => {
  clear();

  timeout.value = setTimeout(() => {
    if (websocket.value && websocket.value.connected) {
      console.log("发送心跳...");
      websocket.value.emit("heartbeat", { timestamp: Date.now() });
      waitServer();
    } else {
      console.log("WebSocket未连接，尝试重连...");
      websocket.value?.connect();
    }
  }, 60 * 1000);
};

const waitServer = () => {
  if (serverTimeout.value) {
    clearTimeout(serverTimeout.value);
  }

  let heartbeatReceived = false;

  const heartbeatListener = () => {
    console.log("收到心跳响应");
    heartbeatReceived = true;
    webSocketState.value = true;
  };

  websocket.value.once("heartbeat", heartbeatListener);

  serverTimeout.value = setTimeout(() => {
    websocket.value?.off("heartbeat", heartbeatListener);

    if (!heartbeatReceived) {
      console.warn("心跳响应超时，尝试重连");
      webSocketState.value = false;

      if (websocket.value) {
        try {
          websocket.value.disconnect();
          setTimeout(() => {
            websocket.value?.connect();
          }, 1000);
        } catch (error) {
          console.error("重连失败:", error);
        }
      }
    }

    startHeart();
  }, 10 * 1000);
};

const clear = () => {
  if (timeout.value) {
    clearTimeout(timeout.value);
    timeout.value = undefined;
  }
  if (serverTimeout.value) {
    clearTimeout(serverTimeout.value);
    serverTimeout.value = undefined;
  }
};

const handleEmoji = (key: string) => {
  chatContent.value += key;
};

const handleType = (key: number) => {
  emojiType.value = key;
};

// 自动滚动到底部
watch([chatRoomMessages, aiMessages, show], () => {
  if (show.value) {
    setTimeout(() => {
      const element = document.getElementById(
        chatMode.value === 'chat' ? 'chat-content' : 'ai-chat-content'
      );
      if (element) {
        element.scrollTop = element.scrollHeight;
      }
    }, 100);
  }
}, { deep: true });
</script>

<style lang="scss" scoped>
.chat-container {
  box-shadow: 0 5px 40px rgba(0, 0, 0, 0.16);
  font-size: 14px;
  background: var(--grey-1);
  animation: bounceInUp 1s;
  animation-fill-mode: both;
  z-index: 1200;
}

@media (min-width: 760px) {
  .chat-container {
    position: fixed;
    bottom: 100px;
    right: 20px;
    width: 400px;
    height: calc(100% - 110px);
    max-height: 590px;
    min-height: 250px;
    border-radius: 1rem;
  }
}

@media (max-width: 760px) {
  .chat-container {
    position: fixed;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
  }
}

.unread {
  position: absolute;
  width: 18px;
  height: 18px;
  text-align: center;
  border-radius: 50%;
  line-height: 20px;
  font-size: 12px;
  background: var(--color-red);
  color: var(--grey-0);
}

.chat-btn {
  position: fixed;
  bottom: 36px;
  right: 10px;
  width: 30px;
  height: 30px;
  border-radius: 100px;
  z-index: 1000;
}
</style>
