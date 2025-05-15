import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import Cookies from 'js-cookie';

// 用户信息类型定义
interface UserInfo {
  id: number;
  username: string;
  nickname: string;
  avatar: string;
  email: string;
  intro: string;
  website: string;
  roleList: string[];
}

// 定义用户状态存储
export const useUserStore = defineStore('user', () => {
  // 用户信息状态
  const userInfo = ref<UserInfo | null>(null);
  
  // Token状态
  const token = ref<string | null>(null);
  
  // 登录状态
  const isLogin = computed(() => !!token.value);
  
  // 设置用户信息
  function setUserInfo(info: UserInfo | null) {
    userInfo.value = info;
  }
  
  // 设置Token
  function setToken(newToken: string | null) {
    token.value = newToken;
    
    // 只在客户端环境下操作Cookie
    if (process.client) {
      if (newToken) {
        Cookies.set('blog-token', newToken, { expires: 7 });
      } else {
        Cookies.remove('blog-token');
      }
    }
  }
  
  // 初始化Token（从Cookie读取）
  function initToken() {
    // 判断是否在客户端环境
    if (process.client) {
      const cookieToken = Cookies.get('blog-token');
      if (cookieToken) {
        token.value = cookieToken;
      }
    }
  }
  
  // 退出登录
  function logout() {
    userInfo.value = null;
    setToken(null);
  }
  
  return {
    userInfo,
    token,
    isLogin,
    setUserInfo,
    setToken,
    initToken,
    logout
  };
}, {
  persist: {
    key: 'user-storage',
    paths: ['userInfo']
  }
}); 