import { likeArticle } from '../../../../api/article';

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
    const response = await likeArticle(id);
    return response.data;
  } catch (error) {
    console.error('点赞文章失败:', error);
    return {
      data: {
        flag: false,
        message: '点赞文章失败'
      }
    };
  }
}); 