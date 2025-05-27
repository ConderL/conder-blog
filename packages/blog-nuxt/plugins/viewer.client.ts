// 图片查看器插件 - 仅客户端使用
import 'viewerjs/dist/viewer.css';
import VueViewer from 'v-viewer';

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(VueViewer);
}); 