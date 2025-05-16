// 仅在客户端导入SVG图标
import loadSvgIcons from '../assets/icons/index';

export default defineNuxtPlugin(() => {
  // 在客户端加载SVG图标
  if (typeof window !== 'undefined') {
    loadSvgIcons();
  }
}); 