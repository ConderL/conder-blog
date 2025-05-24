import { likeComment, unlikeComment } from '../../../../api/comment';

export default defineEventHandler(async (event) => {
  const id = Number(event.context.params?.id);
  const query = getQuery(event);
  const type = query.type;
  
  if (!id) {
    return {
      flag: false,
      message: '评论ID不能为空'
    };
  }
  
  try {
    // 根据 type 参数确定是点赞还是取消点赞
    const response = type === 'unlike' ? 
      await unlikeComment(id) : 
      await likeComment(id);
    
    return response.data;
  } catch (error) {
    console.error('评论操作失败:', error);
    return {
      flag: false,
      message: '评论操作失败'
    };
  }
}); 