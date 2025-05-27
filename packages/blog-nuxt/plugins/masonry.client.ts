// 瀑布流布局插件 - 仅客户端使用
import { VueMasonryPlugin } from 'vue-masonry';
 
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(VueMasonryPlugin);
}); 