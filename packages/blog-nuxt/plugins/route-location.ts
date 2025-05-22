import { defineNuxtPlugin, useRuntimeConfig } from '#app'

export default defineNuxtPlugin((nuxtApp) => {
  // 确保在SSR和CSR环境下路由信息都可用
  nuxtApp.hook('app:created', () => {
    // 这里不需要做任何事情，只是确保路由位置注入可用
    console.log('确保路由注入可用')
  })
}) 