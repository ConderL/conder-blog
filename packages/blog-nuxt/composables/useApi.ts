// 在Nuxt 3中，useRuntimeConfig和useFetch都是Nuxt自动导入的组合式函数
// 不需要显式导入

// @ts-ignore - 添加这个注释以忽略TypeScript错误，Nuxt会自动导入这些函数
export const useApi = () => {
  // @ts-ignore - Nuxt自动导入
  const config = useRuntimeConfig();
  
  // 创建一个基础请求函数
  const baseRequest = async (url: string, options: any = {}) => {
    const baseURL = config.public.apiBase;
    
    // 设置请求头
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };
    
    try {
      // 使用Nuxt内置的useFetch
      // @ts-ignore - Nuxt会自动导入useFetch函数
      const response = await useFetch(url, {
        baseURL,
        headers,
        ...options
      });
      
      return response.data.value;
    } catch (error: any) {
      console.error('API请求错误:', error);
      throw error;
    }
  };
  
  // 文章相关API
  const article = {
    // 获取文章列表
    getList: (params: any) => baseRequest('/articles', { method: 'GET', params }),
    // 获取文章详情
    getDetail: (id: string) => baseRequest(`/articles/${id}`, { method: 'GET' }),
    // 获取相关文章
    getRelated: (id: string) => baseRequest(`/articles/${id}/related`, { method: 'GET' }),
  };
  
  // 用户相关API
  const user = {
    // 获取用户信息
    getInfo: () => baseRequest('/users/info', { method: 'GET' }),
    // 用户登录
    login: (data: any) => baseRequest('/users/login', { method: 'POST', body: data }),
    // 用户注册
    register: (data: any) => baseRequest('/users/register', { method: 'POST', body: data }),
  };
  
  // 评论相关API
  const comment = {
    // 获取文章评论
    getList: (articleId: string) => baseRequest(`/articles/${articleId}/comments`, { method: 'GET' }),
    // 发表评论
    create: (articleId: string, data: any) => baseRequest(`/articles/${articleId}/comments`, { method: 'POST', body: data }),
  };
  
  return {
    article,
    user,
    comment
  };
}; 