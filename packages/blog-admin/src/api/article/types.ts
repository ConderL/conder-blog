import { PageQuery } from "@/model";

/**
 * 文章查询参数
 */
export interface ArticleQuery extends PageQuery {
  /**
   * 关键字
   */
  keyword?: string;
  /**
   * 是否删除 (0否 1是)
   */
  isDelete: number;
  /**
   * 状态 (1公开 2私密 3草稿)
   */
  status?: number;
  /**
   * 分类id
   */
  categoryId?: number;
  /**
   * 文章类型
   */
  articleType?: number;
  /**
   * 标签id
   */
  tagId?: number;
}

/**
 * 分类
 */
export interface CategoryVO {
  /**
   * 分类id
   */
  id: number;
  /**
   * 分类名
   */
  categoryName: string;
}

/**
 * 标签
 */
export interface TagVO {
  /**
   * 标签id
   */
  id: number;
  /**
   * 标签名
   */
  tagName: string;
}

/**
 * 文章
 */
export interface Article {
  /**
   * 文章id
   */
  id: number;
  /**
   * 文章缩略图
   */
  articleCover: string;
  /**
   * 文章标题
   */
  articleTitle: string;
  /**
   * 文章类型 (1原创 2转载 3翻译)
   */
  articleType: number;
  /**
   * 是否置顶 (0否 1是)
   */
  isTop: number;
  /**
   * 是否推荐 (0否 1是)
   */
  isRecommend: number;
  /**
   * 是否删除 (0否 1是)
   */
  isDelete: number;
  /**
   * 状态 (1公开 2私密 3草稿)
   */
  status: number;
  /**
   * 点赞量
   */
  likeCount: number;
  /**
   * 浏览量
   */
  viewCount: number;
  /**
   * 文章分类名
   */
  categoryName: string;
  /**
   * 文章标签
   */
  tagVOList: TagVO[];
  /**
   * 发表时间
   */
  createTime: string;
}

/**
 * 文章表单
 */
export interface ArticleForm {
  id?: number;
  articleTitle: string;
  articleContent: string;
  articleCover: string;
  articleDesc: string;
  articleType: number;
  categoryId?: number;
  categoryName: string;
  tagIdList?: number[];
  tagNameList: string[];
  isTop: number;
  isRecommend: number;
  status: number;
  type?: number;
  isDelete?: number;
  isFeatured?: number;
  originalUrl?: string;
}

/**
 * 逻辑删除
 */
export interface DeleteDTO {
  /**
   * id列表
   */
  idList: number[];
  /**
   * 是否删除 (0否 1是)
   */
  isDelete: number;
}

/**
 * 置顶状态
 */
export interface Top {
  /**
   * id
   */
  id: number;
  /**
   * 是否置顶 (0否 1是)
   */
  isTop: number;
}

/**
 * 推荐状态
 */
export interface Recommend {
  /**
   * id
   */
  id: number;
  /**
   * 是否推荐 (0否 1是)
   */
  isRecommend: number;
}

export interface ArticleRank {
  id: number;
  articleTitle: string;
  viewCount: number;
}

export interface ArticleStatistics {
  date: string;
  count: number;
}

export interface Tag {
  id: number;
  tagName: string;
}

export interface Category {
  id: number;
  categoryName: string;
}
