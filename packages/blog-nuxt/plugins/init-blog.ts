// 博客信息初始化插件
import { useBlogStore } from '~/stores/blog';

export default defineNuxtPlugin(async () => {
  // 获取博客信息 store
  const blog = useBlogStore();
  
  // 获取博客信息
  console.log('插件中获取博客信息');
  await blog.fetchBlogInfo();
  
  // 返回一个空对象
  return {};
}); 