// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: {
    enabled: true,
    timeline: {
      enabled: true
    }
  },
  ssr: true,
  baseURL: '/',
  buildAssetsDir: '/_nuxt/',
  compatibilityDate: '2025-05-16',
  modules: [
    '@nuxt/ui',
    '@pinia/nuxt',
    '@nuxt/image',
    'nuxt-lazy-load',
    '@nuxtjs/color-mode',
    'nuxt-echarts',
  ],

  // 添加服务器配置，设置端口为 4000
  server: {
    port: 4000,
    host: '0.0.0.0', // 允许局域网访问
    hmr: {
      // HMR 连接设置
      port: 24678,
      // 禁用 HMR 重载覆盖
      overlay: false
    }
  },

  lazyLoad: {
    defaultImage: '/images/loading.gif',
  },

  echarts: {
    // 注册渲染器
    renderer: 'svg',
    // 注册图表类型
    charts: ['PieChart'],
    // 注册组件
    components: ['TitleComponent', 'TooltipComponent', 'LegendComponent', 'GridComponent'],
  },

  css: [
    '~/assets/style/main.css',
    '~/assets/style/index.scss'
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
        dir: './public/icons'
      }
    ]
  },

  vite: {
    // 优化构建性能
    optimizeDeps: {
      include: ['vue', 'pinia', '@vueuse/core'],
      exclude: ['lightningcss', 'jsencrypt']
    },
    // 减少构建警告
    build: {
      cssCodeSplit: true,
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        external: ['lightningcss', 'jsencrypt'],
        output: {
          manualChunks: {
            'vue-vendor': ['vue'],
            'editor-vendor': ['md-editor-v3'],
            'utils-vendor': ['@vueuse/core', 'pinia'],
            'danmaku-vendor': ['vue3-danmaku']
          }
        }
      },
      // 需要转译的依赖
      transpile: [
        'vue3-social-share',
        'md-editor-v3',
        'reka-ui',
        '@iconify/utils',
        'pinia-plugin-persistedstate',
        'vue-cropper'
      ]
    },
    // 添加热更新配置
    server: {
      watch: {
        usePolling: true,
        interval: 1000
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
        { rel: 'icon', href: '/favicon.svg', sizes: 'any' }
      ]
    },
    pageTransition: {
      name: 'page',
      mode: 'out-in'
    },
    layoutTransition: {
      name: 'layout',
      mode: 'out-in'
    },
    // 添加性能优化配置
    keepalive: true,
  },
  runtimeConfig: {
    public: {
      baseURL: process.env.VITE_BASE_URL || '/',
      serviceBaseUrl: process.env.VITE_SERVICE_BASE_URL || 'http://localhost:3000',
      apiBase: process.env.VITE_SERVICE_BASE_URL || 'http://localhost:3000',
      siteUrl: process.env.VITE_SITE_URL || 'https://conder.top',
    }
  },
  nitro: {
    preset: 'node-server',
    minify: true,
    compressPublicAssets: {
      gzip: true,
      brotli: true
    },
    // 简化缓存配置
    cache: {
      ttl: 60 * 60 * 1000 // 1小时缓存，以毫秒为单位
    },
    sourceMap: false,
    // 禁用构建时预渲染，改为部署后执行
    prerender: {
      crawlLinks: false,
      routes: []
    }
    // externals: {
    //   inline: [
    //     '@nuxt/icon',
    //     '@vueuse/core',
    //     'pinia-plugin-persistedstate'
    //   ]
    // }
  },
  typescript: {
    strict: false,
    shim: false,
    typeCheck: false,
    includeWorkspace: false
  },
  devServer: {
    port: 4000
  },
  components: {
    global: true,
    dirs: [
      {
        path: '~/components',
        pathPrefix: false
      }
    ],
    // 自动懒加载大型组件
    defaults: {
      // 默认情况下不懒加载
      lazy: false,
      // 对于这些组件，明确启用懒加载
      LazyPerformanceMonitor: true,
      LazyMdPreview: true,
      LazyMdCatalog: true,
      LazyLottieWeb: true
    }
  },
  routeRules: {
    // 首页和常用页面使用服务端渲染(SSR)
    '/': {
      ssr: true,
      // 移除prerender配置，改为部署后执行
      // prerender: true,
      cache: {
        maxAge: 3600 // 1小时缓存
      },
      isr: 300 // 5分钟自动更新
    },
    '/article/**': {
      ssr: true,
      swr: 600, // 10分钟缓存刷新
      isr: 600 // 10分钟可手动更新
    },
    '/category/**': {
      ssr: true,
      isr: 900 // 15分钟缓存
    },
    '/tag/**': {
      ssr: true,
      isr: 900 // 15分钟缓存
    },
    '/about': {
      ssr: true,
      isr: 900 // 15分钟缓存
    },
    '/archives': {
      ssr: true,
      isr: 900 // 15分钟缓存
    },
    '/talk': { ssr: true },
    '/message': { ssr: true },
    // 测试页面使用客户端渲染(CSR)
    '/test': { ssr: false },
    // 非关键页面使用客户端渲染(CSR)
    '/user/**': { ssr: false },
    '/admin/**': { ssr: false },
    '/anime/**': { ssr: false },
    '/album/**': { ssr: false }
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
    '~/plugins/md-editor.client.ts',
    '~/plugins/socket-io.client.ts',
    '~/plugins/aplayer.client.ts',
    '~/plugins/tianli-gpt-fix.client.ts',
    '~/plugins/viewer.client.ts',
    '~/plugins/masonry.client.ts'
  ],
  // 禁用页面过渡动画的警告
  experimental: {
    emitRouteChunkError: false,
    restoreState: true,
    payloadExtraction: true,
    inlineSSRStyles: true,
    renderJsonPayloads: true,
    viewTransition: true,
    useOxc: false
  }
})
