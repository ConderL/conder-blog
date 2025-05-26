/// <reference types="h3" />

// 为Nuxt自动导入模块创建类型声明
declare module '#imports' {
  export * from '#app';
  export * from 'vue';
  export * from 'vue-router';
}

declare module '#app' {
  export * from 'vue';
  export * from 'vue-router';
}

// 处理.vue文件导入
declare module '*.vue' {
  import { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
} 

// 为Nuxt自动导入模块创建类型声明
declare module '#imports' {
  export * from '#app';
  export * from 'vue';
  export * from 'vue-router';
}

declare module '#app' {
  export * from 'vue';
  export * from 'vue-router';
}

// 处理.vue文件导入
declare module '*.vue' {
  import { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
} 

// Vue扩展
import { ComponentCustomProperties } from 'vue';

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

// Nuxt插件
declare function defineNuxtPlugin<T>(plugin: (nuxtApp: any) => T): any;

// Nuxt页面元数据
declare function definePageMeta(meta: Record<string, any>): void;

// window扩展
interface Window {
  $message?: {
    success: (message: string) => void;
    error: (message: string) => void;
    warning: (message: string) => void;
    info: (message: string) => void;
  };
}

// Vue组件自定义属性
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $api: any;
    $message?: any;
  }
}

export {}; 