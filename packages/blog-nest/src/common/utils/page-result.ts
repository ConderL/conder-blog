/**
 * 分页结果
 */
export class PageResult<T = any> {
  /**
   * 总记录数
   */
  count: number;

  /**
   * 当前页数据
   */
  records: T[];

  /**
   * 当前页码
   */
  current: number;

  /**
   * 每页大小
   */
  size: number;
}
