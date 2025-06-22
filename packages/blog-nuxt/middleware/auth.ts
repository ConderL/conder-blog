import { useUserStore } from '~/stores/user';

export default defineNuxtRouteMiddleware((to, from) => {
  const user = useUserStore();
  
  // 如果用户未登录，重定向到首页
  if (!user.isLogin) {
    return navigateTo('/');
  }
}); 