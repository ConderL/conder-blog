/**
 * 登录信息
 */
export interface LoginForm {
	/**
	 * 邮箱
	 */
	email: string;
	/**
	 * 密码
	 */
	password: string;
	/**
	 * 验证码
	 */
	code?: string;
	/**
	 * 验证码UUID
	 */
	captchaUUID?: string;
	/**
	 * 平台类型
	 */
	type?: string;
}

/**
 * 验证码信息
 */
export interface CaptchaInfo {
	/**
	 * 验证码UUID
	 */
	captchaUuid: string;
	/**
	 * 验证码图片（SVG格式）
	 */
	captchaImg: string;
}

/**
 * 用户登录信息
 */
export interface UserInfo {
	/**
	 * 用户id
	 */
	id: number;
	/**
	 * 头像
	 */
	avatar: string;
	/**
	 * 昵称
	 */
	nickname: string;
	/**
	 * 用户名
	 */
	username: string;
	/**
	 * 邮箱
	 */
	email: string;
	/**
	 * 个人网站
	 */
	webSite: string;
	/**
	 * 个人简介
	 */
	intro: string;
	/**
	 * 登录方式
	 */
	loginType: number;
	/**
	 * 文章点赞集合
	 */
	articleLikeSet: number[];
	/**
	 * 评论点赞集合
	 */
	commentLikeSet: number[];
	/**
	 * 说说点赞集合
	 */
	talkLikeSet: number[];
}

/**
 * Gitee和Github
 */
export interface GitInfo {
	/**
	 * 第三方token
	 */
	token: string;
}
