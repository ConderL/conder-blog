// types/nuxt.d.ts
import { useApi } from '../composables/useApi';
import type { App, ComponentCustomProperties, Ref } from 'vue';
import type { RouteLocation, RouteLocationRaw } from 'vue-router';
import type { IncomingMessage, ServerResponse } from 'http';

// 定义自定义类型，需要将其放在全局命名空间中
declare global {
  interface TocItem {
    id: string;
    level: number;
    text: string;
  }
  
  // Process类型定义
  var process: {
    client: boolean;
    server: boolean;
    env: Record<string, string>;
  };
  
  // 使Vue组件类型可用
  interface Window {
    TocItem: TocItem;
    $message?: any;
    $dialog?: any;
  }

  // Vue Router相关
  const useRouter: typeof import('vue-router')['useRouter']
  const useRoute: typeof import('vue-router')['useRoute']
  
  // Nuxt相关
  const defineNuxtPlugin: typeof import('#app')['defineNuxtPlugin']
  const definePageMeta: (meta: any) => void
}

// 直接定义API类型，避免循环导入
interface ApiType {
  article: {
    getList: (params?: any) => Promise<any>;
    getDetail: (id: string) => Promise<any>;
    getRelated: (id: string) => Promise<any>;
    getRecommended: () => Promise<any>;
    getArchives: () => Promise<any>;
    like: (id: string) => Promise<any>;
  };
  user: {
    getInfo: () => Promise<any>;
    login: (data: any) => Promise<any>;
    register: (data: any) => Promise<any>;
    logout: () => Promise<any>;
  };
  comment: {
    getList: (articleId: string) => Promise<any>;
    create: (articleId: string, data: any) => Promise<any>;
    reply: (commentId: string, data: any) => Promise<any>;
  };
  blogInfo: {
    getConfig: () => Promise<any>;
    getStats: () => Promise<any>;
    getAnnouncement: () => Promise<any>;
  };
  category: {
    getAll: () => Promise<any>;
    getDetail: (id: string) => Promise<any>;
    getArticles: (id: string, params: any) => Promise<any>;
  };
  tag: {
    getAll: () => Promise<any>;
    getDetail: (id: string) => Promise<any>;
    getArticles: (id: string, params: any) => Promise<any>;
  };
  [key: string]: any;
}

// Nuxt App扩展
declare module '#app' {
  interface PageMeta {
    title?: string
    layout?: string | false
    middleware?: string | string[]
    auth?: boolean
  }
  
  interface NuxtApp {
    $api: ApiType;
    $message?: any
    $dialog?: any
    [key: string]: any;
  }

  // Nuxt核心功能
  export function defineNuxtPlugin<T>(plugin: (nuxtApp: NuxtApp) => T): T;
  export function useNuxtApp(): NuxtApp;
  export function useRuntimeConfig(): any;
  export function useHead(meta: any): void;
  export function useRoute(): RouteLocation;
  export function useRouter(): {
    push(to: RouteLocationRaw): Promise<void>;
    replace(to: RouteLocationRaw): Promise<void>;
    [key: string]: any;
  };
}

// Nuxt自动导入
declare module '#imports' {
  export * from '#app';
  export function definePageMeta(meta: any): void;
  export function useRuntimeConfig(): any;
  export function useState<T>(key: string, init?: () => T): { value: T };
  export function useAsyncData<T>(key: string, fn: () => Promise<T>, options?: any): Promise<{ data: Ref<T> }>;
  export function useFetch<T>(url: string, options?: any): Promise<{ data: Ref<T> }>;
  export function navigateTo(to: string | object): Promise<void>;
  export function useRouter(): any;
  export function useRoute(): any;
  export function useHead(meta: any): void;
  export function useNuxtApp(): any;
}

// Vue运行时扩展
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $api: ApiType;
  }
}

// H3服务器类型
declare module 'h3' {
  export interface H3Event {
    node: {
      req: IncomingMessage;
      res: ServerResponse;
    };
    context: any;
  }
  
  export function defineEventHandler(handler: (event: H3Event) => any): any;
  export function proxyRequest(event: H3Event, target: string, opts?: any): Promise<any>;
  export function getRequestURL(event: H3Event): URL;
}

// 这里的useApi只是一个类型声明，实际导出由composables/useApi.ts定义
declare function useApi(): ApiType;

declare module 'nuxt/schema' {
  interface AppConfigInput {
    theme?: {
      primary?: string
      secondary?: string
    }
  }
}

export { useHead, useRoute, useRouter, useApi }; 