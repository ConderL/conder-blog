// import { useUserStore } from "@/store";
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { ElMessage, ElNotification, ElMessageBox } from "element-plus";
import { messageConfirm } from "./modal";
import { getToken, token_prefix } from "./token";
import { useUserStore } from "@/store";

// 是否显示重新登录
export let isRelogin = { show: false };

// 获取环境变量中的API地址
const getBaseURL = () => {
  // 判断是否为生产环境
  if (import.meta.env.PROD) {
    // 使用环境变量中定义的API地址
    return import.meta.env.VITE_SERVICE_BASE_URL || "/api";
  }
  // 开发环境使用代理
  return "/api";
};

const requests = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
  // 请求头
  headers: {
    "Content-Type": "application/json;charset=UTF-8",
  },
});

// 请求拦截器
requests.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 请求带token
    if (getToken()) {
      // 详细打印token信息以便调试
      const token = getToken();
      console.log("Token类型:", typeof token);
      console.log("Token值:", token);
      console.log("Token长度:", token?.length);
      console.log("Token是否为对象:", token === "[object Object]");

      // 如果token是"[object Object]"字符串或者是对象，则跳过添加认证头
      if (token === "[object Object]" || typeof token === "object") {
        console.error("检测到无效token格式，跳过添加认证头");
        return config;
      }

      // 确保token是字符串并且添加空格
      config.headers["Authorization"] = `${token_prefix}${token}`;
      console.log("请求添加认证头:", config.url, `${token_prefix}${token}`);
    } else {
      console.log("请求无认证头:", config.url);
    }
    return config;
  },
  (error: AxiosError) => {
    console.error("请求拦截器错误:", error);
    return Promise.reject(error);
  }
);

// 配置响应拦截器
requests.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log("响应数据:", response.config.url, response.data);

    // 处理认证失败的情况
    if (
      response.data.code === 400 &&
      (response.data.msg.includes("认证失败") ||
        response.data.msg.includes("登录") ||
        response.data.data === 403 ||
        response.data.data === 401)
    ) {
      console.error("认证失败，需要重新登录", response.data);

      // 使用静态导入的store
      const userStore = useUserStore();

      if (!isRelogin.show) {
        isRelogin.show = true;
        ElNotification({
          title: "认证失败",
          message: "登录状态已过期，请重新登录",
          type: "error",
        });
        setTimeout(() => {
          userStore.LogOut().then(() => {
            location.href = "/login";
            isRelogin.show = false;
          });
        }, 3000);
      }
      return Promise.reject(new Error(response.data.msg));
    }

    switch (response.data.code) {
      case 400:
        ElNotification({
          title: "失败",
          message: response.data.msg,
          type: "error",
        });
        break;
      case 402:
        // 使用静态导入的store
        const userStore = useUserStore();

        if (!isRelogin.show) {
          isRelogin.show = true;
          messageConfirm("登录状态已过期，您可以继续留在该页面，或者重新登录")
            .then(() => {
              isRelogin.show = false;
              userStore.LogOut().then(() => {
                location.href = "/login";
              });
            })
            .catch(() => {
              isRelogin.show = false;
            });
        }
        break;
      case 500:
        ElNotification({
          title: "失败",
          message: response.data.msg,
          type: "error",
        });
        break;
    }
    return response;
  },
  (error: AxiosError) => {
    console.error("响应拦截器错误:", error);
    let { message } = error;
    if (message == "Network Error") {
      message = "后端接口连接异常";
    } else if (message.includes("timeout")) {
      message = "系统接口请求超时";
    } else if (message.includes("Request failed with status code")) {
      message = "系统接口" + message.substring(message.length - 3) + "异常";
    }
    ElMessage({
      message: message,
      type: "error",
      duration: 5 * 1000,
    });
    return Promise.reject(error);
  }
);

// 对外暴露
export default requests;
