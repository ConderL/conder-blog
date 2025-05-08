/**
 * 认证调试工具
 * 用于验证前端认证状态并测试API调用
 */
import { getToken, token_prefix } from "./token";
import axios from "axios";
import { getServiceBaseURL } from "./service";

// 获取baseURL（与request.ts相同方式）
const isHttpProxy =
	import.meta.env.DEV && import.meta.env.VITE_HTTP_PROXY === "Y";
const { baseURL } = getServiceBaseURL(import.meta.env, isHttpProxy);

/**
 * 检查并显示认证状态
 */
export function checkAuthStatus() {
	const token = getToken();
	console.log("=== 认证状态检查 ===");
	console.log("Token存在:", !!token);
	if (token) {
		console.log("Token值 (前10字符):", token.substring(0, 10) + "...");
	}

	// 打印所有Cookie
	console.log("所有Cookies:", document.cookie);

	return {
		hasToken: !!token,
		tokenValue: token,
	};
}

/**
 * 测试点赞评论API
 * @param commentId 评论ID
 * @param isUnlike 是否是取消点赞
 */
export async function testLikeComment(commentId: number, isUnlike: boolean = false) {
	console.log(`=== 测试${isUnlike ? '取消点赞' : '点赞'}评论API ===`);
	const token = getToken();
	
	const params = isUnlike ? '?type=unlike' : '';
	
	try {
		// 使用fetch直接调用，验证认证头
		const response = await fetch(`${baseURL}/comment/${commentId}/like${params}`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: token ? `${token_prefix}${token}` : "",
			},
			// 包含凭证
			credentials: "include",
		});
		
		const result = await response.json();
		console.log("API响应:", result);
		return result;
	} catch (error) {
		console.error("API调用失败:", error);
		return { error: error.message };
	}
}

/**
 * 初始化调试工具，添加到window对象以便浏览器控制台使用
 */
export function initAuthDebug() {
	// @ts-ignore
	window.authDebug = {
		checkStatus: checkAuthStatus,
		likeComment: (id: number) => testLikeComment(id, false),
		unlikeComment: (id: number) => testLikeComment(id, true),
	};
	console.log(
		"认证调试工具已加载。使用方法:\n" +
		"- authDebug.checkStatus() 检查认证状态\n" +
		"- authDebug.likeComment(评论ID) 测试点赞\n" +
		"- authDebug.unlikeComment(评论ID) 测试取消点赞"
	);
}
