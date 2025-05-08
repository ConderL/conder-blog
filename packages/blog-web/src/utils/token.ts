import Cookies from "js-cookie";

const TokenKey: string = "Token";

// 设置Cookie默认选项
const cookieOptions = {
	path: "/", // 所有路径可用
	sameSite: "lax", // 防止CSRF攻击
	expires: 7, // 7天有效期
};

// 我网站的域名是www.conder.top，去前面的www，改成自己的域名
// const domain: string = ".conder.top";

// token前缀
export let token_prefix = "Bearer ";

export function getToken() {
	return Cookies.get(TokenKey);
}

// 本地运行记得删除domain
export function setToken(token: string) {
	// 项目线上部署可以取消注释
	return Cookies.set(TokenKey, token, cookieOptions);
	// return Cookies.set(TokenKey, token);
}

export function removeToken() {
	// 项目线上部署可以取消注释
	return Cookies.remove(TokenKey, { path: "/" });
	// return Cookies.remove(TokenKey);
}
