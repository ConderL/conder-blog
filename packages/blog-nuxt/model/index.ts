/**
 * 通用返回结果
 */
export interface Result<T> {
  /**
   * 返回状态码
   */
  code: number;
  /**
   * 返回信息
   */
  msg: string;
  /**
   * 返回数据
   */
  data: T;
}

/**
 * 分页返回接口
 */
export interface PageResult<T> {
  /**
   * 分页结果
   */
  recordList: T;
  /**
   * 总数
   */
  count: number;
}

/**
 * 分页参数
 */
export interface PageQuery {
  /**
   * 当前页
   */
  current: number;
  /**
   * 每页大小
   */
  size: number;
} 