// 声明Nuxt自动导入的API
// 全局自动导入的函数和变量
declare global {
  // Vue Router相关
  const useRouter: typeof import('vue-router')['useRouter']
  const useRoute: typeof import('vue-router')['useRoute']
  
  // Nuxt相关
  const defineNuxtPlugin: any
  const definePageMeta: (meta: any) => void
  const useHead: (head: any) => void

  // Composition API
  const ref: typeof import('vue')['ref']
  const computed: typeof import('vue')['computed']
  const reactive: typeof import('vue')['reactive']
  const watch: typeof import('vue')['watch']
  const onMounted: typeof import('vue')['onMounted']
  const nextTick: typeof import('vue')['nextTick']
}

export {} 