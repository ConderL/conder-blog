import requests from '~/utils/request';

/**
 * 用户表单接口
 */
export interface UserForm {
  username?: string;
  email?: string;
  password?: string;
  code?: string;
  captchaUUID?: string;
}

/**
 * 邮箱表单接口
 */
export interface EmailForm {
  email: string;
  code: string;
}

/**
 * 用户信息接口
 */
export interface UserInfo {
  nickname: string;
  intro: string;
  webSite: string;
}

/**
 * 修改用户密码
 * @param data 用户密码
 */
export function updateUserPassword(data: UserForm) {
  return requests({
    url: "/auth/user/password",
    method: "put",
    data,
  });
}

/**
 * 修改用户头像
 * @param data 头像
 */
export function updateUserAvatar(data: FormData) {
  return requests({
    url: "/user/avatar",
    method: "post",
    headers: { "content-type": "multipart/form-data" },
    data,
  });
}

/**
 * 修改用户邮箱
 * @param data 用户邮箱
 */
export function updateUserEmail(data: EmailForm) {
  return requests({
    url: "/user/email",
    method: "put",
    data,
  });
}

/**
 * 修改用户信息
 * @param data 用户信息
 */
export function updateUserInfo(data: UserInfo) {
  return requests({
    url: "/user/info",
    method: "put",
    data,
  });
}

/**
 * B站图片上传
 * @param data 头像
 */
export function biliUpload(data: FormData) {
  return requests({
    url: "/bili/upload",
    method: "post",
    headers: { "content-type": "multipart/form-data" },
    data,
  });
} 