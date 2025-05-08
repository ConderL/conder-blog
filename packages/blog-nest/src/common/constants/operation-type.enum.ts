/**
 * 操作类型枚举
 */
export enum OperationType {
  /**
   * 查询操作
   */
  SELECT = 'SELECT',

  /**
   * 新增操作
   */
  INSERT = 'INSERT',

  /**
   * 修改操作
   */
  UPDATE = 'UPDATE',

  /**
   * 删除操作
   */
  DELETE = 'DELETE',

  /**
   * 授权操作
   */
  GRANT = 'GRANT',

  /**
   * 导出操作
   */
  EXPORT = 'EXPORT',

  /**
   * 导入操作
   */
  IMPORT = 'IMPORT',

  /**
   * 强制退出操作
   */
  FORCE = 'FORCE',

  /**
   * 生成代码操作
   */
  GENCODE = 'GENCODE',

  /**
   * 清空操作
   */
  CLEAN = 'CLEAN',

  /**
   * 其它操作
   */
  OTHER = 'OTHER',
}
