// 导入 vue3-danmaku 组件
import VueDanmaku from 'vue3-danmaku';

// 定义 Nuxt 插件
export default defineNuxtPlugin((nuxtApp) => {
  // 注册 VueDanmaku 组件
  nuxtApp.vueApp.component('VueDanmaku', VueDanmaku);
  
  // 返回插件
  return {
    provide: {
      // 可以在这里提供额外的功能
    }
  };
}); 