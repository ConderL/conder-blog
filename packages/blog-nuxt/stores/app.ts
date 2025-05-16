import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getSafeStorage } from '~/utils/storage';

// 使用不同的函数名以避免重复声明
export const appStore = defineStore('app', () => {
  const sideFlag = ref(false);
  const isCollapse = ref(false);
  const theme = ref('light');
  const menuFlag = ref(false);
  const searchFlag = ref(false);
  const loginDialogVisible = ref(false);

  function toggleSideFlag() {
    sideFlag.value = !sideFlag.value;
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

  function setLoginFlag(value: boolean) {
    loginDialogVisible.value = value;
  }

  return {
    sideFlag,
    isCollapse,
    theme,
    menuFlag,
    searchFlag,
    loginDialogVisible,
    toggleSideFlag,
    toggleSidebar,
    toggleCollapse,
    switchTheme,
    setLoginFlag
  };
}, {
  persist: {
    key: 'app-store',
    storage: getSafeStorage()
  }
}); 