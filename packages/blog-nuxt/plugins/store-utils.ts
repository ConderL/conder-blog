/**
 * Store实用工具插件
 * 用于解决TypeScript中store重复声明的问题
 */

// 显式导入defineNuxtPlugin以避免错误
import { defineNuxtPlugin } from '#app'

// 我们不在这里直接导出store实例，而是在types/stores.d.ts中声明类型
export default defineNuxtPlugin(() => {
  return {
    provide: {
      // 这个插件不实际提供任何东西，只是为了解决类型问题
    }
  }
}); 