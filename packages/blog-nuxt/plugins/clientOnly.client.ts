import { useBlogStore } from '../composables/useStores';
import { getBlogInfo } from '../api/blogInfo';
import type { BlogInfo } from '../api/blogInfo/types';
import type { BlogInfo as StoreBlogInfo } from '../stores/blog';

export default defineNuxtPlugin({
  name: 'client-data-refresh',
  enforce: 'post',
  async setup() {
    // 确保仅在客户端执行
    if (process.client) {
      const blog = useBlogStore();
      
      // 在客户端刷新一次数据，以获取最新信息
      try {
        const { data } = await getBlogInfo();
        if (data && data.code === 200) {
          // 设置博客信息
          blog.setBlogInfo(data.data as unknown as StoreBlogInfo);
        }
      } catch (error) {
        console.error('客户端刷新博客信息失败', error);
      }
    }
  }
}); 