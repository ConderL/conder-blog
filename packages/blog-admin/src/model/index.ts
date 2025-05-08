import { UserInfo } from "@/api/user/types";

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
 * 结果返回接口
 */
export interface Result<T> {
  /**
   * 返回状态
   */
  flag: boolean;
  /**
   * 状态码
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

/**
 * 上传图片
 */
export interface Picture {
  /**
   * 链接
   */
  url: string;
}

/**
 * 审核DTO
 */
export interface CheckDTO {
  /**
   * id集合
   */
  idList: number[];
  /**
   * 是否通过 (0否 1是)
   */
  isCheck: number;
}

/**
 * 评论
 */
export interface Comment {
  /**
   * 评论id
   */
  id: number;
  /**
   * 评论用户id
   */
  userId: number;
  /**
   * 评论用户信息
   */
  user: UserInfo;
  /**
   * 被回复用户id
   */
  replyUserId?: number;
  /**
   * 被回复用户信息
   */
  replyUser?: UserInfo;
  /**
   * 文章id
   */
  articleId: number;
  /**
   * 文章信息
   */
  article?: {
    id: number;
    articleTitle: string;
  };
  /**
   * 评论内容
   */
  commentContent: string;
  /**
   * 父评论id
   */
  parentId?: number;
  /**
   * 子评论列表
   */
  children?: Comment[];
  /**
   * 是否删除（0-未删除，1-已删除）
   */
  isDelete: number;
  /**
   * 评论时间
   */
  createdAt: string;
}

/**
 * 评论树结构
 */
export interface CommentTree extends Comment {
  /**
   * 子评论列表
   */
  children: CommentTree[];
}
