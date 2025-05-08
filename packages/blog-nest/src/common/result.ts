/**
 * 统一响应结果
 */
export class Result {
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
  data: any;

  /**
   * 成功结果
   * @param data 返回数据
   * @param message 消息
   * @returns Result实例
   */
  static ok(data: any = null, message: string = '操作成功'): Result {
    const result = new Result();
    result.code = 200;
    result.message = message;
    result.data = data;
    return result;
  }

  /**
   * 失败结果
   * @param message 错误消息
   * @param code 错误代码
   * @returns Result实例
   */
  static fail(message: string = '操作失败', code: number = 500): Result {
    const result = new Result();
    result.code = code;
    result.message = message;
    result.data = null;
    return result;
  }

  /**
   * 参数错误结果
   * @param message 错误消息
   * @returns Result实例
   */
  static badRequest(message: string = '参数错误'): Result {
    return Result.fail(message, 400);
  }

  /**
   * 未授权结果
   * @param message 错误消息
   * @returns Result实例
   */
  static unauthorized(message: string = '未授权'): Result {
    return Result.fail(message, 401);
  }

  /**
   * 禁止访问结果
   * @param message 错误消息
   * @returns Result实例
   */
  static forbidden(message: string = '禁止访问'): Result {
    return Result.fail(message, 403);
  }

  /**
   * 不存在结果
   * @param message 错误消息
   * @returns Result实例
   */
  static notFound(message: string = '资源不存在'): Result {
    return Result.fail(message, 404);
  }
}
