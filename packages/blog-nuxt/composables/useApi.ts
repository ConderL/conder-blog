// 在Nuxt 3中，useRuntimeConfig和useFetch都是Nuxt自动导入的组合式函数
// 不需要显式导入

// @ts-ignore - 添加这个注释以忽略TypeScript错误，Nuxt会自动导入这些函数
export const useApi = () => {
  const config = useRuntimeConfig();
  
  // 创建一个基础请求函数
  const baseRequest = async (url: string, options: any = {}) => {
    const baseURL = config.public.apiBase;
    
    // 设置请求头
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };
    
    // 添加token到请求头（如果存在）
    if (process.client) {
      const token = localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    
    try {
      // 使用Nuxt内置的useFetch
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
    getList: (params: any) => {
      console.log('获取文章列表', params);
      // 这里应该调用实际的API，先用模拟数据
      return Promise.resolve({
        recordList: [
          {
            id: '1',
            articleTitle: '使用Nuxt实现服务端渲染博客系统',
            articleDesc: 'Nuxt.js是一个基于Vue.js的服务端渲染框架，它可以帮助开发者轻松创建服务端渲染的Vue.js应用。',
            articleCover: 'https://picsum.photos/id/1/800/600',
            createTime: '2023-10-20T10:30:00',
            isTop: 1,
            category: {
              id: '1',
              categoryName: '前端开发'
            },
            tagVOList: [
              {
                id: '1',
                tagName: 'Vue'
              },
              {
                id: '2',
                tagName: 'Nuxt'
              }
            ]
          }
        ],
        count: 10
      });
    },
    // 获取文章详情
    getDetail: (id: string) => {
      console.log('获取文章详情', id);
      return Promise.resolve({
        id,
        articleTitle: 'Nuxt 3 服务端渲染与SEO优化实践',
        articleContent: '<h2 id="introduction">引言</h2><p>本文介绍Nuxt 3服务端渲染与SEO优化实践...</p>',
        articleCover: 'https://picsum.photos/id/1/1200/600',
        createTime: '2023-10-01T10:00:00Z',
        viewCount: 256,
        categoryName: '前端开发',
        author: '博主',
        tagList: [
          { id: '1', tagName: 'Nuxt' },
          { id: '2', tagName: 'SEO' },
          { id: '3', tagName: 'Vue' }
        ]
      });
    },
    // 获取相关文章
    getRelated: (id: string) => {
      return Promise.resolve({
        prev: {
          id: (parseInt(id) - 1).toString(),
          articleTitle: '上一篇文章标题'
        },
        next: {
          id: (parseInt(id) + 1).toString(),
          articleTitle: '下一篇文章标题'
        }
      });
    },
    // 获取推荐文章
    getRecommended: () => {
      return Promise.resolve([
        {
          id: '2',
          articleTitle: 'Vue 3组合式API最佳实践'
        },
        {
          id: '3',
          articleTitle: 'SEO优化指南：提高网站可见性'
        },
        {
          id: '4',
          articleTitle: '如何构建高性能Web应用'
        }
      ]);
    },
    // 获取文章归档
    getArchives: () => baseRequest('/api/articles/archives', { method: 'GET' }),
    // 点赞文章
    like: (id: string) => baseRequest(`/api/articles/${id}/like`, { method: 'POST' }),
  };
  
  // 用户相关API
  const user = {
    // 获取用户信息
    getInfo: () => baseRequest('/api/users/info', { method: 'GET' }),
    // 用户登录
    login: (data: any) => baseRequest('/api/users/login', { method: 'POST', body: data }),
    // 用户注册
    register: (data: any) => baseRequest('/api/users/register', { method: 'POST', body: data }),
    // 用户登出
    logout: () => baseRequest('/api/users/logout', { method: 'POST' }),
  };
  
  // 评论相关API
  const comment = {
    // 获取文章评论
    getList: (articleId: string) => {
      console.log('获取评论列表', articleId);
      return Promise.resolve([
        {
          id: '1',
          username: '用户1',
          content: '这是一条评论',
          createTime: '2023-10-05T08:30:00Z',
          avatar: 'https://picsum.photos/50/50?random=1'
        },
        {
          id: '2',
          username: '用户2',
          content: '非常喜欢这篇文章',
          createTime: '2023-10-06T10:15:00Z',
          avatar: 'https://picsum.photos/50/50?random=2'
        }
      ]);
    },
    // 发表评论
    create: (articleId: string, data: any) => {
      console.log('提交评论', articleId, data);
      return Promise.resolve({
        success: true
      });
    },
    // 回复评论
    reply: (commentId: string, data: any) => baseRequest(`/api/comments/${commentId}/reply`, { method: 'POST', body: data }),
  };
  
  // 博客信息API
  const blogInfo = {
    // 获取博客配置信息
    getConfig: () => baseRequest('/api/blog/config', { method: 'GET' }),
    // 获取网站统计数据
    getStats: () => baseRequest('/api/blog/stats', { method: 'GET' }),
    // 获取公告
    getAnnouncement: () => baseRequest('/api/blog/announcement', { method: 'GET' }),
  };
  
  // 分类API
  const category = {
    // 获取所有分类
    getAll: () => baseRequest('/api/categories', { method: 'GET' }),
    // 获取分类详情
    getDetail: (id: string) => baseRequest(`/api/categories/${id}`, { method: 'GET' }),
    // 获取分类下的文章
    getArticles: (id: string, params: any) => baseRequest(`/api/categories/${id}/articles`, { method: 'GET', params }),
  };
  
  // 标签API
  const tag = {
    // 获取所有标签
    getAll: () => baseRequest('/api/tags', { method: 'GET' }),
    // 获取标签详情
    getDetail: (id: string) => baseRequest(`/api/tags/${id}`, { method: 'GET' }),
    // 获取标签下的文章
    getArticles: (id: string, params: any) => baseRequest(`/api/tags/${id}/articles`, { method: 'GET', params }),
  };

  // 轮播图API
  const carousel = {
    // 获取轮播图列表
    getList: () => baseRequest('/api/carousels', { method: 'GET' }),
  };

  // 说说API
  const talk = {
    // 获取说说列表
    getList: (params: any) => baseRequest('/api/talks', { method: 'GET', params }),
    // 获取说说详情
    getDetail: (id: string) => baseRequest(`/api/talks/${id}`, { method: 'GET' }),
    // 点赞说说
    like: (id: string) => baseRequest(`/api/talks/${id}/like`, { method: 'POST' }),
  };

  // 相册API
  const album = {
    // 获取相册列表
    getList: () => baseRequest('/api/albums', { method: 'GET' }),
    // 获取相册详情
    getDetail: (id: string) => baseRequest(`/api/albums/${id}`, { method: 'GET' }),
    // 获取相册下的照片
    getPhotos: (id: string) => baseRequest(`/api/albums/${id}/photos`, { method: 'GET' }),
  };

  // 友链API
  const friend = {
    // 获取友链列表
    getList: () => baseRequest('/api/friends', { method: 'GET' }),
    // 申请友链
    apply: (data: any) => baseRequest('/api/friends/apply', { method: 'POST', body: data }),
  };

  // 留言API
  const message = {
    // 获取留言列表
    getList: () => baseRequest('/api/messages', { method: 'GET' }),
    // 发表留言
    create: (data: any) => baseRequest('/api/messages', { method: 'POST', body: data }),
  };
  
  return {
    article,
    user,
    comment,
    blogInfo,
    category,
    tag,
    carousel,
    talk,
    album,
    friend,
    message
  };
}; 