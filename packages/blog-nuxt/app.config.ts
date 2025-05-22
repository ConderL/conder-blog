// https://nuxt.com/docs/guide/directory-structure/app-config
export default defineAppConfig({
  ui: {
    icons: {
      arrowLeft: 'i-svg-angle-left',
      arrowRight: 'i-svg-angle-right',
      check: 'i-svg-check',
      chevronDoubleLeft: 'i-svg-angle-left',
      chevronDoubleRight: 'i-svg-angle-right',
      chevronDown: 'i-svg-down',
      chevronLeft: 'i-svg-angle-left',
      chevronRight: 'i-svg-angle-right',
      chevronUp: 'i-svg-up',
      close: 'i-svg-close',
      ellipsis: 'i-svg-more',
      external: 'i-svg-link',
      loading: 'i-svg-loading',
      minus: 'i-svg-minus',
      plus: 'i-svg-plus',
      search: 'i-svg-search'
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