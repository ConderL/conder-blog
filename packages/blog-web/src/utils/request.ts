import { useUserStore } from "@/store";
import axios, {
	AxiosError,
	AxiosResponse,
	InternalAxiosRequestConfig,
} from "axios";
import { getServiceBaseURL } from "./service";
import { getToken, token_prefix } from "./token";

// const { url, proxyPattern } = getServiceEnvConfig(import.meta.env);

const isHttpProxy =
	import.meta.env.DEV && import.meta.env.VITE_HTTP_PROXY === "Y";
const { baseURL } = getServiceBaseURL(import.meta.env, isHttpProxy);

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
			// 确保headers对象存在
			if (!config.headers) {
				config.headers = {};
			}

			config.headers["Authorization"] = token_prefix + token;

			// 调试信息
			console.log(
				"添加认证头:",
				token_prefix + token.substring(0, 10) + "...",
			);
		} else {
			console.warn("发送请求时未找到token");
		}

		return config;
	},
	(error: AxiosError) => {
		console.error("请求拦截器错误:", error);
		return Promise.reject(error);
	},
);

const handleResponse = (response: AxiosResponse) => {
	switch (response.data.code) {
		case -1:
			window.$message?.error(response.data.msg);
			break;
		case 400:
			window.$message?.error(response.data.msg);
			break;
		case 402:
			const user = useUserStore();
			user.forceLogOut();
			window.$message?.error(response.data.msg);
			break;
		case 500:
			window.$message?.error(response.data.msg);
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
			const user = useUserStore();

			// 如果用户已登录但收到401，说明token可能已过期
			if (user.id) {
				window.$message?.error("登录已过期，请重新登录");
				user.forceLogOut();
			} else {
				window.$message?.error("请先登录");
			}
		}

		handleResponse(response as AxiosResponse);
		return Promise.reject(error);
	},
);

// 对外暴露
export default requests;
