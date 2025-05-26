// 导入useRequest
import { useRequest } from './useRequest';

export const useApi = () => {
  const { fetchData, directFetch } = useRequest();
   
  // 博客信息API
  const blogInfo = {
    // 获取博客信息 - 用于SSR
    getBlogInfo: async () => fetchData('/'),
    
    // 上传访客信息 - 用于客户端
    report: () => directFetch('/report', { method: 'POST' }),
  };

  // 文章相关API
  const article = {
    // 获取文章列表 - 用于SSR
    getList: (params: any) => fetchData('/articles/list', { params }),
    
    // 获取文章详情 - 用于SSR
    getArticle: (id: number) => fetchData(`/articles/${id}`),
    
    // 获取推荐文章 - 用于SSR
    getArticleRecommend: () => fetchData('/articles/recommend'),
    
    // 点赞文章 - 用于客户端交互
    like: (id: string) => directFetch(`/articles/like/${id}`, { method: 'POST' }),
    
    // 取消点赞文章 - 用于客户端交互
    unlike: (id: string) => directFetch(`/articles/unlike/${id}`, { method: 'POST' }),
  };

  // 归档相关API
  const archives = {
    // 获取归档列表 - 用于SSR
    getList: (params: any) => fetchData('/archives/list', { params }),
  };

  const carousel = {
    // 获取轮播图列表 - 用于SSR
    getList: () => fetchData('/carousel/list'),
  };

  const talk = {
    // 获取说说列表 - 用于SSR
    getTalkList: () => fetchData('/talk/list'),

    // 获取说说详情 - 用于SSR
    getTalk: (id: number) => fetchData(`/talk/${id}`),

    // 点赞说说 - 用于客户端交互
    likeTalk: (id: number) => directFetch(`/talk/${id}/like`, { method: 'POST' }),

    // 获取首页说说 - 用于SSR
    getTalkHomeList: () => fetchData('/talk/home'),
  };

  const login = {
    // 发送邮箱验证码 - 用于客户端交互
    sendEmailCode: (email: string) => directFetch('/login/sendEmailCode', { method: 'POST', body: { email } }),

    // 注册 - 用于客户端交互
    register: (data: any) => directFetch('/login/register', { method: 'POST', body: data }),

    // 登录 - 用于客户端交互
    login: (data: any) => directFetch('/login/login', { method: 'POST', body: data }),

    // 获取用户信息 - 用于SSR
    getUserInfo: () => fetchData('/login/getUserInfo'),
  };

  const comment = {
    // 获取评论列表 - 用于SSR
    getList: (params: any) => fetchData('/comments/list', { params }),

    // 添加评论 - 用于客户端交互
    add: (data: any) => directFetch('/comments/add', { method: 'POST', body: data }),

    // 删除评论 - 用于客户端交互
    delete: (id: number) => directFetch(`/comments/delete/${id}`, { method: 'POST' }),

    // 点赞评论 - 用于客户端交互
    like: (id: number) => directFetch(`/comments/${id}/like`, { method: 'POST' }),

    // 取消点赞评论 - 用于客户端交互
    unlike: (id: number) => directFetch(`/comments/${id}/unlike`, { method: 'POST' }),

    // 获取回复评论 - 用于SSR
    getReplyList: (commentId: number, params: any) => fetchData(`/comments/${commentId}/reply`, { params }),
  };

  return {
    blogInfo,
    article,
    archives,
    carousel,
    talk,
    login,
    comment,
  };
}; 