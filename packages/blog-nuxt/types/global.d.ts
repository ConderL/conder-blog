// 全局类型定义，包含所有Nuxt自动导入的API
import type { RouteLocationNormalizedLoaded, Router } from 'vue-router';

// 定义Nuxt应用实例类型扩展
declare module '#app' {
  interface NuxtApp {
    $api: any;
  }
}

// 声明easy-typer-js模块
declare module 'easy-typer-js' {
  export default class EasyTyper {
    constructor(
      obj: any,
      input: string,
      fn: () => void,
      hooks: () => void
    );
  }
}

// 声明全局组件
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $api: any;
  }
}

// 扩展Window接口以支持全局消息系统
interface Window {
  $message?: {
    success: (message: string) => void;
    error: (message: string) => void;
    warning: (message: string) => void;
    info: (message: string) => void;
  };
}

// 声明全局API
declare global {
  // Vue Router API
  const useRouter: () => Router;
  const useRoute: () => RouteLocationNormalizedLoaded;
  
  // Nuxt API
  const useNuxtApp: () => any;
  const useHead: (head: any) => void;
  const definePageMeta: (meta: any) => void;
  const defineNuxtConfig: (config: any) => any;
  
  // Vue Composition API
  const ref: typeof import('vue')['ref'];
  const computed: typeof import('vue')['computed'];
  const reactive: typeof import('vue')['reactive'];
  const watch: typeof import('vue')['watch'];
  const onMounted: typeof import('vue')['onMounted'];
  const nextTick: typeof import('vue')['nextTick'];
}

export {}; 