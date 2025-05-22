import { getCommentList } from '../../../api/comment';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const articleId = Number(query.articleId);
  const commentType = Number(query.commentType) || 1;
  
  if (!articleId) {
    return {
      data: {
        flag: false,
        message: '文章ID不能为空'
      }
    };
  }
  
  try {
    const response = await getCommentList({
      current: 1,
      size: 10,
      typeId: articleId,
      commentType
    });
    return response.data;
  } catch (error) {
    console.error('获取评论列表失败:', error);
    return {
      data: {
        flag: false,
        message: '获取评论列表失败'
      }
    };
  }
}); 