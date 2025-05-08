/**
 * Redis键常量
 */
export class RedisConstant {
  /**
   * 用户文章点赞集合前缀
   */
  static readonly USER_ARTICLE_LIKE = 'blog:user:article:like:';

  /**
   * 用户评论点赞集合前缀
   */
  static readonly USER_COMMENT_LIKE = 'blog:user:comment:like:';

  /**
   * 用户说说点赞集合前缀
   */
  static readonly USER_TALK_LIKE = 'blog:user:talk:like:';

  /**
   * 文章点赞数
   */
  static readonly ARTICLE_LIKE_COUNT = 'blog:article:like:count';

  /**
   * 评论点赞数
   */
  static readonly COMMENT_LIKE_COUNT = 'blog:comment:like:count';

  /**
   * 说说点赞数
   */
  static readonly TALK_LIKE_COUNT = 'blog:talk:like:count';

  /**
   * 文章浏览量
   */
  static readonly ARTICLE_VIEW_COUNT = 'blog:article:view:count';
}
