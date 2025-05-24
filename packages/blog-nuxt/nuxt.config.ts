// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  devtools: { enabled: true },
  ssr: true,
  compatibilityDate: '2025-05-16',
  modules: [
    '@nuxt/ui',
    '@pinia/nuxt',
    '@nuxt/image',
    '@nuxtjs/color-mode',
    '@nuxtjs/robots',
    'nuxt-simple-sitemap',
  ],

  // 明确禁用任何可能的字体模块
  disableModules: [
    '@nuxt/fonts',
    '@nuxtjs/google-fonts',
  ],

  buildModules: [
  ],
  
  css: [
    '@/assets/styles/main.css',
    '~/assets/styles/index.scss'
  ],

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          // 不使用全局scss变量，避免与CSS变量冲突
          additionalData: '@import "~/assets/styles/mixin.scss";',
          silenceDeprecations: ["legacy-js-api", "import"]
        }
      }
    },
    plugins: [
      tailwindcss(),
      require('vite-svg-loader')()
    ],
    // 优化构建性能
    optimizeDeps: {
      include: ['vue', 'vue-router', 'pinia', '@vueuse/core'],
      exclude: ['lightningcss', '@tailwindcss/oxide']
    },
    // 减少构建警告
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        external: ['lightningcss', '@tailwindcss/oxide']
      }
    }
  },

  // 更新Nuxt UI配置，确保正确加载组件
  ui: {
    global: true,
    icons: {
      // 完全禁用图标自动加载
      resolver: false,
      // 不使用heroicons图标库
      collections: {
        // 禁用默认图标集
        heroicons: false,
        lucide: false
      }
    },
    safelistColors: ['primary', 'gray', 'pink', 'blue', 'green', 'yellow', 'red'],
    fonts: false,
    theme: {
      transitions: true,
    },
  },

  // Tailwind CSS 配置
  tailwindcss: {
    cssPath: '~/assets/styles/main.css',
    configPath: 'tailwind.config.js',
    exposeConfig: false,
    viewer: false,
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
    // 更新页面和布局过渡效果，使用简单的淡入淡出，避免复杂过渡带来的问题
    pageTransition: {
      name: 'fade',
      mode: 'out-in'
    },
    layoutTransition: false // 禁用布局过渡以避免嵌套过渡问题
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
      // 禁用一些在线服务
      offline: true,
      // 禁用 Google Fonts
      googleFontsDisabled: true,
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
      // 自定义组件
      {
        path: '~/components',
        pathPrefix: false,
        extensions: ['.vue'],
        priority: 1
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
  // 解决 robots 与 sitemap 的冲突
  robots: {
    rules: {
      UserAgent: '*',
      Allow: '/',
      Sitemap: 'sitemap.xml'
    },
    configPath: '~/robots.config',
    moduleConfig: {
      // 指示 robots 模块不修改 sitemap 相关配置
      sitemap: false
    }
  },
  // 禁用Google Fonts自动加载
  googleFonts: {
    download: false,
    families: {}
  },
  // 配置字体处理
  fonts: false,
  
  // 配置本地SVG图标 - 直接使用vite-svg-loader更直观
  icon: {
    size: '24px',
    class: 'icon',
  },
})