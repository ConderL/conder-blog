<template>
  <div v-if="blog.blogInfo.siteConfig?.isChat">
    <div v-show="show" class="chat-container">
      <div class="chat-header">
        <img
          width="32"
          height="32"
          src="/icons/chat.svg"
          alt="聊天室图标"
        />
        <div style="margin-left: 12px">
          <div>聊天室</div>
          <div style="font-size: 12px">
            当前{{ onlineCount }}人在线
          </div>
        </div>
        <UIcon
          name="icon:close"
          class="close text-lg"
          @click="show = false"
        />
      </div>
      <div id="chat-content" class="chat-content">
        <div
          v-for="(chat, index) of recordList"
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
      <div class="chat-footer">
        <textarea
          v-model="chatContent"
          class="chat-input"
          placeholder="开始聊天吧"
          @keydown="handleKeyCode($event)"
        ></textarea>
        <Emoji
          @add-emoji="handleEmoji"
          @choose-type="handleType"
        ></Emoji>
        <UIcon
          name="icon:plane"
          class="send-btn text-xl"
          @click="handleSend"
        />
      </div>
    </div>
    <div class="chat-btn cursor-pointer" @click="handleOpen">
      <span v-if="unreadCount > 0" class="unread">{{ unreadCount }}</span>
      <UIcon name="icon:chat" class="!w-8 !h-8 text-[var(--color-pink)]" alt="聊天按钮" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, reactive, toRefs, computed, onUpdated } from "vue";
import { useBlogStore, useUserStore } from "~/stores";
import { formatDateTime } from "~/utils/date";
import { emojiGenshinList } from "~/utils/emojiGenshin";
import { emojiList } from "~/utils/emoji";
import { emojiMygoList } from "~/utils/emojiMygo";
import { cleanupContent } from "~/utils/emojiProcessor";

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

const user = useUserStore();
const blog = useBlogStore();
const { $io } = useNuxtApp();

const data = reactive({
  show: false,
  ipAddress: "",
  ipSource: "",
  recordList: [] as ChatRecord[],
  chatContent: "",
  emojiType: 0,
  unreadCount: 0,
  webSocketState: false,
  onlineCount: 0,
});

const {
  show,
  recordList,
  ipAddress,
  ipSource,
  chatContent,
  emojiType,
  unreadCount,
  webSocketState,
  onlineCount,
} = toRefs(data);

const backBtn = ref<any>([]);
const websocket = ref<any>();
const timeout = ref<NodeJS.Timeout>();
const serverTimeout = ref<NodeJS.Timeout>();

const isMy = computed(
  () => (chat: ChatRecord) =>
    chat.ipAddress == ipAddress.value ||
    (chat.userId !== undefined && chat.userId === user.id) ||
    (chat.senderId !== undefined && chat.senderId === websocket.value?.id),
);

const userNickname = computed(() => {
  // 如果是登录用户，使用登录昵称
  if (user.isLogin && user.nickname) {
    return user.nickname;
  }
  // 未登录用户，优先使用随机昵称
  if (user.tempNickname) {
    return user.tempNickname;
  }
  // 如果都没有，使用IP地址
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

    // 构建连接选项，添加查询参数传递用户信息
    const connectionOptions = {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      query: {} as { [key: string]: any },
    };

    // 如果用户已登录，添加用户ID和昵称到查询参数
    if (user.isLogin) {
      connectionOptions.query.userId = user.id;
      connectionOptions.query.nickname = user.nickname;
      connectionOptions.query.avatar =
        user.avatar || blog.blogInfo.siteConfig?.touristAvatar;
      console.log("用户已登录，传递用户信息:", user.nickname, user.id);
    }

    const socket = $io(
      blog.blogInfo.siteConfig?.websocketUrl,
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
        blog.blogInfo.siteConfig?.websocketUrl,
      );
    });

    socket.on("chat-message", (data: any) => {
      console.log("收到消息:", data);
      recordList.value.push(data);
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
      recordList.value = messages;
    });

    socket.on("init", (data: any) => {
      console.log("收到初始化数据:", data);
      // 设置IP和昵称
      ipAddress.value = data.ip;
      ipSource.value = data.ipSource || "";

      // 如果用户没有登录，使用随机昵称
      if (!user.isLogin) {
        user.setTempNickname(data.nickname);
      }
    });

    socket.on("recall", (messageId: number) => {
      console.log("收到撤回消息:", messageId);
      for (let i = 0; i < recordList.value.length; i++) {
        if (recordList.value[i].id === messageId) {
          recordList.value.splice(i, 1);
          break;
        }
      }
    });

    socket.on("error", (error: any) => {
      console.error("Socket错误:", error);
      useToast().add({
        title: '错误',
        description: error.message || "发生错误",
        color: 'red'
      });
    });

    socket.on("disconnect", () => {
      webSocketState.value = false;
      clear();
    });

    socket.on("warning", (data: any) => {
      console.warn("敏感词警告:", data);
      useToast().add({
        title: '警告',
        description: data.message,
        color: 'yellow'
      });
    });
  }
  unreadCount.value = 0;
  show.value = !show.value;
};

