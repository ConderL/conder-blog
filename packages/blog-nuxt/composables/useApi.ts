// 导入useRequest
import { useRequest } from './useRequest';

export const useApi = () => {
  const { fetchData, directFetch } = useRequest();
   
  // 博客信息API
  const blogInfo = {
    // 获取博客信息 - 用于SSR
    getBlogInfo: async () => directFetch('/'),
    
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
    like: (id: string) => directFetch(`/articles/${id}/like`, { method: 'POST' }),
    
    // 取消点赞文章 - 用于客户端交互
    unlike: (id: string) => directFetch(`/articles/${id}/like`, { method: 'POST', params: { type: 'unlike' } }),
    
    // 搜索文章 - 用于客户端交互
    searchArticle: (keyword: string) => directFetch('/articles/search', { params: { keyword } }),
  };

  // 归档相关API
  const archives = {
    // 获取归档列表 - 用于SSR
    getList: (params: any) => fetchData('/archives/list', { params }),
  };

  const carousel = {
    // 获取轮播图列表 - 用于SSR
    getList: () => directFetch('/carousel/list'),
  };

  const talk = {
    // 获取说说列表 - 用于SSR
    getTalkList: (params: any) => fetchData('/talk/list', { params }),

    // 获取说说详情 - 用于SSR
    getTalk: (id: number) => fetchData(`/talk/${id}`),

    // 点赞说说 - 用于客户端交互
    likeTalk: (id: number) => directFetch(`/talk/${id}/like`, { method: 'POST' }),

    // 获取首页说说 - 用于SSR
    getTalkHomeList: () => fetchData('/talk/home'),
  };

  const login = {

    // 获取验证码 - 用于客户端交互
    getCaptcha: () => directFetch('/captcha', { params: { type: 'ConderView' } }),

    // 验证验证码 - 用于客户端交互
    validateCaptcha: (captchaUUID: string, code: string) => directFetch('/captcha/validate', { method: 'POST', body: { captchaUUID, code, type: 'ConderView' } }),

    // 发送邮箱验证码 - 用于客户端交互
    sendEmailCode: (email: string) => directFetch('/auth/email/code', { method: 'POST', body: { email, type: 'ConderView' } }),

    // 注册 - 用于客户端交互
    register: (data: any) => directFetch('/auth/register', { method: 'POST', body: { ...data, type: 'ConderView' } }),

    // 登录 - 用于客户端交互
    login: (data: any) => directFetch('/auth/login', { method: 'POST', body: { ...data, type: 'ConderView' } }),

    // 获取用户信息 - 修改为使用directFetch
    getUserInfo: () => directFetch('/user/getUserInfo'),

    // 退出登录 - 用于客户端交互
    logout: () => directFetch('/auth/logout', { method: 'POST' }),

    // 第三方登录 - 用于客户端交互
    thirdLogin: (data: any) => directFetch('/oauth/login', { method: 'POST', body: { ...data, type: 'ConderView' } }),

    // 获取第三方登录信息 - 用于SSR
    getThirdLoginInfo: () => fetchData('/oauth/info'),

    // 获取第三方登录授权 - 用于客户端交互
    getThirdLoginAuth: (data: any) => directFetch('/oauth/auth', { method: 'POST', body: { ...data, type: 'ConderView' } }),
  };

  const comment = {
    // 获取评论列表 - 用于SSR
    getList: (params: any) => fetchData('/comments/list', { params, key: JSON.stringify(params) }),

    // 添加评论 - 用于客户端交互
    add: (data: any) => directFetch('/comments/add', { method: 'POST', body: data }),

    // 删除评论 - 用于客户端交互
    delete: (id: number) => directFetch(`/comments/delete/${id}`, { method: 'POST' }),

    // 点赞评论 - 用于客户端交互
    like: (id: number) => directFetch(`/comments/${id}/like`, { method: 'POST' }),

    // 取消点赞评论 - 用于客户端交互
    unlike: (id: number) => directFetch(`/comments/${id}/like`, { method: 'POST', body: { type: 'unlike' } }),

    // 获取回复评论 - 用于SSR
    getReplyList: (commentId: number, params: any) => fetchData(`/comments/${commentId}/reply`, { params }),
  };

  // 添加分类相关API
  const category = {
    // 获取分类列表 - 用于SSR
    getCategoryList: () => fetchData('/categories'),
    
    // 获取分类文章列表 - 用于SSR
    getCategoryArticleList: (params: any) => fetchData('/category/article', { params }),
  };

  // 添加标签相关API
  const tag = {
    // 获取标签列表 - 用于SSR
    getTagList: () => fetchData('/tag/list'),
    
    // 获取标签文章列表 - 用于SSR
    getTagArticleList: (params: any) => fetchData('/tag/article', { params }),
  };

  // 添加相册相关API
  const album = {
    // 获取相册列表
    getAlbumList: () => directFetch('/album/list'),
    
    // 获取照片列表
    getPhotoList: (albumId: number) => directFetch('/photo/list', { params: { albumId } }),
  };

  // 添加友链相关API
  const friend = {
    // 获取友链列表 - 用于SSR
    getFriendList: () => fetchData('/friend/list'),
  };

  // 添加留言板相关API
  const message = {
    // 获取留言列表 - 用于SSR
    getMessageList: () => directFetch('/message/list'),
    
    // 添加留言 - 用于客户端交互
    addMessage: (data: any) => directFetch('/message/add', { method: 'POST', body: data }),
  };

  // 番剧API
  const anime = {
    // 获取番剧列表
    getList: (params) => fetchData(`/anime/list`, { params }),
    // 获取番剧详情
    getDetail: (id) => fetchData(`/anime/${id}`)
  };

  return {
    blogInfo,
    article,
    archives,
    carousel,
    talk,
    login,
    comment,
    category,
    tag,
    album,
    friend,
    message,
    anime
  };
}; 