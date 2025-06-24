<template>
  <div>
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">个人中心</h1>
      <img
        class="page-cover"
        :src="blog.blogInfo.siteConfig?.albumWallpaper"
        alt="页面背景"
      />
      <Waves></Waves>
    </div>
    
    <!-- 页面内容 -->
    <div class="bg">
      <div class="page-container">
        <div class="title">基本信息</div>
        <div class="info-container">
          <!-- 用户头像 -->
          <UserAvatar class="avatar"></UserAvatar>
          
          <!-- 用户信息 -->
          <div class="info mt-4">
            <UForm
              ref="formRef"
              :state="userForm"
              class="user-form"
              @submit="handleUpdate"
            >
              <UFormField name="nickname" class="mb-4" label="昵称">
                <UInput v-model="userForm.nickname" placeholder="输入您的昵称" />
              </UFormField>
              
              <UFormField name="webSite" class="mb-4" label="个人网站">
                <UInput v-model="userForm.webSite" placeholder="请输入个人网站" />
              </UFormField>
              
              <UFormField name="intro" class="mb-4" label="简介">
                <UInput v-model="userForm.intro" placeholder="介绍一下自己吧" />
              </UFormField>
              
              <UFormField name="email" class="mb-4" label="邮箱">
                <div class="flex gap-2">
                  <UInput v-model="user.email" placeholder="请输入邮箱" disabled class="flex-1" />
                  <UButton 
                    color="primary" 
                    @click="emailModalOpen = true"
                  >
                    {{ user.email ? '修改邮箱' : '绑定邮箱' }}
                  </UButton>
                </div>
              </UFormField>
              
              <div class="mt-4">
                <UButton color="success" type="submit">
                  修改
                </UButton>
              </div>
            </UForm>
          </div>
        </div>
        
        <!-- 个人追番列表 -->
        <div class="title mt-8">我的追番</div>
        <div class="anime-collection-container">
          <AnimeList 
            :isCollection="true" 
            :queryParams="animeQueryParams"
            emptyText="暂无追番记录，快去追一部番剧吧"
            @update:queryParams="updateAnimeQueryParams"
          >
            <template #empty-action>
              <UButton
                to="/anime"
                icon="i-lucide-tv-2"
                class="mt-4"
              >
                去追番
              </UButton>
            </template>
          </AnimeList>
        </div>
      </div>
    </div>
    
    <!-- 修改邮箱弹窗 -->
    <UModal v-model:open="emailModalOpen" :ui="ui">
      <template #header>
        <span class="text-lg font-semibold text-blue-500">
          {{ user.email ? '修改邮箱' : '绑定邮箱' }}
        </span>
      </template>
      
      <template #body>
        <UForm
          ref="emailFormRef"
          :state="emailForm"
          class="space-y-4"
          @submit="handleUpdateEmail"
        >
          <UFormField name="email" class="mb-4" label="邮箱">
            <UInput v-model="emailForm.email" placeholder="请输入邮箱" />
          </UFormField>
          
          <UFormField name="code" class="mb-4" label="验证码">
            <div class="flex gap-2">
              <UInput v-model="emailForm.code" placeholder="请输入验证码" class="flex-1" />
              <UButton color="primary" @click="sendCode">
                {{ timer > 0 ? `重新发送(${timer}s)` : '获取验证码' }}
              </UButton>
            </div>
          </UFormField>
          
          <div class="flex justify-end gap-2">
            <UButton color="gray" @click="emailModalOpen = false">
              取消
            </UButton>
            <UButton color="success" type="submit">
              确认修改
            </UButton>
          </div>
        </UForm>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useUserStore } from '~/stores/user';
import { useBlogStore } from '~/stores/blog';
import { useApi } from '~/composables/useApi';
import { useToast } from '#imports';
import UserAvatar from '~/components/User/UserAvatar.vue';
import AnimeList from '~/components/Anime/AnimeList.vue';

// 定义页面元数据
definePageMeta({
  title: '个人中心',
  middleware: ['auth']
});

// 获取用户信息和博客信息
const user = useUserStore();
const blog = useBlogStore();
const router = useRouter();
const toast = useToast();
const { user: userApi, login: loginApi, anime: animeApi } = useApi();

// 用户信息表单
const formRef = ref();
const userForm = reactive({
  nickname: user.nickname,
  intro: user.intro || '',
  webSite: user.webSite || '',
});

// 追番列表查询参数
const animeQueryParams = ref({
  page: 1,
  limit: 12,
  sortBy: 'rating'
});

// 更新查询参数
const updateAnimeQueryParams = (newParams) => {
  animeQueryParams.value = newParams;
};

