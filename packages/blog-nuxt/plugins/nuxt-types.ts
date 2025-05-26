// 该插件没有实际代码，仅用于帮助TypeScript类型系统识别Nuxt自动导入的API
// 类型已在types/nuxt.d.ts中定义，无需在此导入

// 使用显式导入，避免"Cannot find name 'defineNuxtPlugin'"错误
import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin(() => {
  // 此插件不做任何事，仅用于在运行时注册
  return {};
}); 