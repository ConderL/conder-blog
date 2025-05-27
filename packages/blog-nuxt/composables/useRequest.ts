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
  const handleResponse = (res: any) => {
    if (!res.msg) return;

    // 客户端处理
    if (process.client) {
      const {flag, msg} = res;
      if(flag) {
        window.$message.success(msg);
      } else {
        window.$message.error(msg);
      }
    }
  };

  const customFetch = $fetch.create({
    onRequest: ({ options }) => {
      if (token) {
        options.headers.Authorization = token_prefix + token;
      }
    },
    onResponse: ({ response }) => {
      console.log('response', response);
      if(!response.ok) {
        handleResponse(response._data);
      }
    }
  })

  /**
   * 客户端直接请求函数 - 适用于用户交互场景
   * @param url API路径
   * @param options 请求选项
   * @returns 响应数据
   */
  const directFetch = async (url: string, options: any = {}) => {
      // 准备请求选项
      const fetchOptions = {
        isNotify: false,
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      };
      
      // 添加token
      const token = getToken();

      console.log('发送请求时的token', token);

      if (token) {
        fetchOptions.headers.Authorization = token_prefix + token;
      }
      
      // 发送请求
      const response = await $fetch(url, {
        ...fetchOptions,
        baseURL
      });

      console.log('API响应:', response);

      if(fetchOptions.isNotify || !response.flag) {
        handleResponse(response);
      }
      
      // 返回完整响应，而不仅仅是data部分
      return response;
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
        if(!response.flag) {
          handleResponse(response);
        }
      }
    });
  };

  return {
    fetchData,
    directFetch
  };
}; 