import { useUserStore } from "../composables/useStores";
import axios from "axios";
import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { getToken, token_prefix } from "./token";

// 使用环境变量获取基础URL
const baseURL = process.env.VITE_SERVICE_BASE_URL || 'http://localhost:3000';

const requests = axios.create({
  baseURL,
  timeout: 10000,
  // 请求头
  headers: {
    "Content-Type": "application/json;charset=UTF-8",
  },
});

// 请求拦截器
requests.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 获取token
    const token = getToken();

    // 如果有token则添加到请求头
    if (token) {
      config.headers.Authorization = token_prefix + token;
    }

    return config;
  },
  (error: AxiosError) => {
    console.error("请求拦截器错误:", error);
    return Promise.reject(error);
  },
);

const handleResponse = (response: AxiosResponse) => {
  if (!response?.data) return;
  
  switch (response.data.code) {
    case -1:
      console.error(response.data.msg);
      break;
    case 400:
      console.error(response.data.msg);
      break;
    case 402:
      console.error(response.data.msg);
      // Nuxt环境下，处理登出逻辑可能需要调整
      break;
    case 500:
      console.error(response.data.msg);
      break;
  }
};

// 配置响应拦截器
requests.interceptors.response.use(
  (response: AxiosResponse) => {
    handleResponse(response);
    return response;
  },
  (error: AxiosError) => {
    let { response } = error;

    // 处理401错误（未授权）
    if (response && response.status === 401) {
      console.error("未授权，请登录");
      // Nuxt环境下，处理登出逻辑可能需要调整
    }

    handleResponse(response as AxiosResponse);
    return Promise.reject(error);
  },
);

// 对外暴露
export default requests; 