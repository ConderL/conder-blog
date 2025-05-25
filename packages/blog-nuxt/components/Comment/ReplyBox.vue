<template>
  <div v-if="isVisible" class="reply-box">
    <div class="box-normal">
      <div class="reply-box-avatar">
        <ClientOnly>
          <img
            v-if="userStore.userInfo?.avatar"
            class="shoka-avatar"
            :src="userStore.userInfo.avatar"
            alt="用户头像"
          />
          <img
            v-else
            class="shoka-avatar"
            :src="blogStore.blogInfo.siteConfig.touristAvatar || 'https://img.conder.top/config/default_avatar.jpg'"
            alt="游客头像"
          />
          
          <template #fallback>
            <img
              class="shoka-avatar"
              src="https://img.conder.top/config/default_avatar.jpg"
              alt="默认头像"
            />
          </template>
        </ClientOnly>
      </div>
      <div class="reply-box-warp">
        <textarea
          v-model="commentContent"
          class="reply-box-textarea"
          :style="sendActive ? lineStyle : ''"
          :placeholder="placeholderText"
          @input="inputActive"
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
      <Emoji @add-emoji="handleEmoji" @choose-type="handleType"></Emoji>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { processEmoji } from '../../utils/emojiProcessor';
import { addComment } from '~/api/comment';

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

// 组件状态 - 使用独立的ref而不是reactive包含show
const isVisible = ref(props.show);
const nickname = ref("");
const sendActive = ref(false);
const commentContent = ref("");
const emojiType = ref(0);
const commentForm = reactive({
  typeId: props.typeId,
  commentType: props.commentType,
  parentId: undefined as number | undefined,
  replyId: undefined as number | undefined,
  toUid: undefined as number | undefined,
  commentContent: "",
});

// 计算属性：placeholder文本
const placeholderText = computed(() =>
  nickname.value ? `回复 @${nickname.value}：` : "发一条友善的评论"
);

// 处理输入变化
function inputActive() {
  sendActive.value = commentContent.value.length > 0;
}

// 处理添加表情
function handleEmoji(key: string) {
  commentContent.value += key;
  sendActive.value = true;
}

// 处理切换表情类型
function handleType(key: number) {
  emojiType.value = key;
}

// 处理添加评论
function handleAdd() {
  if (!userStore.isLogin) {
    appStore.setLoginFlag(true);
    return;
  }
  
  if (commentContent.value.trim() === "") {
    window.$message?.error("评论不能为空");
    return;
  }

  // 使用工具函数处理表情
  commentForm.commentContent = processEmoji(
    commentContent.value,
    emojiType.value,
  );

  // 调用API发送评论
  addComment({
    typeId: commentForm.typeId,
    commentType: commentForm.commentType,
    commentContent: commentForm.commentContent,
    replyId: commentForm.replyId,
    toUid: commentForm.toUid,
    parentId: commentForm.parentId
  })
  .then((response: any) => {
    if (response.data.flag) {
      sendActive.value = false;
      commentContent.value = "";
      
      if (blogStore.blogInfo.siteConfig.commentCheck) {
        window.$message?.warning("评论成功，正在审核中");
      } else {
        window.$message?.success("评论成功");
      }
      
      // 重新加载评论列表
      emit("reload");
    }
  })
  .catch(error => {
    console.error("评论提交失败:", error);
    window.$message?.error("评论提交失败，请稍后再试");
  });
}

// 设置回复状态
function setReply(flag: boolean) {
  isVisible.value = flag;
}

// 暴露给父组件的方法和属性
defineExpose({ commentForm, nickname, setReply });
</script>

<style lang="scss" scoped>
</style> 