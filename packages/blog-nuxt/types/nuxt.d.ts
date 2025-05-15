// types/nuxt.d.ts
declare module '#app' {
  interface NuxtApp {
    // 这里可以添加Nuxt应用的自定义属性
  }
}

// 声明Nuxt自动导入的组合式API
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    // 添加全局可用的属性和方法
  }
}

// 声明常用Nuxt API
declare function useRoute(): {
  params: Record<string, string>;
  query: Record<string, string>;
  path: string;
  name: string;
  fullPath: string;
  hash: string;
  matched: any[];
  meta: Record<string, any>;
  [key: string]: any;
};

declare function useRouter(): {
  push: (path: string) => Promise<void>;
  replace: (path: string) => Promise<void>;
  go: (delta: number) => Promise<void>;
  back: () => Promise<void>;
  forward: () => Promise<void>;
  [key: string]: any;
};

declare function useHead(options: {
  title?: string | (() => string);
  titleTemplate?: string | ((title?: string) => string);
  meta?: Array<{
    name?: string;
    property?: string;
    content: string | (() => string);
    [key: string]: any;
  }>;
  link?: Array<{
    rel: string;
    href: string;
    [key: string]: any;
  }>;
  [key: string]: any;
}): void;

declare function defineNuxtConfig(config: Record<string, any>): Record<string, any>;

declare function definePageMeta(meta: Record<string, any>): void;

// Nuxt自动导入的函数类型声明
declare global {
  // Nuxt Composables
  const useAsyncData: any;
  const useFetch: any;
  const useHead: any;
  const useNuxtApp: any;
  const useRuntimeConfig: any;
  const useSeoMeta: any;
  const useState: any;
  
  // Vue Router
  const useRoute: any;
  const useRouter: any;
  
  // Nuxt Helpers
  const defineNuxtPlugin: any;
  const defineNuxtRouteMiddleware: any;
  const definePageMeta: any;
  
  // Nuxt Types
  namespace process {
    const client: boolean;
    const server: boolean;
  }
}

export { useHead, useRoute, useRouter }; 