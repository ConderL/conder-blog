/**
 * 获取安全的存储对象
 * 在SSR环境下提供一个兼容的存储对象
 */
export const getSafeStorage = () => {
  // 在客户端使用localStorage
  if (process.client) {
    return localStorage;
  }
  
  // 在服务端提供一个模拟的存储对象
  return {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
    key: () => null,
    length: 0,
  };
};

/**
 * 使用响应式存储
 * @param key 存储键名
 * @param initialValue 初始值
 * @returns 响应式的存储值和修改方法
 */
export const useStorage = <T>(key: string, initialValue: T) => {
  // 在SSR环境下，直接返回初始值
  if (!process.client) {
    return {
      value: ref(initialValue),
      setValue: (newValue: T) => {},
      removeValue: () => {},
    };
  }
  
  const storedValue = ref<T>(initialValue);
  
  // 尝试从localStorage获取值
  try {
    const item = localStorage.getItem(key);
    if (item) {
      storedValue.value = JSON.parse(item);
    }
  } catch (error) {
    console.error('Error reading from localStorage', error);
  }
  
  // 监听值变化，更新localStorage
  watch(storedValue, (newValue) => {
    try {
      localStorage.setItem(key, JSON.stringify(newValue));
    } catch (error) {
      console.error('Error writing to localStorage', error);
    }
  }, { deep: true });
  
  return {
    value: storedValue,
    setValue: (newValue: T) => {
      storedValue.value = newValue;
    },
    removeValue: () => {
      localStorage.removeItem(key);
      storedValue.value = initialValue;
    },
  };
};