import { unlikeArticle } from '../../../../api/article';

export default defineEventHandler(async (event) => {
  const id = Number(event.context.params?.id);
  if (!id) {
    return {
      data: {
        flag: false,
        message: '文章ID不能为空'
      }
    };
  }
  
  try {
    const response = await unlikeArticle(id);
    return response.data;
  } catch (error) {
    console.error('取消点赞文章失败:', error);
    return {
      data: {
        flag: false,
        message: '取消点赞文章失败'
      }
    };
  }
}); 