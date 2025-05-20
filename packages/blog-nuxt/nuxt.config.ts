// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  ssr: true,
  compatibilityDate: '2025-05-16',
  modules: [
    '@nuxt/icon', // 图标模块放在前面优先加载
    '@nuxt/ui',
    '@unocss/nuxt',
    '@pinia/nuxt',
    '@nuxt/image',
    'nuxt-svgo',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/color-mode',
  ],
  
  // 图标配置
  icon: {
    // 图标服务器端配置
    serverBundle: {
      // 只包含使用到的图标集合，减小打包体积
      collections: ['heroicons', 'lucide']
    }
  },
  // Tailwind CSS 配置
  tailwindcss: {
    cssPath: '~/assets/css/tailwind.css',
    configPath: '~/tailwind.config.js',
    exposeConfig: true,
    viewer: false,
  },
  // Nuxt UI 配置
  ui: {
    icons: ['heroicons', 'lucide'],
    safelistColors: ['primary', 'gray', 'green', 'red', 'yellow', 'blue', 'pink', 'orange'],
    global: true,
    prefix: 'U',
  },
  pinia: {
    autoImports: ['defineStore', 'acceptHMRUpdate', 'storeToRefs'],
  },
  imports: {
    dirs: ['stores', 'composables'],
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
    '@/assets/styles/slideover.scss'
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
    public: {
      baseURL: process.env.VITE_SERVICE_BASE_URL || 'http://localhost:3000',
      // 公共变量
      iconPrefix: 'icon',
      // 本地SVG图标集合配置
      iconLocalPrefix: 'icon-local',
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
    transpile: ['easy-typer-js', '@heroicons/vue', '@nuxt/icon']
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
  
  // 图标配置已移至 UI 配置中
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
  svgo: {
    autoImportPath: './assets/icons/svg/',
    defaultImport: 'component',
    query: '?raw',
    import: 'default'
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
    '/': { ssr: true },
    '/article/**': { ssr: true },
    '/category/**': { ssr: true },
    '/tag/**': { ssr: true },
    '/about': { ssr: true },
    '/archive': { ssr: true },
    '/talk': { ssr: true },
    // 测试页面使用客户端渲染(CSR)
    '/test': { ssr: false },
    // 非关键页面使用客户端渲染(CSR)
    '/user/**': { ssr: false },
    '/admin/**': { ssr: false }
  },
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          // 不使用全局scss变量，避免与CSS变量冲突
          additionalData: '',
          api: "modern-compiler",
          silenceDeprecations: ["legacy-js-api", "import"]
        }
      }
    },
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
    classSuffix: ''
  },
}) 