const showBack = (chat: ChatRecord, index: number, e: any) => {
  if (backBtn.value && backBtn.value.length) {
    backBtn.value.forEach((item: any) => {
      if (item) item.style.display = "none";
    });
    
    if (
      chat.ipAddress === ipAddress.value ||
      (chat.userId != null && chat.userId == user.id)
    ) {
      backBtn.value[index].style.left = e.offsetX + "px";
      backBtn.value[index].style.bottom = e.offsetY + "px";
      backBtn.value[index].style.display = "block";
    }
  }
};

const back = (item: ChatRecord, index: number) => {
  if (websocket.value) {
    websocket.value.emit("recall", item.id);
  }
  if (backBtn.value && backBtn.value[index]) {
    backBtn.value[index].style.display = "none";
  }
};

const handleKeyCode = (e: any) => {
  if (e.ctrlKey && e.keyCode === 13) {
    chatContent.value = chatContent.value + "\n";
  } else if (e.keyCode === 13) {
    e.preventDefault();
    handleSend();
  }
};

const handleSend = () => {
  if (chatContent.value.trim() == "") {
    useToast().add({
      title: '错误',
      description: '内容不能为空',
      color: 'red'
    });
    return;
  }
  
  // 直接发送原始表情代码，不进行转换
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

const startHeart = () => {
  // 清除之前可能存在的定时器
  clear();

  // 设置定时发送心跳的任务
  timeout.value = setTimeout(() => {
    if (websocket.value && websocket.value.connected) {
      console.log("发送心跳...");
      // 向服务器发送心跳事件
      websocket.value.emit("heartbeat", { timestamp: Date.now() });
      // 设置等待响应的定时器
      waitServer();
    } else {
      console.log("WebSocket未连接，尝试重连...");
      // 如果已断开，尝试重连
      websocket.value?.connect();
    }
  }, 60 * 1000); // 改为1分钟发送一次心跳
};

const waitServer = () => {
  // 清除可能存在的等待响应定时器
  if (serverTimeout.value) {
    clearTimeout(serverTimeout.value);
  }

  // 设置心跳超时的状态标记
  let heartbeatReceived = false;

  // 在接收到心跳响应时修改标记
  const heartbeatListener = () => {
    console.log("收到心跳响应");
    heartbeatReceived = true;
    webSocketState.value = true;
  };

  // 添加一次性心跳响应监听器
  websocket.value.once("heartbeat", heartbeatListener);

  // 设置心跳响应超时检查
  serverTimeout.value = setTimeout(() => {
    // 移除一次性监听器
    websocket.value?.off("heartbeat", heartbeatListener);

    if (!heartbeatReceived) {
      console.warn("心跳响应超时，尝试重连");
      webSocketState.value = false;

      // 尝试重新连接
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

    // 继续发送下一个心跳
    startHeart();
  }, 10 * 1000); // 10秒超时时间
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

const formatMessageTime = (chat: ChatRecord) => {
  if (!chat) return "";

  // 优先使用createTime，如果没有则使用time
  const timeValue =
    chat.createTime || (chat.time ? new Date(chat.time).toISOString() : "");
  return formatDateTime(timeValue || new Date());
};

onUpdated(() => {
  const element = document.getElementById("chat-content");
  if (element) {
    element.scrollTop = element.scrollHeight;
  }
});

/**
 * 处理消息内容中的表情符号
 * @param content 消息内容
 * @returns 处理后的HTML
 */
function processMessageContent(content: string): string {
  if (!content) return '';
  
  return cleanupContent(content)
}
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

  .close {
    display: none;
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

  .close {
    display: block;
    margin-left: auto;
  }
}

.chat-header {
  display: flex;
  align-items: center;
  padding: 20px 24px;
  border-radius: 1rem 1rem 0 0;
  background-color: var(--grey-0);
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

.chat-btn {
  position: fixed;
  bottom: 36px;
  right: 10px;
  width: 30px;
  height: 30px;
  border-radius: 100px;
  z-index: 1000;
}

.chat-footer {
  position: absolute;
  bottom: 0;
  display: flex;
  align-items: center;
  width: 100%;
  padding: 8px 16px;
  background: var(--grey-2);
  border-radius: 0 0 1rem 1rem;

  .chat-input {
    width: 100%;
    height: 30px;
    padding: 0.2rem 0 0 0.3rem;
    margin-right: 0.5rem;
    font-size: 13px;
    color: var(--text-color);
    background-color: var(--grey-1);
    outline: none;
    resize: none;
  }

  .send-btn {
    color: var(--color-blue);
    margin-left: 0.5rem;
  }
}
</style> 