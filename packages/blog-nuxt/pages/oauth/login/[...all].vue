<template>
  <div class="oauth-background">
    <div id="preloader_6">
      <span></span>
      <span></span>
      <span></span>
      <span></span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '~/stores/user';
import { useRouter, useRoute } from '#imports';
import { useToast } from '#imports';

// 定义页面元数据
definePageMeta({
  layout: 'default',
  title: '第三方登录回调'
});

// SEO优化
useHead({
  title: '授权登录 - 处理中',
  meta: [
    { name: 'robots', content: 'noindex, nofollow' }
  ]
});

const user = useUserStore();
const router = useRouter();
const route = useRoute();
const toast = useToast();
const { login: loginApi } = useApi();

// 获取当前路径和token
const pathSegments = route.params.all;
const loginType = Array.isArray(pathSegments) ? pathSegments[0] : pathSegments;
const token = route.query.token as string;

// 处理登录成功后的逻辑
const handleLoginSuccess = async (token: string) => {
  // 设置Token
  user.setToken(token);
  
  // 获取用户信息
  await user.fetchUserInfo();
  
  if (!user.email) {
    toast.add({
      title: '提示',
      description: '请绑定邮箱以便及时收到回复',
      color: 'warning'
    });
  } else {
    toast.add({
      title: '成功',
      description: '登录成功',
      color: 'success'
    });
  }
};

// 处理登录失败
const handleLoginError = (error: any) => {
  toast.add({
    title: '错误',
    description: error.message || '登录失败',
    color: 'error'
  });
};

// 处理第三方登录
const handleOAuthLogin = async () => {
  if (!token) {
    toast.add({
      title: '错误',
      description: '登录失败：缺少令牌',
      color: 'error'
    });
    return;
  }

  try {
    let response;
    switch (loginType) {
      case 'qq':
        response = await loginApi.qqLogin({ token });
        break;
      case 'gitee':
        response = await loginApi.giteeLogin({ token });
        break;
      case 'github':
        response = await loginApi.githubLogin({ token });
        break;
      default:
        throw new Error('不支持的登录类型');
    }

    if (response && response.flag) {
      // 直接使用token，不需要再次提取data
      await handleLoginSuccess(response.data);
    } else {
      toast.add({
        title: '错误',
        description: '登录失败',
        color: 'error'
      });
    }
  } catch (error) {
    console.error('第三方登录错误:', error);
    handleLoginError(error);
  }
};

// 登录完成后跳转
const redirectAfterLogin = () => {
  // 获取用户之前访问的路径，如果没有则跳转到首页
  const redirectPath = localStorage.getItem('redirect_path') || '/';
  localStorage.removeItem('redirect_path'); // 使用后删除
  router.push(redirectPath);
};

// 页面加载时执行登录流程
onMounted(async () => {
  // 执行登录流程
  try {
    await handleOAuthLogin();
  } catch (error) {
    console.error('登录过程出错:', error);
  } finally {
    // 无论成功失败都进行重定向
    redirectAfterLogin();
  }
});
</script>

<style scoped>
.oauth-background {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  z-index: 1000;
}

#preloader_6 {
  position: relative;
  top: 45vh;
  left: 47vw;
  animation: preloader_6 5s infinite linear;
}

#preloader_6 span {
  width: 20px;
  height: 20px;
  position: absolute;
  background: red;
  display: block;
  animation: preloader_6_span 1s infinite linear;
}

#preloader_6 span:nth-child(1) {
  background: #2ecc71;
}

#preloader_6 span:nth-child(2) {
  left: 22px;
  background: #9b59b6;
  animation-delay: 0.2s;
}

#preloader_6 span:nth-child(3) {
  top: 22px;
  background: #3498db;
  animation-delay: 0.4s;
}

#preloader_6 span:nth-child(4) {
  top: 22px;
  left: 22px;
  background: #f1c40f;
  animation-delay: 0.6s;
}

@keyframes preloader_6 {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

@keyframes preloader_6_span {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(0.5);
  }

  100% {
    transform: scale(1);
  }
}
</style> 