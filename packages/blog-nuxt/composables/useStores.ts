/**
 * 统一导出所有store实例的组合式函数
 * 这样可以避免在多处直接导入store实例，降低重复声明的风险
 */
import { appStore } from '../stores/app';
import { blogStore } from '../stores/blog';
import { userStore } from '../stores/user';

// 使用组合函数统一返回所有store
export function useStores() {
  return {
    app: appStore(),
    blog: blogStore(),
    user: userStore()
  };
}

// 也可以单独导出各个store
export function useAppStore() {
  return appStore();
}

export function useBlogStore() {
  return blogStore();
}

export function useUserStore() {
  return userStore();
} 