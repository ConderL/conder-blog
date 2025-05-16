import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getSafeStorage, useStorage } from '~/utils/storage';

export interface UserInfo {
  id: string;
  username: string;
  nickname: string;
  avatar: string;
  email: string;
  role: string;
  [key: string]: any;
}

export const userStore = defineStore('user', () => {
  const token = ref('');
  const userInfo = ref<UserInfo>({} as UserInfo);
  const isLogin = ref(false);

  function setToken(newToken: string) {
    token.value = newToken;
    isLogin.value = !!newToken;
  }

  function setUserInfo(info: UserInfo) {
    userInfo.value = info;
  }

  function logout() {
    token.value = '';
    userInfo.value = {} as UserInfo;
    isLogin.value = false;
  }

  function loadToken() {
    const storage = useStorage();
    const storedToken = storage.getItem('user-token');
    if (storedToken) {
      setToken(storedToken);
    }
  }

  return {
    token,
    userInfo,
    isLogin,
    setToken,
    setUserInfo,
    logout,
    loadToken
  };
}, {
  persist: {
    key: 'user-store',
    storage: getSafeStorage()
  }
}); 