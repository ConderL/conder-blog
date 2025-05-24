// 本地图标解析器插件
import { defineNuxtPlugin } from '#app';

export default defineNuxtPlugin((nuxtApp) => {
  // 获取环境变量
  const config = useRuntimeConfig();
  
  // 图标前缀
  const iconPrefix = process.env.VITE_ICON_PREFIX || 'icon';
  const iconLocalPrefix = process.env.VITE_ICON_LOCAL_PREFIX || 'icon-local';
  
  // 注册图标解析器
  nuxtApp.vueApp.config.globalProperties.$resolveIcon = (name: string) => {
    if (name.startsWith(iconLocalPrefix)) {
      // 本地图标，直接从assets目录加载
      const iconName = name.replace(`${iconLocalPrefix}:`, '');
      return {
        type: 'svg',
        src: `/icons/${iconName}.svg`
      };
    }
    
    return {
      type: 'svg',
      src: `/icons/${name}.svg`
    };
  };
}); 