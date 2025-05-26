// plugins/auto-animate.ts
import autoAnimate from '@formkit/auto-animate'
import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin((nuxtApp) => {
  // 添加 v-auto-animate 指令
  nuxtApp.vueApp.directive('auto-animate', {
    mounted: (el, binding) => {
      // 使用默认配置或传递的配置
      autoAnimate(el, binding.value || {})
    }
  })
  
  // 全局方法 - 便于在模板外使用
  return {
    provide: {
      autoAnimate: (el, options = {}) => {
        if (el) {
          autoAnimate(el, options)
          return true
        }
        return false
      }
    }
  }
}) 