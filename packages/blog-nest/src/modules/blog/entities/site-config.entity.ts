import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

/**
 * 网站配置实体
 */
@Entity('t_site_config')
export class SiteConfig {
  /**
   * 主键
   */
  @PrimaryGeneratedColumn({ comment: '主键' })
  id: number;

  /**
   * 用户头像
   */
  @Column({ name: 'user_avatar', comment: '用户头像' })
  userAvatar: string;

  /**
   * 游客头像
   */
  @Column({ name: 'tourist_avatar', comment: '游客头像' })
  touristAvatar: string;

  /**
   * 网站名称
   */
  @Column({ name: 'site_name', length: 20, comment: '网站名称' })
  siteName: string;

  /**
   * 网站地址
   */
  @Column({ name: 'site_address', length: 50, comment: '网站地址' })
  siteAddress: string;

  /**
   * 网站简介
   */
  @Column({ name: 'site_intro', length: 50, comment: '网站简介' })
  siteIntro: string;

  /**
   * 网站公告
   */
  @Column({ name: 'site_notice', length: 200, comment: '网站公告' })
  siteNotice: string;

  /**
   * 建站日期
   */
  @Column({ name: 'create_site_time', length: 20, comment: '建站日期' })
  createSiteTime: string;

  /**
   * 备案号
   */
  @Column({ name: 'record_number', length: 50, comment: '备案号' })
  recordNumber: string;

  /**
   * 作者头像
   */
  @Column({ name: 'author_avatar', comment: '作者头像' })
  authorAvatar: string;

  /**
   * 网站作者
   */
  @Column({ name: 'site_author', length: 50, comment: '网站作者' })
  siteAuthor: string;

  /**
   * 文章默认封面
   */
  @Column({ name: 'article_cover', comment: '文章默认封面' })
  articleCover: string;

  /**
   * 关于我
   */
  @Column({ name: 'about_me', type: 'text', nullable: true, comment: '关于我' })
  aboutMe: string;

  /**
   * Github
   */
  @Column({ name: 'github', length: 50, nullable: true, default: '', comment: 'Github' })
  github: string;

  /**
   * Gitee
   */
  @Column({ name: 'gitee', length: 50, nullable: true, default: '', comment: 'Gitee' })
  gitee: string;

  /**
   * 哔哩哔哩
   */
  @Column({ name: 'bilibili', length: 50, nullable: true, default: '', comment: '哔哩哔哩' })
  bilibili: string;

  /**
   * QQ
   */
  @Column({ name: 'qq', length: 20, nullable: true, comment: 'QQ' })
  qq: string;

  /**
   * 是否评论审核 (0否 1是)
   */
  @Column({ name: 'comment_check', type: 'tinyint', default: 0, comment: '是否评论审核 (0否 1是)' })
  commentCheck: number;

  /**
   * 是否留言审核 (0否 1是)
   */
  @Column({ name: 'message_check', type: 'tinyint', default: 0, comment: '是否留言审核 (0否 1是)' })
  messageCheck: number;

  /**
   * 是否百度审核 (0否 1是)
   */
  @Column({ name: 'baidu_check', type: 'tinyint', default: 1, comment: '是否百度审核 (0否 1是)' })
  baiduCheck: number;

  /**
   * 是否开启打赏 (0否 1是)
   */
  @Column({ name: 'is_reward', type: 'tinyint', default: 1, comment: '是否开启打赏 (0否 1是)' })
  isReward: boolean;

  /**
   * 微信二维码
   */
  @Column({ name: 'wei_xin_code', nullable: true, default: '', comment: '微信二维码' })
  weiXinCode: string;

  /**
   * 支付宝二维码
   */
  @Column({ name: 'ali_code', nullable: true, default: '', comment: '支付宝二维码' })
  aliCode: string;

  /**
   * 是否邮箱通知 (0否 1是)
   */
  @Column({ name: 'email_notice', type: 'tinyint', default: 1, comment: '是否邮箱通知 (0否 1是)' })
  emailNotice: boolean;

  /**
   * 社交列表
   */
  @Column({ name: 'social_list', length: 50, comment: '社交列表' })
  socialList: string;

  /**
   * 登录方式
   */
  @Column({ name: 'login_list', length: 50, comment: '登录方式' })
  loginList: string;

  /**
   * 是否开启音乐播放器 (0否 1是)
   */
  @Column({
    name: 'is_music',
    type: 'tinyint',
    default: 1,
    comment: '是否开启音乐播放器 (0否 1是)',
  })
  isMusic: boolean;

  /**
   * 网易云歌单id
   */
  @Column({ name: 'music_id', length: 20, nullable: true, default: '', comment: '网易云歌单id' })
  musicId: string;

  /**
   * 是否开启聊天室 (0否 1是)
   */
  @Column({ name: 'is_chat', type: 'tinyint', default: 1, comment: '是否开启聊天室 (0否 1是)' })
  isChat: boolean;

  /**
   * websocket链接
   */
  @Column({ name: 'websocket_url', length: 50, nullable: true, comment: 'websocket链接' })
  websocketUrl: string;

  /**
   * 创建时间
   */
  @Column({ name: 'create_time', type: 'datetime', comment: '创建时间' })
  createTime: Date;

  /**
   * 更新时间
   */
  @Column({ name: 'update_time', type: 'datetime', nullable: true, comment: '更新时间' })
  updateTime: Date;

  /**
   * 归档背景
   */
  @Column({ name: 'archive_wallpaper', nullable: true, comment: '归档背景' })
  archiveWallpaper: string;

  /**
   * 分类背景
   */
  @Column({ name: 'category_wallpaper', nullable: true, comment: '分类背景' })
  categoryWallpaper: string;

  /**
   * 标签背景
   */
  @Column({ name: 'tag_wallpaper', nullable: true, comment: '标签背景' })
  tagWallpaper: string;

  /**
   * 说说背景
   */
  @Column({ name: 'talk_wallpaper', nullable: true, comment: '说说背景' })
  talkWallpaper: string;

  /**
   * 相册背景
   */
  @Column({ name: 'album_wallpaper', nullable: true, comment: '相册背景' })
  albumWallpaper: string;

  /**
   * 友链背景
   */
  @Column({ name: 'friend_wallpaper', nullable: true, comment: '友链背景' })
  friendWallpaper: string;

  /**
   * 留言板背景
   */
  @Column({ name: 'message_wallpaper', nullable: true, comment: '留言板背景' })
  messageWallpaper: string;

  /**
   * 关于背景
   */
  @Column({ name: 'about_wallpaper', nullable: true, comment: '关于背景' })
  aboutWallpaper: string;
}
