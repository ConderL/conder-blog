// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  ssr: true,
  compatibilityDate: '2025-05-16',
  modules: [
    '@unocss/nuxt',
    '@pinia/nuxt',
    '@nuxt/image',
    'nuxt-svgo',
  ],
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
    '@/assets/styles/main.scss'
  ],
  app: {
    head: {
      title: '博客系统',
      titleTemplate: '%s - 技术与生活分享',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: '一个基于Nuxt.js的服务端渲染博客系统' },
        { name: 'keywords', content: 'Nuxt,Vue,SSR,博客,Blog' },
        { name: 'author', content: '博主' },
        { name: 'robots', content: 'index, follow' },
        { property: 'og:type', content: 'website' },
        { property: 'og:title', content: '博客网站 - 技术与生活分享' },
        { property: 'og:description', content: '一个使用Nuxt.js构建的博客网站，提供优质的技术文章和生活分享' },
        { property: 'og:site_name', content: '博客网站' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  },
  runtimeConfig: {
    public: {
      // 环境变量
      apiBase: process.env.VITE_SERVICE_BASE_URL || 'http://localhost:3000',
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
    transpile: ['easy-typer-js']
  },
  components: [
    {
      path: '~/components',
      pathPrefix: false,
      extensions: ['.vue'],
      global: true
    }
  ],
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
    payloadExtraction: false
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
    }
  }
}) 