// https://nuxt.com/docs/guide/directory-structure/app-config
export default defineAppConfig({
  ui: {
    // 主题配置 - 使用theme-shoka.scss中的颜色
    // colors: {
    //   primary: 'pink',
    // },
    
    // 图标配置 - 自定义图标映射
    icons: {
      dynamic: {
        // 使用本地SVG图标，使用统一前缀
        arrowLeft: 'icon-angle-left',
        arrowRight: 'icon-angle-right',
        check: 'icon-check',
        chevronDoubleLeft: 'icon-angle-left',
        chevronDoubleRight: 'icon-angle-right',
        chevronDown: 'icon-down',
        chevronLeft: 'icon-angle-left',
        chevronRight: 'icon-angle-right',
        chevronUp: 'icon-up',
        close: 'icon-close',
        ellipsis: 'icon-more',
        external: 'icon-link',
        loading: 'icon-loading',
        minus: 'icon-minus',
        plus: 'icon-plus',
        search: 'icon-search',
        // 添加缺少的图标
        'chevrons-left': 'icon-angle-left',
        'chevrons-right': 'icon-angle-right'
      }
    },
    
    // 分页组件配置 - 使用最新的Nuxt UI API
    pagination: {
      
      // 插槽样式
      slots: {
        label: 'min-w-8 text-center',
      }
    },
    popover: {
      slots: {
        content: 'w-63 mh-200',
        arrow: 'fill-default'
      }
    } 
  }
}) 