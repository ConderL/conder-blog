<template>
  <div>
    <!-- 这个组件作为登录表单内容，由useOverlay显示 -->
    <UForm :state="loginForm" class="w-full space-y-4" @submit="handleLogin">
      <!-- 邮箱输入 -->
      <UFormField name="email" class="mb-13">
        <UInput
          v-model="loginForm.email"
          placeholder="请输入邮箱"
        />
      </UFormField>
      
      <!-- 密码输入 -->
      <UFormField name="password" class="mb-13">
        <UInput
          v-model="loginForm.password"
          type="password"
          placeholder="请输入密码"
        />
      </UFormField>
      
      <!-- 验证码 -->
      <UFormField name="code" class="mb-13">
        <div class="flex items-center gap-3">
          <UInput
            v-model="loginForm.code"
            placeholder="请输入验证码"
            class="flex-1"
          />
          <div v-if="captcha" class="w-32 h-10 overflow-hidden flex-shrink-0">
            <NuxtImg
              v-show="!captchaLoading"
              :src="captcha"
              alt="验证码"
              class="w-full h-full cursor-pointer"
              @click="initCaptcha"
            />
            <div v-show="captchaLoading" class="w-full h-full flex items-center justify-center">
              <UIcon name="icon:update" class="animate-spin" />
            </div>
          </div>
          <div
            v-else
            class="w-32 h-10 flex-shrink-0 flex items-center justify-center cursor-pointer"
            @click="initCaptcha"
          >
            <UIcon name="icon:update" class="animate-spin" />
          </div>
        </div>
      </UFormField>
      
      <!-- 登录按钮 -->
      <UButton
        block
        variant="solid"
        type="submit"
        :loading="loading"
        class="rounded-md"
      >
        登 录
      </UButton>
      
      <!-- 注册和忘记密码 -->
      <div class="flex justify-between mt-4">
        <UButton variant="link" color="pink" class="hover:text-pink-600" @click="handleRegister">立即注册</UButton>
        <UButton variant="link" color="pink" class="hover:text-pink-600" @click="handleForget">忘记密码?</UButton>
      </div>
      
      <!-- 社交登录 -->
      <div class="mt-6">
        <div class="text-center text-sm text-gray-500 relative my-3">
          <span class="bg-white dark:bg-gray-900 px-2 relative z-10">社交账号登录</span>
          <div class="absolute top-1/2 left-0 right-0 h-px bg-gray-200 dark:bg-gray-800"></div>
        </div>
        <div class="flex justify-center gap-6 mt-3">
          <div v-if="showLogin('qq')" class="cursor-pointer hover:opacity-80 transition-opacity" @click="qqLogin">
            <UIcon name="icon:qq" class="text-[#00aaee] w-8 h-8 hover:scale-110 transition-transform" />
          </div>
          <div v-if="showLogin('gitee')" class="cursor-pointer hover:opacity-80 transition-opacity" @click="giteeLogin">
            <UIcon name="icon:gitee" class="w-8 h-8 hover:scale-110 transition-transform" />
          </div>
          <div v-if="showLogin('github')" class="cursor-pointer hover:opacity-80 transition-opacity" @click="githubLogin">
            <UIcon name="icon:github" class="w-8 h-8 hover:scale-110 transition-transform" />
          </div>
        </div>
      </div>
    </UForm>
  </div>
</template>

<script setup lang="ts">
import { useAppStore, useBlogStore, useUserStore } from "~/stores";
import { setToken } from "~/utils/token";
import { debounce } from "~/utils/debounce";
import { encryptPassword } from "~/utils/secret";

// 计算属性和状态
const app = useAppStore();
const user = useUserStore();
const blog = useBlogStore();
const { login: loginApi } = useApi();
const loading = ref(false);
const loginForm = reactive<LoginForm>({
  email: "",
  password: "",
  code: "",
  captchaUUID: ""
});
const captcha = ref("");
const captchaLoading = ref(false);

// 显示社交登录按钮的计算属性
const showLogin = (type: string) => {
  return blog.loginList.includes(type) || false;
};

