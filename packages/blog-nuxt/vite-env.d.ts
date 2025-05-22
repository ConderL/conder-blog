/// <reference types="vite/client" />
/// <reference types="vite-svg-loader" />

// 声明SVG模块，使其可以作为Vue组件导入
declare module '*.svg' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent
  export default component
}

// 声明SVG模块的特殊导入模式
declare module '*.svg?raw' {
  const content: string
  export default content
}

declare module '*.svg?url' {
  const content: string
  export default content
}

declare module '*.svg?component' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent
  export default component
} 