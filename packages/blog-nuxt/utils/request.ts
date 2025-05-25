import axios from "axios";
import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { getToken, token_prefix } from "./token";

// 创建axios实例
const requests = axios.create({
  // 将在拦截器中设置baseURL
  timeout: 10000,
  // 请求头
  headers: {
    "Content-Type": "application/json;charset=UTF-8",
  },
});

let apiBase = 'http://localhost:3000';

// 请求拦截器
requests.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 设置baseURL
    if (!config.baseURL) {
      config.baseURL = apiBase;
    }
    
    // 获取token
    const token = getToken();

    // 如果有token则添加到请求头
    if (token) {
      // 确保headers对象存在
      if (!config.headers) {
        config.headers = {};
      }

      config.headers.Authorization = token_prefix + token;
    }

    return config;
  },
  (error: AxiosError) => {
    console.error("请求拦截器错误:", error);
    return Promise.reject(error);
  },
);

// 处理响应数据
const handleResponse = (response: AxiosResponse) => {
  if (!response?.data) return;
  
  // 客户端处理
  if (process.client) {
    try {
      // 尝试获取toast通知
      if (window.$message) {
  switch (response.data.code) {
    case -1:
            window.$message.error(response.data.msg);
      break;
    case 400:
            window.$message.error(response.data.msg);
      break;
    case 402:
            // 登出逻辑
            const userStore = useUserStore();
            userStore.logout();
            window.$message.error(response.data.msg);
      break;
    case 500:
            window.$message.error(response.data.msg);
      break;
        }
      }
    } catch (error) {
      console.error('处理响应失败', error);
    }
  }
};

// 配置响应拦截器
requests.interceptors.response.use(
  (response: AxiosResponse) => {
    handleResponse(response);
    return response;
  },
  (error: AxiosError) => {
    const { response } = error;

    // 处理401错误（未授权）
    if (response && response.status === 401 && process.client) {
      try {
        const userStore = useUserStore();
        const appStore = useAppStore();
        
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

    handleResponse(response as AxiosResponse);
    return Promise.reject(error);
  },
);

// 插件初始化函数 - 在Nuxt插件中调用
export function setupAxios(baseUrl: string) {
  apiBase = baseUrl;
}

// 对外暴露
export default requests; 