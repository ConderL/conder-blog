import { Result, UserForm } from "@/model";
import request from "@/utils/request";
import { AxiosPromise } from "axios";
import { CaptchaInfo, GitInfo, LoginForm, UserInfo } from "./types";

/**
 * 获取验证码
 */
export function getCaptcha(): AxiosPromise<Result<CaptchaInfo>> {
	return request({
		url: "/captcha",
		method: "get",
		params: {
			type: "ConderView",
		},
	});
}

/**
 * 验证验证码
 * @param captchaUUID 验证码UUID
 * @param code 验证码
 */
export function validateCaptcha(
	captchaUUID: string,
	code: string
): AxiosPromise<Result<boolean>> {
	return request({
		url: "/captcha/validate",
		method: "post",
		data: {
			captchaUuid: captchaUUID,
			captchaCode: code,
			type: "ConderView",
		},
	});
}

/**
 * 用户登录
 * @param data 登录信息
 * @returns Token
 */
export function login(
	data: LoginForm
): AxiosPromise<Result<Record<string, any>>> {
	data.type = "ConderView";
	return request({
		url: "/auth/login",
		method: "post",
		data,
	});
}

/**
 * 邮箱注册
 * @param data 注册信息
 */
export function register(data: UserForm): AxiosPromise<Result<null>> {
	return request({
		url: "/auth/register",
		method: "post",
		data,
	});
}

/**
 * 获取登录用户信息
 * @returns 登录用户信息
 */
export function getUserInfo(): AxiosPromise<Result<UserInfo>> {
	return request({
		url: "/user/getUserInfo",
		method: "get",
	});
}

/**
 * 发送邮箱验证码
 * @param email 邮箱
 */
export function getCode(email: string): AxiosPromise<Result<null>> {
	return request({
		url: "/auth/email/code",
		method: "get",
		params: {
			email,
		},
	});
}

/**
 * 用户退出
 */
export function logout(): AxiosPromise<Result<null>> {
	return request({
		url: "/auth/logout",
		method: "get",
	});
}

/**
 * gitee登录
 * @param data 第三方code
 * @returns Token
 */
export function giteeLogin(data: GitInfo): AxiosPromise<Result<string>> {
	return request({
		url: "/oauth/login/gitee",
		method: "post",
		data,
	});
}

/**
 * github登录
 * @param code 第三方code
 * @returns Token
 */
export function githubLogin(data: GitInfo): AxiosPromise<Result<string>> {
	return request({
		url: "/oauth/login/github",
		method: "post",
		data,
	});
}

/**
 * qq登录
 * @param code 第三方code
 * @returns Token
 */
export function qqLogin(data: GitInfo): AxiosPromise<Result<string>> {
	return request({
		url: "/oauth/login/qq",
		method: "post",
		data,
	});
}
