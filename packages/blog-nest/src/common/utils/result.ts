/**
 * 统一响应结果
 */
export class Result<T = any> {
  /**
   * 状态码
   */
  code: number;

  /**
   * 消息
   */
  message: string;

  /**
   * 数据
   */
  data: T;

  /**
   * 成功
   * @param data 数据
   * @param message 消息
   * @returns Result
   */
  static ok<T = any>(data: T = null, message = '操作成功'): Result<T> {
    return {
      code: 200,
      message,
      data,
    };
  }

  /**
   * 失败
   * @param message 消息
   * @param code 状态码
   * @returns Result
   */
  static fail(message = '操作失败', code = 500): Result {
    return {
      code,
      message,
      data: null,
    };
  }

  /**
   * 未授权
   * @param message 消息
   * @returns Result
   */
  static unauthorized(message = '未授权'): Result {
    return {
      code: 401,
      message,
      data: null,
    };
  }

  /**
   * 禁止访问
   * @param message 消息
   * @returns Result
   */
  static forbidden(message = '禁止访问'): Result {
    return {
      code: 403,
      message,
      data: null,
    };
  }

  /**
   * 资源不存在
   * @param message 消息
   * @returns Result
   */
  static notFound(message = '资源不存在'): Result {
    return {
      code: 404,
      message,
      data: null,
    };
  }
}
