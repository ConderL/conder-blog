<template>
  <div>
    <!-- 这个组件作为忘记密码表单内容，由useOverlay显示 -->
    <UForm :state="forgetForm" class="w-full space-y-4" @submit="handleForget">
      <!-- 邮箱输入 -->
      <UFormField name="username" class="mb-8">
        <UInput
          v-model="forgetForm.username"
          placeholder="请输入邮箱"
        />
      </UFormField>
      
      <!-- 验证码输入组 -->
      <UFormField name="code" class="mb-8">
        <div class="flex gap-3">
          <UInput
            v-model="forgetForm.code"
            placeholder="请输入验证码"
            class="flex-1"
          />
          <UButton color="info" :disabled="flag" class="whitespace-nowrap" @click="sendCode">
            {{ timer == 0 ? "发送" : `${timer}s` }}
          </UButton>
        </div>
      </UFormField>
      
      <!-- 密码输入 -->
      <UFormField name="password" class="mb-8">
        <UInput
          v-model="forgetForm.password"
          type="password"
          placeholder="请输入新密码"
        />
      </UFormField>
      
      <!-- 确认按钮 -->
      <UButton
        block
        color="success"
        variant="solid"
        type="submit"
        :loading="loading"
        class="rounded-md"
      >
        确 定
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

const { login: loginApi } = useApi();
// 计算属性和状态
const loading = ref(false);
const timer = ref(0);
const flag = ref(false);
const forgetForm = reactive<UserForm>({
  username: "",
  password: "",
  code: ""
});

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
  if (!reg.test(forgetForm.username as string)) {
    window.$message?.warning("邮箱格式不正确");
    return;
  }
  
  start(60);
  loginApi.sendEmailCode(forgetForm.username as string)
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

// 处理忘记密码
const handleForget = async () => {
  // 验证码验证
  if ((forgetForm.code?.trim().length || 0) != 6) {
    window.$message?.warning("请输入6位验证码");
    return;
  }
  
  // 密码验证
  if ((forgetForm.password?.trim().length || 0) < 6) {
    window.$message?.warning("密码不能少于6位");
    return;
  }
  
  loading.value = true;
  
  try {
    // 调用修改密码API
    const res = await loginApi.updateUserPassword(forgetForm);
    
    if (res.data.flag) {
      window.$message?.success("修改成功");
      
      // 重置表单
      forgetForm.username = "";
      forgetForm.password = "";
      forgetForm.code = "";
      
      // 关闭忘记密码框，打开登录框
      emit('close');
      emit('login');
    }
  } catch (error) {
    console.error("修改密码失败", error);
  } finally {
    loading.value = false;
  }
};

defineExpose({
  name: 'Forget'
});
</script> 