import { ApiProperty } from '@nestjs/swagger';
import { StatusCodeEnum } from '../enums/status-code.enum';

/**
 * 统一API响应格式
 *
 */
export class ResultDto<T> {
  /**
   * 操作是否成功
   * @example true
   */
  @ApiProperty({ description: '操作是否成功', example: true })
  flag: boolean;

  /**
   * 状态码
   * @example 200
   */
  @ApiProperty({ description: '状态码', example: 200 })
  code: number;

  /**
   * 消息内容
   * @example "操作成功"
   */
  @ApiProperty({ description: '消息内容', example: '操作成功' })
  msg: string;

  /**
   * 响应数据
   */
  @ApiProperty({ description: '响应数据' })
  data?: T;

  /**
   * 创建成功响应
   * @param data 响应数据
   * @param msg 成功消息
   * @returns ResultDto实例
   */
  static success<T>(data?: T, msg = '操作成功'): ResultDto<T> {
    const result = new ResultDto<T>();
    result.flag = true;
    result.code = StatusCodeEnum.SUCCESS;
    result.msg = msg;
    result.data = data;
    return result;
  }

  /**
   * 创建失败响应
   * @param msg 失败消息
   * @param data 响应数据
   * @returns ResultDto实例
   */
  static fail<T>(msg = '操作失败', data?: T): ResultDto<T> {
    const result = new ResultDto<T>();
    result.flag = false;
    result.code = StatusCodeEnum.FAIL;
    result.msg = msg;
    result.data = data;
    return result;
  }

  /**
   * 创建参数验证错误响应
   * @param msg 错误消息
   * @param data 响应数据
   * @returns ResultDto实例
   */
  static validError<T>(msg = '参数验证错误', data?: T): ResultDto<T> {
    const result = new ResultDto<T>();
    result.flag = false;
    result.code = StatusCodeEnum.VALID_ERROR;
    result.msg = msg;
    result.data = data;
    return result;
  }

  /**
   * 创建未授权响应
   * @param msg 错误消息
   * @param data 响应数据
   * @returns ResultDto实例
   */
  static unauthorized<T>(msg = '未授权或授权已过期', data?: T): ResultDto<T> {
    const result = new ResultDto<T>();
    result.flag = false;
    result.code = StatusCodeEnum.UNAUTHORIZED;
    result.msg = msg;
    result.data = data;
    return result;
  }

  /**
   * 创建系统错误响应
   * @param msg 错误消息
   * @param data 响应数据
   * @returns ResultDto实例
   */
  static error<T>(msg = '系统错误', data?: T): ResultDto<T> {
    const result = new ResultDto<T>();
    result.flag = false;
    result.code = StatusCodeEnum.SYSTEM_ERROR;
    result.msg = msg;
    result.data = data;
    return result;
  }
}
