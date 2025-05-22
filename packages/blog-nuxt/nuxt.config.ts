// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  ssr: true,
  compatibilityDate: '2025-05-16',
  modules: [
    '@nuxt/ui',
    '@unocss/nuxt',
    '@pinia/nuxt',
    '@nuxt/image',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/color-mode',
    '@nuxtjs/robots',
    'nuxt-simple-sitemap',
  ],

  buildModules: [
  ],
  
  // Tailwind CSS 配置
  tailwindcss: {
    cssPath: '~/assets/css/tailwind.css',
    configPath: '~/tailwind.config.js',
    exposeConfig: true,
    viewer: false,
  },
  // Nuxt UI 配置
  ui: {
    safelistColors: ['primary', 'gray', 'green', 'red', 'yellow', 'blue', 'pink', 'orange'],
    global: true,
    prefix: 'U',
    icons: false,
  },
  pinia: {
    autoImports: ['defineStore', 'acceptHMRUpdate', 'storeToRefs'],
  },
  imports: {
    dirs: ['stores', 'composables', 'utils'],
    // 自动导入Nuxt组合API
    presets: [
      {
        from: 'vue',
        imports: ['ref', 'computed', 'reactive', 'onMounted', 'watch', 'watchEffect']
      }
    ]
  },
  css: [
    '@/assets/styles/main.scss',
    '@/assets/styles/animations.scss',
    '@/assets/styles/slideover.scss',
    '@/assets/styles/icons.scss'
  ],
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
        { name: 'robots', content: 'index, follow' },
        { property: 'og:type', content: 'website' },
        { property: 'og:title', content: "Conder's blog - 技术与生活分享" },
        { property: 'og:description', content: '一个使用Nuxt.js构建的博客网站，提供优质的技术文章和生活分享' },
        { property: 'og:site_name', content: "Conder's blog" }
      ],
      link: [
        { rel: 'icon', href: '/favicon.ico', sizes: 'any' }
      ]
    },
    // 全局页面和布局过渡效果
    pageTransition: {
      name: 'page-slide',
      mode: 'out-in'
    },
    layoutTransition: {
      name: 'layout-fade',
      mode: 'out-in'
    }
  },
  runtimeConfig: {
    // 私有配置，不暴露给客户端
    apiSecret: '',
    // 公共配置，可在客户端使用
    public: {
      baseURL: process.env.VITE_SERVICE_BASE_URL || 'http://localhost:3000',
      apiBase: process.env.VITE_SERVICE_BASE_URL || 'http://localhost:3000',
      // 网站URL，用于SEO和分享
      siteUrl: process.env.SITE_URL || 'http://localhost:3334',
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
    routeRules: {
      '/api/**': { 
        proxy: process.env.VITE_SERVICE_BASE_URL 
          ? `${process.env.VITE_SERVICE_BASE_URL}/api/**` 
          : 'http://localhost:3000/api/**'
      }
    }
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
  build: {
    transpile: ['easy-typer-js']
  },
  components: {
    global: true,
    dirs: [
      {
        path: '~/components',
        pathPrefix: false,
        extensions: ['.vue'],
        priority: 1 // 设置优先级高于默认值
      }
    ]
  },
  
  image: {
    provider: 'ipx',
    dir: 'public',
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536
    }
  },
  experimental: {
    payloadExtraction: false,
    inlineSSRStyles: false,
    viewTransition: true,
    componentIslands: true
  },
  // 路由选项
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
    '/archive': { ssr: true },
    '/talk': { ssr: true },
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
  },
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          // 不使用全局scss变量，避免与CSS变量冲突
          additionalData: '@import "@/assets/styles/mixin.scss";',
          api: "modern-compiler",
          silenceDeprecations: ["legacy-js-api", "import"]
        }
      }
    },
    // 添加 SVG Loader 插件
    plugins: [
      require('vite-svg-loader')()
    ],
    // 优化构建性能
    optimizeDeps: {
      include: ['vue', 'vue-router', 'pinia', '@vueuse/core']
    },
    // 减少构建警告
    build: {
      chunkSizeWarningLimit: 1000
    }
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
  sitemap: {
    urls: [],
    xsl: false,
    cacheTime: 1000 * 60 * 60 * 24, // 24小时
    siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3334',
    autoLastmod: true,
  },
  robots: {
    rules: {
      UserAgent: '*',
      Allow: '/',
      Sitemap: 'sitemap.xml'
    },
    configPath: '~/robots.config',
  },
}) 