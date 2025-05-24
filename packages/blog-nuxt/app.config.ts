// https://nuxt.com/docs/guide/directory-structure/app-config
export default defineAppConfig({
  ui: {
    // 主题配置 - 使用theme-shoka.scss中的颜色
    primary: 'pink',
    colors: ['pink'],
    
    // 图标配置 - 自定义图标映射
    icons: {
      dynamic: {
        // 使用本地SVG图标，使用统一前缀
        arrowLeft: 'icon-local:angle-left',
        arrowRight: 'icon-local:angle-right',
        check: 'icon-local:check',
        chevronDoubleLeft: 'icon-local:angle-left',
        chevronDoubleRight: 'icon-local:angle-right',
        chevronDown: 'icon-local:down',
        chevronLeft: 'icon-local:angle-left',
        chevronRight: 'icon-local:angle-right',
        chevronUp: 'icon-local:up',
        close: 'icon-local:close',
        ellipsis: 'icon-local:more',
        external: 'icon-local:link',
        loading: 'icon-local:update',
        minus: 'icon-local:minus',
        plus: 'icon-local:plus',
        search: 'icon-local:search',
        // 添加缺少的图标
        'chevrons-left': 'icon-local:angle-left',
        'chevrons-right': 'icon-local:angle-right',
        // 为Tool组件添加的图标
        'heng': 'icon-local:heng',
        'comments': 'icon-local:comments',
        'up': 'icon-local:up',
        // emoji图标
        'emoji': 'icon-local:emoji',
        // 登录相关图标
        'user': 'icon-local:user',
        'author': 'icon-local:author',
        'logout': 'icon-local:logout',
        'github': 'icon-local:github',
        'gitee': 'icon-local:gitee',
        'qq': 'icon-local:qq',
        // 常用操作图标
        'update': 'icon-local:update',
        'message': 'icon-local:message',
        'i-lucide-x': 'icon-local:close'
      }
    },
    
    // 分页组件配置 - 使用最新的Nuxt UI API
    pagination: {
      default: {
        // 主题色
        color: 'primary',
        size: 'md',
        activeColor: 'primary',
        activeBorderColor: 'primary',
        activeTextColor: 'primary',
        inactiveColor: 'gray',
        rounded: 'rounded-full',
        // 插槽样式
        divide: true,
        divideClass: 'divide-gray-100 dark:divide-gray-800',
      },
      // 插槽样式
      slots: {
        label: 'min-w-8 text-center',
      }
    },
    popover: {
      default: {
        ui: {
          rounded: 'rounded-md',
          background: 'bg-white dark:bg-gray-900',
          shadow: 'shadow-lg',
          color: 'text-gray-900 dark:text-white',
          ring: 'ring-1 ring-gray-200 dark:ring-gray-800',
        }
      },
      slots: {
        content: 'w-80 mh-350',
        arrow: 'fill-default'
      }
    },
    modal: {
      slots: {
        overlay: 'fixed inset-0 bg-black/50 backdrop-blur-sm',
        content: '!w-[446px] max-w-[calc(100vw-32px)] !p-2 bg-white dark:bg-gray-900 flex flex-col focus:outline-none rounded-md shadow-lg',
        header: 'min-h-0 border-none',
        wrapper: '',
        body: 'flex-1 overflow-y-auto p-4 sm:p-6',
        footer: 'flex items-center gap-1.5 p-4 sm:px-6',
        title: 'text-lg font-semibold',
        description: 'mt-1 text-sm text-gray-500 dark:text-gray-400',
        close: 'absolute top-4 end-4'
      }
    },
    input: {
      slots: {
        root: 'w-full',
        base: 'h-10 placeholder:text-[var(--grey-4)]'
      }
    }
  }
}) 