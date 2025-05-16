/// <reference types="node" />
/// <reference types="vite/client" />

// Nuxt 3全局变量声明
interface NuxtProcess {
  client: boolean;
  server: boolean;
  dev: boolean;
  mode: 'spa' | 'universal' | 'static';
  static: boolean;
  env: {
    [key: string]: string | undefined;
  };
}

declare global {
  var process: NuxtProcess;
} 

// Nuxt 3全局变量声明
interface NuxtProcess {
  client: boolean;
  server: boolean;
  dev: boolean;
  mode: 'spa' | 'universal' | 'static';
  static: boolean;
  env: {
    [key: string]: string | undefined;
  };
}

declare global {
  var process: NuxtProcess;
} 

interface ImportMetaEnv {
  readonly VITE_BASE_URL: string;
  readonly VITE_SERVICE_BASE_URL: string;
  readonly VITE_ICON_PREFIX: string;
  readonly VITE_ICON_LOCAL_PREFIX: string;
  readonly VITE_DIST_NAME: string;
  readonly VITE_HTTP_PROXY: string;
  readonly VITE_VISUALIZER: string;
  readonly VITE_COMPRESS: string;
  readonly VITE_COMPRESS_TYPE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
  readonly client: boolean;
  readonly server: boolean;
  readonly dev: boolean;
  readonly prod: boolean;
}

// 声明Nuxt特定的全局变量
declare global {
  const process: {
    client: boolean;
    server: boolean;
    dev: boolean;
    env: {
      [key: string]: string | undefined;
    };
  }
}

export {}; 