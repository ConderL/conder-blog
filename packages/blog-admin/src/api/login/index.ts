import { Result } from "@/model";
import request from "@/utils/request";
import { AxiosPromise } from "axios";
import { CaptchaInfo, LoginForm } from "./types";

/**
 * 获取验证码
 */
export function getCaptcha(): AxiosPromise<Result<CaptchaInfo>> {
  return request({
    url: "/captcha",
    method: "get",
    params: {
      type: "ConderAdmin",
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
      type: "ConderAdmin",
    },
  });
}

/**
 * 管理员登录
 * @param data 登录信息
 * @returns Token
 */
export function login(data: LoginForm): AxiosPromise<Result<string>> {
  return request({
    url: "/admin/auth/login",
    method: "post",
    data,
  });
}

/**
 * 用户退出
 */
export function logout(): AxiosPromise<Result<null>> {
  return request({
    url: "/admin/auth/logout",
    method: "post",
  });
}
