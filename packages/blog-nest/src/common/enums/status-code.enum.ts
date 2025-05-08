/**
 * 状态码枚举
 *
 * 定义系统中使用的统一状态码
 */
export enum StatusCodeEnum {
  /**
   * 操作成功
   */
  SUCCESS = 200,

  /**
   * 操作失败
   */
  FAIL = 400,

  /**
   * 参数验证错误
   */
  VALID_ERROR = 401,

  /**
   * 未授权或授权已过期
   */
  UNAUTHORIZED = 403,

  /**
   * 系统错误
   */
  SYSTEM_ERROR = 500,
}

/**
 * 状态码消息
 */
export const StatusCodeMessage = {
  [StatusCodeEnum.SUCCESS]: '操作成功',
  [StatusCodeEnum.VALID_ERROR]: '参数错误',
  [StatusCodeEnum.UNAUTHORIZED]: '未登录',
  [StatusCodeEnum.SYSTEM_ERROR]: '系统异常',
  [StatusCodeEnum.FAIL]: '操作失败',
};
