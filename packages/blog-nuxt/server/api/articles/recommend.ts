import { getArticleRecommend } from '../../../api/article';

export default defineEventHandler(async () => {
  try {
    const response = await getArticleRecommend();
    return response.data;
  } catch (error) {
    console.error('获取推荐文章失败:', error);
    return {
      data: {
        flag: false,
        message: '获取推荐文章失败'
      }
    };
  }
}); 