// 修改用户信息
const handleUpdate = async () => {
  // 验证昵称是否为空
  if (!userForm.nickname?.trim()) {
    toast.add({
      title: '错误',
      description: '昵称不能为空',
      color: 'error'
    });
    return;
  }
  
  try {
    const response: any = await userApi.updateUserInfo(userForm);
    
    if (response.flag) {
      // 更新用户信息
      user.updateUserInfo(userForm);
      
      toast.add({
        title: '成功',
        description: '修改成功',
        color: 'success'
      });
    }
  } catch (error) {
    toast.add({
      title: '错误',
      description: '用户信息更新失败',
      color: 'error'
    });
  }
};

// 邮箱相关
const emailModalOpen = ref(false);
const emailFormRef = ref();
const timer = ref(0);
const emailForm = reactive({
  email: '',
  code: ''
});

// 发送验证码
const sendCode = async () => {
  if (timer.value > 0) return;
  
  // 邮箱格式验证
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailForm.email || !emailRegex.test(emailForm.email)) {
    toast.add({
      title: '错误',
      description: '请输入正确的邮箱格式',
      color: 'error'
    });
    return;
  }
  
  try {
    const response: any = await loginApi.sendEmailCode(emailForm.email);
    
    if (response.flag) {
      toast.add({
        title: '成功',
        description: '验证码发送成功',
        color: 'success'
      });
      
      // 开始倒计时
      timer.value = 60;
      const interval = setInterval(() => {
        timer.value--;
        if (timer.value <= 0) {
          clearInterval(interval);
        }
      }, 1000);
    }
  } catch (error) {
    toast.add({
      title: '错误',
      description: '验证码发送失败',
      color: 'error'
    });
  }
};

// 更新邮箱
const handleUpdateEmail = async () => {
  // 验证邮箱
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailForm.email || !emailRegex.test(emailForm.email)) {
    toast.add({
      title: '错误',
      description: '请输入正确的邮箱格式',
      color: 'error'
    });
    return;
  }
  
  // 验证验证码
  if (!emailForm.code?.trim()) {
    toast.add({
      title: '错误',
      description: '验证码不能为空',
      color: 'error'
    });
    return;
  }
  
  try {
    const response: any = await userApi.updateUserEmail(emailForm);
    
    if (response.flag) {
      // 更新用户邮箱
      user.email = emailForm.email;
      
      toast.add({
        title: '成功',
        description: '邮箱更新成功',
        color: 'success'
      });
      
      // 关闭弹窗
      emailModalOpen.value = false;
      
      // 重置表单
      emailForm.email = '';
      emailForm.code = '';
    }
  } catch (error) {
    toast.add({
      title: '错误',
      description: '邮箱更新失败',
      color: 'error'
    });
  }
};

// 自定义UI配置
const ui = {
  ring: '',
  background: '',
  divide: '',
  base: 'relative overflow-hidden flex flex-col',
  width: 'sm:max-w-lg',
  height: '',
  rounded: 'rounded-lg',
  shadow: 'shadow-xl',
  body: {
    padding: 'p-4',
    background: 'bg-white',
  },
  header: {
    padding: 'p-4',
    background: 'bg-white border-b',
    align: 'text-left',
  },
  footer: {
    padding: 'p-4',
    align: 'flex justify-end',
    background: 'bg-white border-t'
  }
};
</script>

<style lang="scss" scoped>
@use "~/assets/style/mixin.scss";

.page-header {
  position: relative;
  padding: 3rem 0;
  color: #fff;
  text-align: center;
  background-color: var(--primary-color);
  
  .page-title {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
    color: var(--header-text-color);
    position: relative;
    z-index: 1;
  }
  
  .page-cover {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    z-index: 0;
  }
}

.bg {
  background-color: var(--background-color);
  padding: 2rem 0;
  min-height: 70vh;
}

.page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 3rem;
}

.title {
  font-size: 1.25rem;
  font-weight: 700;
}

.info-container {
  @include mixin.flex;
  flex-wrap: wrap;
  margin-top: 1rem;

  .avatar {
    display: inline-flex;
    width: 230px;
    height: 140px;
  }

  .info {
    width: 530px;
  }
}

.user-form :deep(.u-form-group) {
  margin-bottom: 1rem;
  
  .u-form-group-label {
    min-width: 80px;
    text-align: left;
    color: var(--text-color);
  }
}

.anime-collection-container {
  background: var(--card-bg);
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
  padding: 20px;
  margin-top: 20px;
}

@media (max-width: 850px) {
  .avatar {
    justify-content: center;
  }
  
  .info {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .page-title {
    font-size: 2rem !important;
  }
  
  .page-container {
    padding: 1.5rem;
  }
  
  .anime-collection-container {
    padding: 15px;
  }
}
</style> 