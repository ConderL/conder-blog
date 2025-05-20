// https://nuxt.com/docs/guide/directory-structure/app-config
export default defineAppConfig({
  ui: {
    icons: {
      // 默认图标配置
      arrowLeft: 'heroicons:arrow-left',
      arrowRight: 'heroicons:arrow-right',
      check: 'heroicons:check',
      chevronDoubleLeft: 'heroicons:chevrons-left',
      chevronDoubleRight: 'heroicons:chevrons-right',
      chevronDown: 'heroicons:chevron-down',
      chevronLeft: 'heroicons:chevron-left',
      chevronRight: 'heroicons:chevron-right',
      chevronUp: 'heroicons:chevron-up',
      close: 'heroicons:x-mark',
      ellipsis: 'heroicons:ellipsis-horizontal',
      external: 'heroicons:arrow-top-right-on-square',
      loading: 'heroicons:arrow-path',
      minus: 'heroicons:minus',
      plus: 'heroicons:plus',
      search: 'heroicons:magnifying-glass'
    },
    // 分页组件配置
    pagination: {
      default: {
        size: 'md',
        rounded: 'rounded',
        activeButton: {
          color: 'pink',
          variant: 'solid',
          class: 'bg-gradient-pink-orange shadow-pink border-none'
        },
        inactiveButton: {
          color: 'gray',
          variant: 'ghost',
          class: 'hover:bg-gradient-pink-orange hover:text-white hover:shadow-pink'
        }
      }
    }
  }
}) 