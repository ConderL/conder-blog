import { addComment } from '../../../api/comment';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const response = await addComment({
      typeId: body.typeId,
      commentType: body.commentType,
      commentContent: body.commentContent,
      replyId: body.replyId,
      toUid: body.toUid,
      parentId: body.parentId
    });
    return response.data;
  } catch (error) {
    console.error('添加评论失败:', error);
    return {
      flag: false,
      message: '添加评论失败'
    };
  }
}); 