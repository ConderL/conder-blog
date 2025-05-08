import Cookies from "js-cookie";

const TokenKey: string = "Token";

// 只在生产环境设置domain
const isProd = import.meta.env.PROD;
const domain: string = ".conder.top";

// token前缀
export const token_prefix = "Bearer ";

export function getToken(): string | undefined {
  const token = Cookies.get(TokenKey);

  // 检查token是否有效
  if (token) {
    console.log(
      `读取到token: ${token.substring(0, 20)}...，长度: ${token.length}`
    );

    // 检查是否是无效字符串
    if (token === "[object Object]" || token.includes("[object Object]")) {
      console.error("读取到无效token格式，删除并返回undefined");
      removeToken();
      return undefined;
    }
  } else {
    console.log("未读取到token");
  }

  return token;
}

export function setToken(token: string): string | undefined {
  console.log(
    `准备保存token: ${
      token ? token.substring(0, 20) + "..." : token
    }，类型: ${typeof token}`
  );

  // 确保token是字符串且不是"[object Object]"
  if (typeof token !== "string") {
    console.error("尝试保存非字符串token:", token);
    return;
  }

  if (token.includes("[object Object]")) {
    console.error("尝试保存无效token格式，包含[object Object]", token);
    return;
  }

  if (token.length === 0) {
    console.error("尝试保存空token");
    return;
  }

  // 本地开发环境不设置domain
  console.log(`成功保存token，长度: ${token.length}`);
  if (isProd) {
    return Cookies.set(TokenKey, token, { domain: domain });
  }
  return Cookies.set(TokenKey, token);
}

export function removeToken(): void {
  // 本地开发环境不设置domain
  if (isProd) {
    Cookies.remove(TokenKey, { domain: domain });
  } else {
    Cookies.remove(TokenKey);
  }
}