// 暴露给父组件的事件
const emit = defineEmits(['close', 'register', 'forget']);

// 处理注册按钮点击
const handleRegister = () => {
  emit('close');
  emit('register');
};

// 处理忘记密码按钮点击
const handleForget = () => {
  emit('close');
  emit('forget');
};

// 社交登录
const config = {
  QQ_APP_ID: '123456789',
  QQ_REDIRECT_URL: 'http://localhost:3334/oauth/login/qq',
  GITEE_CLIENT_ID: '123456789',
  GITEE_REDIRECT_URL: 'http://localhost:3334/oauth/login/gitee',
  GITHUB_APP_ID: '123456789',
  GITHUB_REDIRECT_URL: 'http://localhost:3334/oauth/login/github'
};

// QQ登录
const qqLogin = () => {
  emit('close');
  
  if (process.client) {
    window.open(
      `https://graph.qq.com/oauth2.0/authorize?response_type=code&client_id=${
        config.QQ_APP_ID
      }&redirect_uri=${config.QQ_REDIRECT_URL}&scope=scope&display=display`,
      "_self"
    );
  }
};

// Gitee登录
const giteeLogin = () => {
  emit('close');
  
  if (process.client) {
    window.open(
      `https://gitee.com/oauth/authorize?client_id=${
        config.GITEE_CLIENT_ID
      }&response_type=code&redirect_uri=${config.GITEE_REDIRECT_URL}`,
      "_self"
    );
  }
};

// GitHub登录
const githubLogin = () => {
  emit('close');
  
  if (process.client) {
    window.open(
      `https://github.com/login/oauth/authorize?client_id=${
        config.GITHUB_APP_ID
      }&redirect_uri=${config.GITHUB_REDIRECT_URL}&scope=user`,
      "_self"
    );
  }
};

// 处理登录
const handleLogin = async () => {
  // 邮箱格式验证
  const reg = /^[A-Za-z0-9\u4E00-\u9FA5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
  if (!reg.test(loginForm.email)) {
    window.$message?.warning("邮箱格式不正确");
    return;
  }
  
  // 密码验证
  if (loginForm.password.trim().length == 0) {
    window.$message?.warning("密码不能为空");
    return;
  }
  
  // 验证码验证
  if (loginForm.code.trim().length == 0) {
    window.$message?.warning("验证码不能为空");
    return;
  }
  
  loading.value = true;
  
  try {
    // 加密密码
    const encryptedPassword = encryptPassword(loginForm.password);
    
    // 调用实际登录API
    const res = await loginApi.login({
      ...loginForm,
      password: encryptedPassword
    });
    
    if (res.data.flag) {
      setToken(res.data.data.token);
      user.loadToken();
      await user.fetchUserInfo(); // 获取用户信息
      window.$message?.success("登录成功");
      
      // 重置表单
      loginForm.email = "";
      loginForm.password = "";
      loginForm.code = "";
      loginForm.captchaUUID = "";
      
      // 关闭登录框
      emit('close');
    }
  } catch (error) {
    console.error("登录失败", error);
  } finally {
    loading.value = false;
  }
};

// 初始化验证码
const initCaptcha = debounce(async () => {
  captchaLoading.value = true;
  
  try {
    // 调用获取验证码API
    const res = await loginApi.getCaptcha();
    
    if (res.data.flag) {
      captcha.value = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(res.data.data.captchaImg)}`;
      loginForm.captchaUUID = res.data.data.captchaUuid;
    }
  } catch (error) {
    console.error("获取验证码失败", error);
  } finally {
    captchaLoading.value = false;
  }
}, 500);

// 组件挂载时初始化验证码
onMounted(() => {
  initCaptcha();
});

defineExpose({
  initCaptcha
});
</script>

<style scoped>
/* 社交登录图标鼠标悬停效果 */
.cursor-pointer:hover {
  opacity: 0.8;
  transform: scale(1.1);
  transition: all 0.3s ease;
}
</style> 