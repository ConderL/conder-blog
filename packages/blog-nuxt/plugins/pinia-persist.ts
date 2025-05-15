// @ts-nocheck
import { defineNuxtPlugin } from '#app';
import { createPersistedState } from 'pinia-plugin-persistedstate';

/**
 * 持久化存储插件
 * 在服务端渲染时不使用localStorage
 */
export default defineNuxtPlugin(nuxtApp => {
  // 创建自定义存储对象，在服务端返回空操作
  const customStorage = {
    getItem: (key) => {
      // 在服务端返回null
      if (process.server) return null;
      return localStorage.getItem(key);
    },
    setItem: (key, value) => {
      // 在服务端不执行任何操作
      if (process.server) return;
      localStorage.setItem(key, value);
    },
    removeItem: (key) => {
      // 在服务端不执行任何操作
      if (process.server) return;
      localStorage.removeItem(key);
    }
  };

  // 配置Pinia持久化插件
  nuxtApp.$pinia.use(
    createPersistedState({
      storage: customStorage,
      // 只在客户端初始化持久化
      debug: process.dev && process.client
    })
  );
}); 