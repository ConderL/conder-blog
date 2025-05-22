import { defineNuxtPlugin } from '#app';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

/**
 * 持久化存储插件
 * 在服务端渲染时不执行持久化
 */
export default defineNuxtPlugin(({ $pinia }) => {
  // 服务器端不初始化持久化插件
  if (import.meta.client) {
    $pinia.use(piniaPluginPersistedstate);
  }
}); 