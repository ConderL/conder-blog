/**
 * Token管理组合式函数
 * 提供token的存储、获取和删除功能
 */
export const useToken = () => {
  const TokenKey: string = "Token";
  
  // token前缀
  const token_prefix = "Bearer ";
  
  // Cookie 选项
  const cookieOptions = {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7天，以秒为单位
    // 如果需要跨子域使用，可以添加 domain
    // domain: ".conder.top" // 线上环境使用
  };
  
  // 创建响应式的token引用
  const token = useState<string | null>(TokenKey, () => null);
  
  /**
   * 获取token
   * @returns token值
   */
  const getToken = (): string | null => {
    // 优先从状态获取，如果没有则从cookie获取
    if (!token.value) {
      token.value = useCookie(TokenKey).value || null;
    }
    return token.value;
  };
  
  /**
   * 设置token
   * @param value token值
   */
  const setToken = (value: string): void => {
    // 同时更新状态和cookie
    token.value = value;
    const cookieToken = useCookie(TokenKey, cookieOptions);
    cookieToken.value = value;
    
    console.log('Token设置成功:', value);
  };
  
  /**
   * 移除token
   */
  const removeToken = (): void => {
    // 同时清除状态和cookie
    token.value = null;
    const cookieToken = useCookie(TokenKey);
    cookieToken.value = null;
    
    console.log('Token已移除');
  };
  
  return {
    token,
    token_prefix,
    getToken,
    setToken,
    removeToken
  };
}; 