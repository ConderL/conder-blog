<template>
  <div class="reply-box" v-if="show">
    <div class="box-normal">
      <div class="reply-box-avatar">
        <img
          class="shoka-avatar"
          v-if="userStore.userInfo?.avatar"
          :src="userStore.userInfo.avatar"
          alt=""
        />
        <img
          class="shoka-avatar"
          v-else
          src="/images/default-avatar.png"
          alt=""
        />
      </div>
      <div class="reply-box-warp">
        <textarea
          class="reply-box-textarea"
          v-model="commentContent"
          :style="sendActive ? lineStyle : ''"
          @input.prevent="inputActive"
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
      <!-- 表情选择器组件，暂时省略 -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, toRefs, defineEmits, defineProps, defineExpose } from 'vue';
import { processEmoji } from '../utils/emojiProcessor';
import { useUserStore } from '../stores/user';

// 在Nuxt中使用Pinia store
const userStore = useUserStore();

const lineStyle = {
  lineHeight: "normal",
  borderColor: "#ed6ea0",
  backgroundColor: "var(--grey-0)",
};

const emit = defineEmits(["reload"]);

const props = defineProps({
  commentType: {
    type: Number,
  },
  show: {
    type: Boolean,
    default: true,
  },
  typeId: {
    type: Number,
  },
});

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

const { nickname, sendActive, show, commentContent, emojiType, commentForm } = toRefs(data);

const placeholderText = computed(() =>
  nickname.value ? `回复 @${nickname.value}：` : "发一条友善的评论"
);

const inputActive = () => {
  if (commentContent.value.length == 0) {
    sendActive.value = false;
  } else {
    sendActive.value = true;
  }
};

const handleEmoji = (key: string) => {
  commentContent.value += key;
  sendActive.value = true;
};

const handleType = (key: number) => {
  emojiType.value = key;
};

const handleAdd = () => {
  // 检查登录状态
  if (!userStore.isLogin) {
    alert("请先登录");
    return;
  }

  if (commentContent.value.trim() == "") {
    alert("评论不能为空");
    return;
  }

  // 使用工具函数处理表情
  commentForm.value.commentContent = processEmoji(
    commentContent.value,
    emojiType.value,
  );

  console.log("发送评论", commentForm.value);
  
  // 模拟评论成功
  sendActive.value = false;
  commentContent.value = "";
  alert("评论成功");
  
  // 重新加载评论列表
  emit("reload");
};

const setReply = (flag: boolean) => {
  show.value = flag;
};

defineExpose({ commentForm, nickname, setReply });
</script>

<style lang="scss" scoped>
.reply-box {
  margin-bottom: 1rem;
  
  .box-normal {
    display: flex;
    align-items: flex-start;
  }
  
  .reply-box-avatar {
    margin-right: 0.5rem;
    
    .shoka-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
    }
  }
  
  .reply-box-warp {
    flex: 1;
    
    .reply-box-textarea {
      width: 100%;
      min-height: 80px;
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      resize: vertical;
      transition: all 0.3s;
      
      &:focus {
        outline: none;
        border-color: #ed6ea0;
      }
    }
  }
  
  .reply-box-send {
    margin-left: 0.5rem;
    padding: 0.5rem 1rem;
    color: #fff;
    background-color: #ccc;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s;
    
    &.send-active {
      background-color: #ed6ea0;
    }
  }
}
</style> 