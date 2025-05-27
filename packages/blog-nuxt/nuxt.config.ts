// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: {
    enabled: true,
  },
  ssr: true,
  compatibilityDate: '2025-05-16',
  modules: [
    '@nuxt/ui',
    '@pinia/nuxt',
    '@nuxt/image',
    '@nuxtjs/color-mode',
    'nuxt-echarts',
  ],
  
  echarts: {
    // 注册渲染器
    renderer: 'svg',
    // 注册图表类型
    charts: ['PieChart'],
    // 注册组件
    components: ['TitleComponent', 'TooltipComponent', 'LegendComponent', 'GridComponent'],
  },
  
  css: [
    '~/assets/styles/main.css',
    '~/assets/styles/index.scss'
  ],
  
  icon: {
    provider: 'iconify',
    mode: 'svg',
    clientBundle: {
      // scan: true,
      includeCustomCollections: true,
    },
    customCollections: [
      {
        prefix: 'icon',
        dir: './assets/icons'
      }
    ]
  },

  vite: {
    // 优化构建性能
    optimizeDeps: {
      include: ['vue', 'vue-router', 'pinia', '@vueuse/core'],
      exclude: ['lightningcss']
    },
    // 减少构建警告
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        external: ['lightningcss']
      }
    }
  },

  // 更新Nuxt UI配置，确保正确加载组件
  ui: {
    global: true,
    safelistColors: ['primary', 'gray', 'pink', 'blue', 'green', 'yellow', 'red'],
    fonts: false
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
      name: 'page',
      mode: 'out-in'
    },
    layoutTransition: {
      name: 'layout',
      mode: 'out-in'
    }
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
    port: 3334
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
  routeRules: {
    // 首页和常用页面使用服务端渲染(SSR)
    '/': { 
      ssr: true,
      prerender: true,
      cache: {
        maxAge: 60 * 60 // 1小时缓存
      }
    },
    '/article/**': { 
      ssr: true,
      swr: 600 // 10分钟缓存刷新
    },
    '/category/**': { ssr: true },
    '/tag/**': { ssr: true },
    '/about': { 
      ssr: true,
      prerender: true,
    },
    '/archives': { ssr: true },
    '/talk': { ssr: true },
    '/message': { ssr: false },
    // 测试页面使用客户端渲染(CSR)
    '/test': { ssr: false },
    // 非关键页面使用客户端渲染(CSR)
    '/user/**': { ssr: false },
    '/admin/**': { ssr: false },
    // 首页缓存5分钟，自动更新
    '/': { isr: 300 },
    // 文章页缓存10分钟，可手动更新
    '/article/**': { isr: 600 },
    // 标签页和分类页缓存15分钟
    '/tag/**': { isr: 900 },
    '/category/**': { isr: 900 },
    '/archives': { isr: 900 },
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
  plugins: [
    '~/plugins/auto-animate.ts',
    '~/plugins/route-location.ts',
    '~/plugins/error-handler.ts',
    '~/plugins/vue-danmaku.client.ts',
  ],
  // 禁用页面过渡动画的警告
  experimental: {
    emitRouteChunkError: false,
    restoreState: true,
  }
})
