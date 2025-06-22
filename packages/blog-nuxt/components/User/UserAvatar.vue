<template>
  <div>
    <img
      class="user-avatar"
      :src="user.avatar"
      @click="isOpen = true"
      alt="用户头像"
    />
    <UModal v-model:open="isOpen" class="avatar-modal" :ui="ui">
      <template #header>
        <span class="text-lg font-semibold text-blue-500">修改头像</span>
      </template>
      
      <template #body>
        <div class="cropper-container">
          <vue-cropper
            ref="cropperRef"
            :img="options.img"
            :info="true"
            :autoCrop="options.autoCrop"
            :autoCropWidth="options.autoCropWidth"
            :autoCropHeight="options.autoCropHeight"
            :fixedBox="options.fixedBox"
            :outputType="options.outputType"
          ></vue-cropper>
        </div>
        
        <div class="mt-4">
          <UButton
            color="primary"
            @click="triggerUpload"
          >
            选择图片
          </UButton>
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            class="hidden"
            @change="onFileChange"
          />
        </div>
      </template>
      
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton color="gray" @click="isOpen = false">
            取消
          </UButton>
          <UButton color="success" @click="handleUpload">
            确认修改
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue';
import { VueCropper } from 'vue-cropper';
import 'vue-cropper/dist/index.css';
import { useUserStore } from '~/stores/user';
import { useToast } from '#imports';
import { useToken } from '~/composables/useToken';
import { useRuntimeConfig } from '#imports';

const user = useUserStore();
const toast = useToast();
const isOpen = ref(false);
const cropperRef = ref();
const fileInput = ref();

const options = reactive({
  img: user.avatar, // 裁剪图片的地址
  autoCrop: true, // 是否默认生成截图框
  autoCropWidth: 200, // 默认生成截图框宽度
  autoCropHeight: 200, // 默认生成截图框高度
  fixedBox: true, // 固定截图框大小 不允许改变
  outputType: "png", // 默认生成截图为PNG格式
});

// 触发文件上传
const triggerUpload = () => {
  fileInput.value.click();
};

// 文件改变事件
const onFileChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => {
    options.img = reader.result as string;
  };
  // 清空input，以便再次选择同一文件时能触发change事件
  e.target.value = '';
};

// 关闭弹窗时重置头像
watch(isOpen, (newVal) => {
  if (!newVal) {
    options.img = user.avatar;
  }
});

// 上传头像
const handleUpload = () => {
  cropperRef.value.getCropBlob(async (data) => {
    const formData = new FormData();
    formData.append('file', new File([data], 'avatar.png', { type: 'image/png' }));
    
    try {
      // 使用原生fetch API直接上传，绕过拦截器
      const token = useToken().getToken();
      const config = useRuntimeConfig();
      const baseURL = config.public.serviceBaseUrl;
      
      const response = await fetch(`${baseURL}/user/avatar`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': useToken().token_prefix + token
        }
      });
      
      const result = await response.json();
      
      if (result.flag) {
        options.img = result.data;
        user.avatar = options.img;
        isOpen.value = false;
        user.updateUserInfo(user);
        // 使用Nuxt UI的通知
        toast.add({
          title: '成功',
          description: '头像更新成功',
          color: 'success'
        });
      }
    } catch (error) {
      toast.add({
        title: '错误',
        description: '头像更新失败',
        color: 'error'
      });
    }
  });
};

// 自定义UI
const ui = computed(() => ({
  wrapper: 'items-center',
  container: 'max-w-2xl',
  overlay: 'bg-gray-900/60 backdrop-blur-sm',
  dialog: {
    container: 'bg-white dark:bg-gray-900 rounded-lg shadow-xl'
  }
}));

// 组件名称
defineOptions({
  name: 'UserAvatar'
});
</script>

<style scoped>
.user-avatar {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  cursor: pointer;
  object-fit: cover;
}

.cropper-container {
  width: 100%;
  height: 300px;
}
</style> 