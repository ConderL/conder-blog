// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: {
    enabled: true,
  },
  ssr: true,
  compatibilityDate: '2025-05-16',
  modules: [
    '@nuxt/ui',
    '@nuxt/icon',
    '@pinia/nuxt',
    '@nuxt/image',
    '@nuxtjs/color-mode',
  ],
  
  css: [
    '~/assets/css/main.css',
  ],
  
  icon: {
    customCollections: [{
      prefix: 'icon',
      dir: './assets/icons'
    }]
  },

  // 更新Nuxt UI配置，确保正确加载组件
  ui: {
    global: true,
    safelistColors: ['primary', 'gray', 'pink', 'blue', 'green', 'yellow', 'red'],
    fonts: false,
    icons: {
      resolver: true,
    },
  },

  pinia: {
    autoImports: ['defineStore', 'acceptHMRUpdate', 'storeToRefs'],
  },
  imports: {
    dirs: ['stores', 'composables', 'utils'],
    global: true,
    presets: [
      {
        from: 'vue',
        imports: ['ref', 'computed', 'reactive', 'onMounted', 'watch', 'watchEffect']
      }
    ]
  },
  app: {
    head: {
      title: "Conder's blog",
      titleTemplate: '%s - 技术与生活分享',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: '一个基于Nuxt.js的服务端渲染博客系统' },
        { name: 'keywords', content: 'Nuxt,Vue,SSR,博客,Blog' },
        { name: 'author', content: '@ConderL' },
      ],
      link: [
        { rel: 'icon', href: '/favicon.ico', sizes: 'any' }
      ]
    },
    pageTransition: {
      name: 'fade',
      mode: 'out-in'
    },
    layoutTransition: false
  },
  runtimeConfig: {
    public: {
      baseURL: process.env.VITE_BASE_URL || '/',
      serviceBaseUrl: process.env.VITE_SERVICE_BASE_URL || 'http://localhost:3000',
      apiBase: process.env.VITE_SERVICE_BASE_URL || 'http://localhost:3000',
    }
  },
  nitro: {
    preset: 'node-server',
    devProxy: {
      '/api': {
        target: process.env.VITE_SERVICE_BASE_URL || 'http://localhost:3000',
        changeOrigin: true,
        prependPath: true
      }
    },
  },
  typescript: {
    strict: false,
    shim: false,
    typeCheck: false,
    includeWorkspace: false
  },
  devServer: {
    port: 4444
  },
  components: {
    global: true,
    dirs: [
      {
        path: '~/components',
        pathPrefix: false,
        extensions: ['.vue'],
        priority: 1
      }
    ]
  },
  colorMode: {
    preference: 'system',
    fallback: 'light',
    hid: 'nuxt-color-mode-script',
    globalName: '__NUXT_COLOR_MODE__',
    componentName: 'ColorScheme',
    classPrefix: '',
    classSuffix: '',
    storageKey: 'nuxt-color-mode',
  },
})
