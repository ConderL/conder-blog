// https://nuxt.com/docs/api/configuration/nuxt-config
// @ts-ignore - Nuxt自动导入
export default defineNuxtConfig({
  devtools: { enabled: true },
  ssr: true,
  modules: [
    '@unocss/nuxt',
    '@pinia/nuxt',
    '@nuxt/image',
  ],
  css: [
    '~/assets/styles/main.scss',
    '~/assets/css/main.css'
  ],
  app: {
    head: {
      title: '博客网站',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: '一个使用Nuxt.js构建的博客网站，提供优质的技术文章' },
        { name: 'keywords', content: '博客,技术,前端,后端,全栈,Vue,Nuxt,JavaScript' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  },
  runtimeConfig: {
    public: {
      // @ts-ignore - Node.js环境变量
      apiBase: process.env.VITE_SERVICE_BASE_URL || 'http://localhost:3000'
    }
  },
  nitro: {
    preset: 'node-server'
  },
  typescript: {
    strict: true,
    shim: false,
    typeCheck: true
  },
  devServer: {
    port: 3334
  },
  build: {
    transpile: []
  },
  components: {
    dirs: [
      '~/components'
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
    payloadExtraction: false
  }
}) 