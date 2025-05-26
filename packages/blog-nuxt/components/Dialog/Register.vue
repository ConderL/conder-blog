<template>
  <div>
    <!-- 这个组件作为注册表单内容，由useOverlay显示 -->
    <UForm :state="registerForm" class="w-full space-y-4" @submit="handleRegister">
      <!-- 邮箱输入 -->
      <UFormField name="email" class="mb-8">
        <UInput
          v-model="registerForm.email"
          placeholder="请输入邮箱"
        />
      </UFormField>
      
      <!-- 验证码输入组 -->
      <UFormField name="code" class="mb-8">
        <div class="flex gap-3">
          <UInput
            v-model="registerForm.code"
            placeholder="请输入验证码"
            class="flex-1"
          />
          <UButton color="info" :disabled="flag" class="whitespace-nowrap" @click="sendCode">
            {{ timer == 0 ? "发送" : `${timer}s` }}
          </UButton>
        </div>
      </UFormField>
      
      <!-- 昵称输入 -->
      <UFormField name="nickname" class="mb-8">
        <UInput
          v-model="registerForm.nickname"
          placeholder="请输入昵称"
        />
      </UFormField>
      
      <!-- 密码输入 -->
      <UFormField name="password" class="mb-8">
        <UInput
          v-model="registerForm.password"
          type="password"
          placeholder="请输入密码"
        />
      </UFormField>
      
      <!-- 确认密码输入 -->
      <UFormField name="confirmPassword" class="mb-8">
        <UInput
          v-model="registerForm.confirmPassword"
          type="password"
          placeholder="请再次输入密码"
        />
      </UFormField>
      
      <!-- 注册按钮 -->
      <UButton
        block
        color="primary"
        variant="solid"
        type="submit"
        :loading="loading"
        class="rounded-md"
      >
        注 册
      </UButton>
      
      <!-- 去登录 -->
      <div class="flex justify-center mt-4">
        <UButton variant="link" color="pink" class="hover:text-pink-600" @click="handleLogin">已有账号？去登录</UButton>
      </div>
    </UForm>
  </div>
</template>

<script setup lang="ts">
import { useIntervalFn } from "@vueuse/core";
import { encryptPassword } from "~/utils/secret";
import { useUserStore } from "~/stores/user";

interface RegisterForm {
  email: string;
  nickname: string;
  password: string;
  confirmPassword: string;
  code: string;
}

// 计算属性和状态
const loading = ref(false);
const timer = ref(0);
const flag = ref(false);
const registerForm = reactive<RegisterForm>({
  email: "",
  nickname: "",
  password: "",
  confirmPassword: "",
  code: "",
});

const { login: loginApi } = useApi();

// 暴露给父组件的事件
const emit = defineEmits(['close', 'login']);

// 处理登录按钮点击
const handleLogin = () => {
  emit('close');
  emit('login');
};

// 倒计时功能
const { pause, resume } = useIntervalFn(
  () => {
    timer.value--;
    if (timer.value <= 0) {
      // 停止定时器
      pause();
      flag.value = false;
    }
  },
  1000,
  { immediate: false }
);

// 开始倒计时
const start = (time: number) => {
  flag.value = true;
  timer.value = time;
  // 启动定时器
  resume();
};

// 发送验证码
const sendCode = () => {
  // 邮箱格式验证
  const reg = /^[A-Za-z0-9\u4E00-\u9FA5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
  if (!reg.test(registerForm.email)) {
    window.$message?.warning("邮箱格式不正确");
    return;
  }
  
  start(60);
  loginApi.sendEmailCode(registerForm.email)
    .then((res: any) => {
      if (res.data.flag) {
        window.$message?.success("验证码发送成功");
      }
    })
    .catch((error) => {
      console.error("发送验证码失败", error);
      window.$message?.error("验证码发送失败");
      // 重置倒计时
      flag.value = false;
      timer.value = 0;
      pause();
    });
};

// 处理注册
const handleRegister = async () => {
  // 邮箱格式验证
  const reg = /^[A-Za-z0-9\u4E00-\u9FA5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
  if (!reg.test(registerForm.email)) {
    window.$message?.warning("邮箱格式不正确");
    return;
  }
  
  // 验证码验证
  if (registerForm.code.trim().length !== 6) {
    window.$message?.warning("请输入6位验证码");
    return;
  }
  
  // 昵称验证
  if (registerForm.nickname.trim().length === 0) {
    window.$message?.warning("昵称不能为空");
    return;
  }
  
  // 密码验证
  if (registerForm.password.trim().length < 6) {
    window.$message?.warning("密码不能少于6位");
    return;
  }
  
  // 确认密码
  if (registerForm.password !== registerForm.confirmPassword) {
    window.$message?.warning("两次密码不一致");
    return;
  }
  
  loading.value = true;
  
  try {
    // 调用实际注册API，不加密密码
    const res = await loginApi.register({
      email: registerForm.email,
      code: registerForm.code,
      password: registerForm.password,
      nickname: registerForm.nickname
    });
    
    if (res.data.flag) {
      // 注册成功后自动登录，这里需要加密密码
      try {
        const loginRes = await loginApi.login({
          email: registerForm.email,
          password: encryptPassword(registerForm.password)
        });
        
        if (loginRes.data.flag) {
          // 存储token
          const token = loginRes.data.data.token;
          localStorage.setItem('token', token);
          
          // 获取用户信息
          const user = useUserStore();
          await user.fetchUserInfo();
          
          window.$message?.success("注册并登录成功");
        } else {
          window.$message?.success("注册成功，请登录");
        }
      } catch (loginError) {
        console.error("自动登录失败", loginError);
        window.$message?.success("注册成功，请手动登录");
      }
      
      // 重置表单
      registerForm.email = "";
      registerForm.nickname = "";
      registerForm.password = "";
      registerForm.confirmPassword = "";
      registerForm.code = "";
      
      // 关闭注册框
      emit('close');
    }
  } catch (error) {
    console.error("注册失败", error);
  } finally {
    loading.value = false;
  }
};

defineExpose({
  name: 'Register'
});
</script> 