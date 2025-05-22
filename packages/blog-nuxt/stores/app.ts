import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getSafeStorage } from '~/utils/storage';

export const useAppStore = defineStore('app', () => {
  const sideFlag = ref(false);
  const isCollapse = ref(false);
  const theme = ref('light');
  const menuFlag = ref(false);
  const searchFlag = ref(false);
  const loginFlag = ref(false);
  const registerFlag = ref(false);
  const forgetFlag = ref(false);
  const emailFlag = ref(false);
  const drawer = ref(false);

  function toggleSideFlag() {
    sideFlag.value = !sideFlag.value;
  }

  function setSideFlag(value: boolean) {
    sideFlag.value = value;
  }

  function toggleSidebar() {
    isCollapse.value = !isCollapse.value;
  }

  function toggleCollapse() {
    isCollapse.value = !isCollapse.value;
  }

  function switchTheme(newTheme: string) {
    theme.value = newTheme;
    if (import.meta.client) {
      document.documentElement.setAttribute('theme', newTheme);
    }
  }

  function setSearchFlag(value: boolean) {
    searchFlag.value = value;
  }

  function setLoginFlag(value: boolean) {
    loginFlag.value = value;
  }
  
  function setRegisterFlag(value: boolean) {
    registerFlag.value = value;
  }
  
  function setForgetFlag(value: boolean) {
    forgetFlag.value = value;
  }
  
  function setEmailFlag(value: boolean) {
    emailFlag.value = value;
  }
  
  function setDrawer(value: boolean) {
    drawer.value = value;
  }

  return {
    sideFlag,
    isCollapse,
    theme,
    menuFlag,
    searchFlag,
    loginFlag,
    registerFlag,
    forgetFlag,
    emailFlag,
    drawer,
    toggleSideFlag,
    setSideFlag,
    toggleSidebar,
    toggleCollapse,
    switchTheme,
    setSearchFlag,
    setLoginFlag,
    setRegisterFlag,
    setForgetFlag,
    setEmailFlag,
    setDrawer
  };
}, {
  persist: {
    key: 'app-store',
    storage: getSafeStorage()
  }
}); 