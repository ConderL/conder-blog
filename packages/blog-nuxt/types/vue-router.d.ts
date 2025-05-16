// 为Vue Router API声明全局类型
import type { RouteLocationNormalizedLoaded, Router } from 'vue-router'
import 'vue-router'

declare global {
  const useRouter: () => Router
  const useRoute: () => RouteLocationNormalizedLoaded
  export {}
}

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    requiresAuth?: boolean
    layout?: string
    keepAlive?: boolean
  }
} 