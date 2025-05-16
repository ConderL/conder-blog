// 为Nuxt核心API声明全局类型
import type { NuxtApp } from '#app'

declare global {
  const useNuxtApp: () => NuxtApp
  const useHead: (head: any) => void
  const definePageMeta: (meta: any) => void
}

export {} 