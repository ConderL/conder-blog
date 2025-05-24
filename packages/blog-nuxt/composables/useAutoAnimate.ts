import { ref, onMounted } from 'vue'
import autoAnimate from '@formkit/auto-animate'

/**
 * AutoAnimate配置选项
 */
export interface AutoAnimateOptions {
  // 动画持续时间（毫秒）
  duration?: number
  // 动画缓动函数
  easing?: string | cubicBezier
  // 是否应用动画，false时禁用动画
  disrespectUserMotionPreference?: boolean
}

// 定义缓动函数类型
type cubicBezier = [number, number, number, number]

/**
 * 创建AutoAnimate引用和配置
 * @param options 自定义配置选项
 * @returns 包含DOM引用的对象
 */
export function useAutoAnimate(options: AutoAnimateOptions = {}) {
  const parent = ref(null)

  onMounted(() => {
    if (parent.value) {
      autoAnimate(parent.value, options)
    }
  })

  return {
    parent
  }
} 