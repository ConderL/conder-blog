<template>
  <div class="message-page">
    <!-- 弹幕输入框 -->
    <div class="message-container">
      <h1 class="message-title">留言板</h1>
      <div class="message-input">
        <input
          v-model="messageContent"
          class="input"
          placeholder="说点什么吧"
          @click="show = true"
          @keyup.enter="send"
        />
        <button v-show="show" class="send" @click="send">发送</button>
      </div>
    </div>
    
    <!-- 弹幕列表 -->
    <ClientOnly>
      <div
        class="danmaku-container"
        :style="{
          'background-image': 'url(' + blog.blogInfo.siteConfig?.messageWallpaper + ')'
        }"
      >
        <VueDanmaku
          ref="danmakuRef"
          v-model:danmus="danmuList"
          class="danmaku"
          use-slot
          :is-suspend="true"
        >
          <template #dm="{ danmu }">
            <span class="danmaku-item">
              <img
                :src="danmu.avatar"
                width="30"
                height="30"
                style="border-radius: 50%"
              />
              <span class="ml">{{ danmu.nickname }} :</span>
              <span class="ml">{{ danmu.messageContent }}</span>
            </span>
          </template>
        </VueDanmaku>
      </div>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useBlogStore, useUserStore } from '~/stores';

// 定义页面元数据
definePageMeta({
  title: '留言板'
});

// 使用SEO优化
useHead({
  title: '留言板 - ' + (useBlogStore().blogInfo.siteConfig?.siteName || '博客'),
  meta: [
    { 
      name: 'description', 
      content: '欢迎来到留言板，在这里你可以与博主交流，分享你的想法和建议。' 
    },
    { 
      name: 'keywords', 
      content: '留言板,弹幕,交流,反馈' 
    }
  ]
});

// 获取store
const user = useUserStore();
const blog = useBlogStore();

// 组件状态
const messageContent = ref("");
const show = ref(false);
const danmakuRef = ref();
const messageList = ref([]);
// 确保danmus是数组类型
const danmuList = ref([]);

// 使用API
const { message: messageApi } = useApi();

// 获取留言列表
onMounted(async () => {
  try {
    const { data } = await messageApi.getMessageList();
    if (data && Array.isArray(data)) {
      messageList.value = data;
      danmuList.value = [...data]; // 复制一份给弹幕组件
    } else {
      messageList.value = [];
      danmuList.value = [];
    }
  } catch (error) {
    console.error('获取留言列表失败:', error);
    messageList.value = [];
    danmuList.value = [];
  }
});

// 发送留言
const send = () => {
  if (messageContent.value.trim() === "") {
    window.$message?.warning("留言内容不能为空");
    return false;
  }
  
  // 获取用户信息
  const userAvatar = user.userInfo?.avatar || blog.blogInfo.siteConfig?.touristAvatar;
  const userNickname = user.userInfo?.nickname || "游客";
  
  // 构建留言对象
  const message = {
    avatar: userAvatar,
    nickname: userNickname,
    messageContent: messageContent.value,
  };
  
  // 发送留言
  messageApi.addMessage(message)
    .then(({ data }) => {
      if (data) {
        if (blog.blogInfo.siteConfig?.messageCheck) {
          window.$message?.warning("留言成功，正在审核中");
        } else {
          // 确保danmakuRef存在
          if (danmakuRef.value && typeof danmakuRef.value.push === 'function') {
            danmakuRef.value.push(message);
          } else {
            // 如果danmakuRef不可用，直接更新danmuList
            danmuList.value.push(message);
          }
          window.$message?.success("留言成功");
        }
        messageContent.value = "";
      }
    })
    .catch(error => {
      console.error('发送留言失败:', error);
      window.$message?.error('发送留言失败，请稍后再试');
    });
};
</script>

<style lang="scss" scoped>
.message-page {
  width: 100%;
  height: 100%;
}

.message-container {
  position: fixed;
  top: 35%;
  left: 0;
  right: 0;
  width: 22.5rem;
  margin: 0 auto;
  text-align: center;
  color: #fff;
  z-index: 5;
}

.message-title {
  animation: titleScale 1s;
}

.message-input {
  display: flex;
  justify-content: center;
  height: 2.5rem;
  margin-top: 2rem;
}

.message-input .input {
  width: 70%;
  height: 100%;
  border-radius: 1.25rem;
  padding: 0 1.25rem;
  outline: none;
  color: #eee;
  border: #fff 1px solid;
  background-color: rgba(0, 0, 0, 0.3);
}

.message-input .input::-webkit-input-placeholder {
  color: #eeee;
}

.message-input .send {
  height: 100%;
  padding: 0 1.25rem;
  color: #eee;
  border: #fff 1px solid;
  border-radius: 20px;
  outline: none;
  animation: slideUpIn 0.3s;
  background-color: rgba(0, 0, 0, 0.3);
  margin-left: 0.5rem;
  cursor: pointer;
}

.danmaku-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  background-color: var(--color-blue);
  background-size: cover;
  background-position: center;
  animation: slideDownIn 1s;
}

.danmaku {
  position: fixed;
  top: 3.125rem;
  width: 100%;
  height: 100%;

  .danmaku-item {
    display: flex;
    align-items: center;
    padding: 0 0.625rem 0 0.3125rem;
    border-radius: 6.25rem;
    background-color: rgba(0, 0, 0, 0.3);
    color: #fff;
  }

  .ml {
    margin-left: 0.5rem;
  }
}

@keyframes titleScale {
  0% {
    transform: scale(0);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes slideUpIn {
  0% {
    transform: translateY(30px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes slideDownIn {
  0% {
    transform: translateY(-30px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}
</style> 