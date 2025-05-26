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
  
  // 获取token
  const getToken = () => {
    // 如果在客户端，从localStorage获取token
    if (process.client) {
      return localStorage.getItem('token');
    }
    return null;
  };
  
  // token前缀
  const token_prefix = 'Bearer ';

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

  /**
   * 处理401错误（未授权）
   */
  const handle401Error = () => {
    if (process.client) {
      try {
        // 如果用户已登录但收到401，说明token可能已过期
        if (userStore.isLogin) {
          if (window.$message) {
            window.$message.error("登录已过期，请重新登录");
          }
          userStore.logout();
        } else if (window.$message) {
          window.$message.error("请先登录");
        }
        
        // 显示登录对话框
        appStore.setLoginFlag(true);
      } catch (error) {
        console.error('处理401错误失败', error);
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
        isNotify: false,
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      };
      
      // 添加token
      const token = getToken();
      if (token) {
        fetchOptions.headers.Authorization = token_prefix + token;
      }
      
      // 发送请求
      const response = await $fetch(url, {
        ...fetchOptions,
        baseURL
      });

      if(fetchOptions.isNotify && response.code !== undefined) {
        handleResponse(response);
      }
      
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
    };

    // 合并选项
    const fetchOptions = {
      ...defaultOptions,
      ...options,
    };

    try {
      // 使用useFetch获取数据
      const { data, error } = await useFetch(url, {
        ...fetchOptions,
        baseURL,
        transform: (res) => {
          if (res.flag) {
            return res.data;
          }
          throw new Error(res.msg);
          handleResponse(res)
        },
      });

      if (error.value) {
        console.error(`获取数据失败: ${url}`, error.value);
        // 处理401错误
        if (error.value.statusCode === 401) {
          handle401Error();
        }
        throw error.value;
      }

      return unref(data);
    } catch (err) {
      console.error(`请求错误: ${url}`, err);
      throw err;
    }
  };

  return {
    fetchData,
    directFetch
  };
}; 