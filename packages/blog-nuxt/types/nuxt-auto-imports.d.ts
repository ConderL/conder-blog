// 为Nuxt自动导入的API提供全局类型定义

// 路由相关
declare function useRoute(): {
  params: Record<string, string>;
  query: Record<string, string>;
  path: string;
  fullPath: string;
  hash: string;
  name: string;
  matched: any[];
  meta: any;
  [key: string]: any;
};

declare function useRouter(): {
  push: (to: string | object) => Promise<void>;
  replace: (to: string | object) => Promise<void>;
  go: (delta: number) => Promise<void>;
  back: () => Promise<void>;
  forward: () => Promise<void>;
  [key: string]: any;
};

declare function navigateTo(to: string | object, options?: object): Promise<void>;

// 应用状态相关
declare function useNuxtApp(): {
  $api: any;
  [key: string]: any;
};

declare function useRuntimeConfig(): {
  public: {
    apiBase: string;
    [key: string]: any;
  };
  [key: string]: any;
};

// 数据获取相关
declare function useState<T>(key: string, init?: () => T): { value: T };

declare function useAsyncData<T>(
  key: string,
  handler: () => Promise<T>,
  options?: object
): Promise<{ data: { value: T } }>;

declare function useFetch<T>(
  url: string,
  options?: object
): Promise<{ data: { value: T } }>;

// 应用配置相关
declare function useHead(options: {
  title?: string | (() => string);
  meta?: Array<Record<string, any>>;
  link?: Array<Record<string, any>>;
  [key: string]: any;
}): void;

// 页面元数据
declare function definePageMeta(meta: {
  layout?: string;
  middleware?: string | string[];
  [key: string]: any;
}): void;

// 插件相关
declare function defineNuxtPlugin<T>(plugin: (nuxtApp: any) => T): T;

// Pinia相关
declare function defineStore<Id extends string, S extends object, G extends object, A extends object>(
  id: Id,
  options: {
    state?: () => S;
    getters?: G;
    actions?: A;
    persist?: {
      enabled?: boolean;
      strategies?: Array<{
        key?: string;
        storage?: Storage;
        paths?: string[];
      }>;
    };
  }
): any;

// 声明Nuxt自动导入的函数类型
declare global {
  // 页面元数据
  const definePageMeta: (meta: {
    title?: string;
    layout?: string;
    middleware?: string | string[];
    [key: string]: any;
  }) => void;

  // 异步组件
  const defineAsyncComponent: typeof import('vue')['defineAsyncComponent'];

  // 数据获取
  const useFetch: <T = any>(
    url: string,
    options?: {
      key?: string;
      method?: string;
      baseURL?: string;
      headers?: Record<string, string>;
      params?: Record<string, any>;
      body?: any;
      lazy?: boolean;
      immediate?: boolean;
      watch?: boolean | any[];
      server?: boolean;
      client?: boolean;
      default?: () => T;
      transform?: (input: T) => any;
      pick?: string[];
      [key: string]: any;
    }
  ) => Promise<{ data: Ref<T | null>; pending: Ref<boolean>; error: Ref<any>; refresh: () => Promise<void> }>;

  // 路由
  const useRouter: typeof import('vue-router')['useRouter'];
  const useRoute: typeof import('vue-router')['useRoute'];

  // 其他Nuxt自动导入
  const useRuntimeConfig: () => any;
  const useNuxtApp: () => any;
  const useError: () => any;
  const createError: (options: any) => any;
  const showError: (error: any) => void;
  const clearError: (options?: { redirect?: string }) => void;
  const navigateTo: (to: string | object, options?: any) => Promise<void>;
  const abortNavigation: (error?: any) => void;
  const useHead: (head: any) => void;
  const useSeoMeta: (meta: any) => void;
  const useState: <T>(key: string, init?: () => T) => Ref<T>;
}

export {}; 