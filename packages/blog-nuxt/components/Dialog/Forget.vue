<template>
  <div>
    <!-- 这个组件作为忘记密码表单内容，由useOverlay显示 -->
    <UForm :state="forgetForm" class="w-full space-y-4" @submit="handleSubmit">
      <!-- 邮箱输入 -->
      <UFormField label="邮箱" name="email" class="mb-3">
        <UInput
          v-model="forgetForm.email"
          placeholder="请输入邮箱"
        />
      </UFormField>
      
      <!-- 验证码 -->
      <UFormField label="验证码" name="code" class="mb-3">
        <div class="flex items-center gap-3">
          <UInput
            v-model="forgetForm.code"
            placeholder="请输入验证码"
            class="flex-1"
          />
          <UButton
            variant="outline"
            color="pink"
            class="w-32 flex-shrink-0 rounded-md"
            :loading="sending"
            :disabled="timer > 0"
            @click="sendCode"
          >
            {{ timer > 0 ? `${timer}秒后重试` : '获取验证码' }}
          </UButton>
        </div>
      </UFormField>
      
      <!-- 新密码输入 -->
      <UFormField label="新密码" name="password" class="mb-3">
        <UInput
          v-model="forgetForm.password"
          type="password"
          placeholder="请输入新密码"
        />
      </UFormField>
      
      <!-- 确认密码输入 -->
      <UFormField label="确认密码" name="confirmPassword" class="mb-3">
        <UInput
          v-model="forgetForm.confirmPassword"
          type="password"
          placeholder="请再次输入密码"
        />
      </UFormField>
      
      <!-- 提交按钮 -->
      <UButton
        block
        color="pink"
        variant="solid"
        type="submit"
        :loading="loading"
        class="rounded-md"
      >
        提 交
      </UButton>
      
      <!-- 返回登录 -->
      <div class="flex justify-center mt-4">
        <UButton variant="link" color="pink" @click="handleLogin" class="hover:text-pink-600">返回登录</UButton>
      </div>
    </UForm>
  </div>
</template>

<script setup lang="ts">
import { forget, sendEmailCode } from "~/api/login";

interface ForgetForm {
  email: string;
  code: string;
  password: string;
  confirmPassword: string;
}

// 计算属性和状态
const loading = ref(false);
const sending = ref(false);
const timer = ref(0);
const forgetForm = reactive<ForgetForm>({
  email: "",
  code: "",
  password: "",
  confirmPassword: ""
});

// 暴露给父组件的事件
const emit = defineEmits(['close', 'login']);

// 处理登录按钮点击
const handleLogin = () => {
  emit('close');
  emit('login');
};

// 发送验证码
const sendCode = async () => {
  // 邮箱格式验证
  let reg = /^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
  if (!reg.test(forgetForm.email)) {
    window.$message?.warning("邮箱格式不正确");
    return;
  }
  
  sending.value = true;
  
  try {
    // 调用实际发送验证码API
    const res = await sendEmailCode(forgetForm.email, 'forget');
    
    if (res.data.flag) {
      window.$message?.success("验证码已发送至邮箱");
      startTimer();
    }
  } catch (error) {
    console.error("发送验证码失败", error);
    window.$message?.error("发送验证码失败，请重试");
  } finally {
    sending.value = false;
  }
};

// 开始倒计时
const startTimer = () => {
  timer.value = 60;
  const interval = setInterval(() => {
    timer.value--;
    if (timer.value <= 0) {
      clearInterval(interval);
    }
  }, 1000);
};

// 处理提交
const handleSubmit = async () => {
  // 邮箱格式验证
  let reg = /^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
  if (!reg.test(forgetForm.email)) {
    window.$message?.warning("邮箱格式不正确");
    return;
  }
  
  // 验证码验证
  if (forgetForm.code.trim().length == 0) {
    window.$message?.warning("验证码不能为空");
    return;
  }
  
  // 密码验证
  if (forgetForm.password.trim().length == 0) {
    window.$message?.warning("密码不能为空");
    return;
  }
  
  // 确认密码
  if (forgetForm.password !== forgetForm.confirmPassword) {
    window.$message?.warning("两次密码不一致");
    return;
  }
  
  loading.value = true;
  
  try {
    // 调用实际忘记密码API
    const res = await forget(forgetForm);
    
    if (res.data.flag) {
      window.$message?.success("密码重置成功，请登录");
      
      // 重置表单
      forgetForm.email = "";
      forgetForm.code = "";
      forgetForm.password = "";
      forgetForm.confirmPassword = "";
      
      // 关闭忘记密码框，打开登录框
      emit('close');
      emit('login');
    }
  } catch (error) {
    console.error("重置密码失败", error);
    window.$message?.error("重置密码失败，请重试");
  } finally {
    loading.value = false;
  }
};

// 组件卸载时清除定时器
onUnmounted(() => {
  if (timer.value > 0) {
    timer.value = 0;
  }
});
</script> 