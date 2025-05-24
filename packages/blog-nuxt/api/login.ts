import requests from '~/utils/request';

/**
 * 登录表单接口
 */
export interface LoginForm {
  email: string;
  password: string;
  code: string;
  captchaUUID: string;
  type: string;
}

/**
 * 用户登录
 * @param data 登录表单数据
 * @returns 登录结果
 */
export const login = (data: LoginForm) => {
  return requests({
    url: '/api/login',
    method: 'post',
    data
  });
};

/**
 * 获取验证码
 * @returns 验证码信息
 */
export const getCaptcha = () => {
  return requests({
    url: '/api/captcha',
    method: 'get'
  });
};

/**
 * 发送邮箱验证码
 * @param email 邮箱
 * @param type 类型
 * @returns 发送结果
 */
export const sendEmailCode = (email: string, type: string) => {
  return requests({
    url: '/api/email/code',
    method: 'post',
    data: {
      email,
      type
    }
  });
};

/**
 * 用户注册
 * @param data 注册数据
 * @returns 注册结果
 */
export const register = (data: any) => {
  return requests({
    url: '/api/register',
    method: 'post',
    data
  });
};

/**
 * 忘记密码
 * @param data 忘记密码数据
 * @returns 重置结果
 */
export const forget = (data: any) => {
  return requests({
    url: '/api/forget',
    method: 'post',
    data
  });
};

/**
 * 获取用户信息
 * @returns 用户信息
 */
export const getUserInfo = () => {
  return requests({
    url: '/api/users/info',
    method: 'get'
  });
}; 