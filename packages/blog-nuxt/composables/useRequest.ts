/**
 * useRequest - 专门用于SSR页面的数据获取
 * 使用Nuxt的useFetch和useAsyncData，自动处理服务端和客户端的数据同步
 */
export const useRequest = () => {
  const config = useRuntimeConfig();
  const baseURL = config.public.serviceBaseUrl;

  // 获取用户store和应用store
  const userStore = useUserStore();
  const appStore = useAppStore();

  // 使用新的token组合式函数
  const { getToken, token_prefix } = useToken();

  const token = getToken();

  /**
   * 处理响应数据和错误
   * @param response 响应对象
   */

  const handleResponse = (response: any) => {
    if (process.client) {
      switch (response.code) {
        case -1:
          window.$message?.error(response.msg);
          break;
        case 400:
          window.$message?.error(response.msg);
          break;
        case 402:
          const user = useUserStore();
          user.forceLogOut();
          window.$message?.error(response.msg);
          break;
        case 500:
          window.$message?.error(response.msg);
          break;
      }
    }
  };

  /**
   * 客户端直接请求函数 - 适用于用户交互场景
   * @param url API路径
   * @param options 请求选项
   * @returns 响应数据
   */
  const directFetch = async (url: string, options: any = {}) => {

    // 准备请求选项
    const fetchOptions = {
      isNotify: options.isNotify || false,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    // 添加token
    const token = getToken();

    if (token) {
      fetchOptions.headers.Authorization = token_prefix + token;
    }

    try {
      // 发送请求
      const response = await $fetch(url, {
        ...fetchOptions,
        baseURL,
        onResponse: ({ response }) => {
          handleResponse(response._data);
          if (fetchOptions.isNotify) {
            window.$message?.success(response._data.msg);
          }
        },
        onResponseError: ({ response }) => {
          // 对于4xx和5xx错误，不自动抛出，而是返回错误响应
          console.log('请求错误:', response._data);
        }
      });

      // 返回完整响应，而不仅仅是data部分
      return response;
    } catch (error: any) {
      // 捕获错误并返回错误信息
      console.error('directFetch error:', error);
      
      // 如果是FetchError，返回其data
      if (error.data) {
        return error.data;
      }
      
      // 否则重新抛出
      throw error;
    }
  };

  /**
   * 通用数据获取函数 - 适用于SSR页面
   * @param url API路径
   * @param options 请求选项
   * @returns 响应数据
   */
  const fetchData = async (url: string, options: any = {}) => {
    // 默认选项
    const defaultOptions = {
      baseURL,
      key: `api-${url}:${options.key}`, // 使用带前缀的URL作为缓存键，避免与Nuxt内部缓存冲突
      server: true, // 在服务端渲染时获取数据
      lazy: false, // 不延迟加载
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    // 合并选项
    const fetchOptions = {
      ...defaultOptions,
      ...options,
    };

    if (token) {
      fetchOptions.headers.Authorization = token_prefix + token;
    }
    // 使用useFetch获取数据
    return await useFetch(url, {
      ...fetchOptions,
      baseURL,
      transform: (res) => {
        if (res.flag) {
          return res.data;
        }
      },
      onResponse: ({ response }) => {
        handleResponse(response._data);
      }
    });
  };

  return {
    fetchData,
    directFetch
  };
}; 