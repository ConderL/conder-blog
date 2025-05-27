// 导入 md-editor-v3 组件
import { MdPreview } from 'md-editor-v3';
import 'md-editor-v3/lib/preview.css';

// 定义 Nuxt 插件
export default defineNuxtPlugin((nuxtApp) => {
  // 注册 MdPreview 组件
  nuxtApp.vueApp.component('MdPreview', MdPreview);
  
  // 返回插件
  return {
    provide: {
      // 可以在这里提供额外的功能
    }
  };
}); 