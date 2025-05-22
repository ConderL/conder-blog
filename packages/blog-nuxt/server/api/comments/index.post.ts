import { addComment } from '../../../api/comment';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { articleId, content } = body;
  
  if (!articleId) {
    return {
      data: {
        flag: false,
        message: '文章ID不能为空'
      }
    };
  }
  
  if (!content) {
    return {
      data: {
        flag: false,
        message: '评论内容不能为空'
      }
    };
  }
  
  try {
    const response = await addComment({
      typeId: articleId,
      commentType: 1,
      commentContent: content
    });
    return response.data;
  } catch (error) {
    console.error('提交评论失败:', error);
    return {
      data: {
        flag: false,
        message: '提交评论失败'
      }
    };
  }
}); 