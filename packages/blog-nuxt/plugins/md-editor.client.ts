/**
 * MD Editor 插件
 * 用于优化 md-editor-v3 的加载
 */
import { MdCatalog, MdPreview } from 'md-editor-v3';
import 'md-editor-v3/lib/preview.css';

// 仅导入必要的组件和样式
export default defineNuxtPlugin(() => {
  // 这里不需要做任何事情，只需要确保 MD Editor 相关组件在客户端被正确加载
  // 组件已经在 import 语句中被导入
}); 