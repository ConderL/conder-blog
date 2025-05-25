<template>
  <div>
    <!-- 这个组件作为注册表单内容，由useOverlay显示 -->
    <UForm :state="registerForm" class="w-full space-y-4" @submit="handleRegister">
      <!-- 邮箱输入 -->
      <UFormField label="邮箱" name="email" class="mb-3">
        <UInput
          v-model="registerForm.email"
          placeholder="请输入邮箱"
        />
      </UFormField>
      
      <!-- 昵称输入 -->
      <UFormField label="昵称" name="nickname" class="mb-3">
        <UInput
          v-model="registerForm.nickname"
          placeholder="请输入昵称"
        />
      </UFormField>
      
      <!-- 密码输入 -->
      <UFormField label="密码" name="password" class="mb-3">
        <UInput
          v-model="registerForm.password"
          type="password"
          placeholder="请输入密码"
        />
      </UFormField>
      
      <!-- 确认密码输入 -->
      <UFormField label="确认密码" name="confirmPassword" class="mb-3">
        <UInput
          v-model="registerForm.confirmPassword"
          type="password"
          placeholder="请再次输入密码"
        />
      </UFormField>

      <!-- 验证码 -->
      <UFormField label="验证码" name="code" class="mb-3">
        <div class="flex items-center gap-3">
          <UInput
            v-model="registerForm.code"
            placeholder="请输入验证码"
            class="flex-1"
          />
          <div v-if="captcha" class="w-32 h-10 overflow-hidden flex-shrink-0">
            <NuxtImg
              :src="captcha"
              alt="验证码"
              @click="initCaptcha"
              class="w-full h-full cursor-pointer"
              v-show="!captchaLoading"
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
      
      <!-- 注册按钮 -->
      <UButton
        block
        color="pink"
        variant="solid"
        type="submit"
        :loading="loading"
        class="rounded-md"
      >
        注 册
      </UButton>
      
      <!-- 去登录 -->
      <div class="flex justify-center mt-4">
        <UButton variant="link" color="pink" @click="handleLogin" class="hover:text-pink-600">已有账号？去登录</UButton>
      </div>
    </UForm>
  </div>
</template>

<script setup lang="ts">
import { debounce } from "~/utils/debounce";
import { register, getCaptcha } from "~/api/login";

interface RegisterForm {
  email: string;
  nickname: string;
  password: string;
  confirmPassword: string;
  code: string;
  captchaUUID: string;
}

// 计算属性和状态
const loading = ref(false);
const registerForm = reactive<RegisterForm>({
  email: "",
  nickname: "",
  password: "",
  confirmPassword: "",
  code: "",
  captchaUUID: "",
});
const captcha = ref("");
const captchaLoading = ref(false);

// 暴露给父组件的事件
const emit = defineEmits(['close', 'login']);

// 处理登录按钮点击
const handleLogin = () => {
  emit('close');
  emit('login');
};

// 处理注册
const handleRegister = async () => {
  // 邮箱格式验证
  let reg = /^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
  if (!reg.test(registerForm.email)) {
    window.$message?.warning("邮箱格式不正确");
    return;
  }
  
  // 昵称验证
  if (registerForm.nickname.trim().length == 0) {
    window.$message?.warning("昵称不能为空");
    return;
  }
  
  // 密码验证
  if (registerForm.password.trim().length == 0) {
    window.$message?.warning("密码不能为空");
    return;
  }
  
  // 确认密码
  if (registerForm.password !== registerForm.confirmPassword) {
    window.$message?.warning("两次密码不一致");
    return;
  }
  
  // 验证码验证
  if (registerForm.code.trim().length == 0) {
    window.$message?.warning("验证码不能为空");
    return;
  }
  
  loading.value = true;
  
  try {
    // 调用实际注册API
    const res = await register(registerForm);
    
    if (res.data.flag) {
      window.$message?.success("注册成功，请登录");
      
      // 重置表单
      registerForm.email = "";
      registerForm.nickname = "";
      registerForm.password = "";
      registerForm.confirmPassword = "";
      registerForm.code = "";
      registerForm.captchaUUID = "";
      
      // 关闭注册框，打开登录框
      emit('close');
      emit('login');
    }
  } catch (error) {
    console.error("注册失败", error);
    window.$message?.error("注册失败，请重试");
  } finally {
    loading.value = false;
  }
};

// 初始化验证码
const initCaptcha = debounce(async () => {
  captchaLoading.value = true;
  
  try {
    // 调用获取验证码API
    const res = await getCaptcha();
    
    if (res.data.flag) {
      captcha.value = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(res.data.data.captchaImg)}`;
      registerForm.captchaUUID = res.data.data.captchaUuid;
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