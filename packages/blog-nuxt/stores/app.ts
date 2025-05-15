import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAppStore = defineStore('app', () => {
  // 搜索框显示状态
  const searchFlag = ref(false);
  
  // 登录框显示状态
  const loginFlag = ref(false);
  
  // 侧边栏状态
  const sidebarCollapsed = ref(false);
  
  // 移动端菜单状态
  const menuFlag = ref(false);
  
  // 设置搜索框状态
  function setSearchFlag(flag: boolean) {
    searchFlag.value = flag;
  }
  
  // 设置登录框状态
  function setLoginFlag(flag: boolean) {
    loginFlag.value = flag;
  }
  
  // 切换侧边栏状态
  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value;
  }
  
  // 设置菜单状态
  function setMenuFlag(flag: boolean) {
    menuFlag.value = flag;
  }
  
  return {
    searchFlag,
    loginFlag,
    sidebarCollapsed,
    menuFlag,
    setSearchFlag,
    setLoginFlag,
    toggleSidebar,
    setMenuFlag
  };
}, {
  persist: true
}); 