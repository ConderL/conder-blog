import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin((nuxtApp) => {
  // 确保在SSR和CSR环境下路由信息都可用
  nuxtApp.hook('app:created', () => {
    // 确保路由位置注入可用
    const route = useRoute();
    
    // 确保路由元数据在SSR和CSR中一致
    if (!route.meta) {
      route.meta = {};
    }
    
    // 打印当前路径和元数据，便于调试
    console.log(`当前路径: ${route.path}, 元数据:`, route.meta);
  })
}) 