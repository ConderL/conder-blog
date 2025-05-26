import { getArticle } from '../../../api/article';

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
    const response = await getArticle(id);
    return response.data;
  } catch (error) {
    console.error('获取文章详情失败:', error);
    return {
      data: {
        flag: false,
        message: '获取文章详情失败'
      }
    };
  }
}); 