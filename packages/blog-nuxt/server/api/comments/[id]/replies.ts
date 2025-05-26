import request from '../../../../utils/request';

export default defineEventHandler(async (event) => {
  const id = Number(event.context.params?.id);
  const query = getQuery(event);
  const current = Number(query.current) || 1;
  const size = Number(query.size) || 5;
  
  if (!id) {
    return {
      flag: false,
      message: '评论ID不能为空'
    };
  }
  
  try {
    const response = await request({
      url: `/comments/${id}/reply`,
      method: 'get',
      params: {
        current,
        size
      }
    });
    return response.data;
  } catch (error) {
    console.error('获取评论回复失败:', error);
    return {
      flag: false,
      message: '获取评论回复失败',
      data: []
    };
  }
}); 