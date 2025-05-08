export const BUSINESS_ERROR_CODE = {
  // 公共错误码
  COMMON: 10000, // 通用错误
  TOKEN_INVALID: 10001, // token过期失效
  ACCESS_FORBIDDEN: 10003, // 禁止访问
  PERMISSION_DISABLED: 10003, // 权限被禁用
  USER_DISABLED: 10004, // 用户被冻结

  // 用户模块错误码 (11xxx)
  USER_NOT_EXIST: 11001, // 用户不存在
  USER_ALREADY_EXIST: 11002, // 用户已存在
  PASSWORD_ERROR: 11003, // 密码错误
  OLD_PASSWORD_ERROR: 11004, // 旧密码错误
  USERNAME_OR_PASSWORD_ERROR: 11005, // 用户名或密码错误

  // 文章模块错误码 (12xxx)
  ARTICLE_NOT_EXIST: 12001, // 文章不存在
  ARTICLE_ALREADY_EXIST: 12002, // 文章已存在
  CATEGORY_NOT_EXIST: 12003, // 分类不存在
  TAG_NOT_EXIST: 12004, // 标签不存在

  // 文件模块错误码 (13xxx)
  FILE_NOT_EXIST: 13001, // 文件不存在
  FILE_UPLOAD_ERROR: 13002, // 文件上传失败
  FILE_TYPE_ERROR: 13003, // 文件类型错误
  FILE_SIZE_ERROR: 13004, // 文件大小超出限制

  // 评论模块错误码 (14xxx)
  COMMENT_NOT_EXIST: 14001, // 评论不存在
  COMMENT_CONTENT_EMPTY: 14002, // 评论内容为空

  // 系统模块错误码 (15xxx)
  SYSTEM_ERROR: 15001, // 系统错误
  DATABASE_ERROR: 15002, // 数据库错误
  NETWORK_ERROR: 15003, // 网络错误
};
