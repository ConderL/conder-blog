/**
 * Nuxt3中安全使用localStorage的工具函数
 */
export const useStorage = () => {
  const setItem = (key: string, value: any) => {
    if (import.meta.client) {
      window.localStorage.setItem(key, JSON.stringify(value));
    }
  };

  const getItem = (key: string) => {
    if (import.meta.client) {
      const value = window.localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    }
    return null;
  };

  const removeItem = (key: string) => {
    if (import.meta.client) {
      window.localStorage.removeItem(key);
    }
  };

  return {
    setItem,
    getItem,
    removeItem
  };
};

// 安全获取存储对象
export const getSafeStorage = (): Storage | undefined => {
  if (import.meta.client) {
    return window.localStorage;
  }
  return undefined;
};