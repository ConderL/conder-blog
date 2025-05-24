import { getCommentList } from '../../../api/comment';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const typeId = Number(query.typeId);
  const commentType = Number(query.commentType) || 1;
  const current = Number(query.current) || 1;
  const size = Number(query.size) || 10;
  
  if (!typeId) {
    return {
      flag: false,
      message: '类型ID不能为空'
    };
  }
  
  try {
    const response = await getCommentList({
      current,
      size,
      typeId,
      commentType
    });
    return response.data;
  } catch (error) {
    console.error('获取评论列表失败:', error);
    return {
      flag: false,
      message: '获取评论列表失败',
      data: {
        recordList: [],
        count: 0
      }
    };
  }
}); 