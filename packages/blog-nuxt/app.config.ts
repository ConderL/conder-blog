// https://nuxt.com/docs/guide/directory-structure/app-config
export default defineAppConfig({
  // 添加icon配置
  icon: {
    mode: 'svg', // 使用SVG模式而不是CSS模式
    class: 'icon', // 默认类名
    customize: (content) => {
      // 确保SVG使用currentColor
      return content.replace(/fill="([^"]*)"/, 'fill="currentColor"')
    }
  },
  ui: {
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
    },
    // 添加Toast组件配置
    toast: {
      // 默认配置
      default: {
        position: 'top-right',
        timeout: 3000,
        progress: true,
        closeButton: {
          icon: 'i-icon-close',
          size: 'sm'
        },
        shadow: 'shadow-lg',
        rounded: 'rounded-lg'
      },
      // 插槽样式
      slots: {
        root: 'relative group overflow-hidden bg-white dark:bg-gray-900 shadow-lg rounded-lg ring-1 ring-gray-200 dark:ring-gray-800 p-4 flex gap-2.5 focus:outline-none',
        wrapper: 'w-0 flex-1 flex flex-col',
        title: 'text-sm font-medium text-gray-900 dark:text-white',
        description: 'text-sm text-gray-500 dark:text-gray-400 mt-1',
        icon: 'shrink-0 size-5',
        avatar: 'shrink-0',
        avatarSize: '2xl',
        actions: 'flex gap-1.5 shrink-0',
        progress: 'absolute inset-x-0 bottom-0 h-1 z-10',
        close: 'p-0'
      },
      variants: {
        color: {
          primary: {
            root: 'focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary',
            icon: 'text-primary',
            progress: 'bg-primary'
          },
          secondary: {
            root: 'focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-secondary',
            icon: 'text-secondary',
            progress: 'bg-secondary'
          },
          success: {
            root: 'focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-success',
            icon: 'text-success',
            progress: 'bg-success'
          },
          info: {
            root: 'focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-info',
            icon: 'text-info',
            progress: 'bg-info'
          },
          warning: {
            root: 'focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-warning',
            icon: 'text-warning',
            progress: 'bg-warning'
          },
          error: {
            root: 'focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-error',
            icon: 'text-error',
            progress: 'bg-error'
          },
          neutral: {
            root: 'focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-inverted',
            icon: 'text-neutral-500 dark:text-neutral-400',
            progress: 'bg-neutral-500 dark:bg-neutral-400'
          }
        }
      }
    },
    // 设置Toaster组件配置
    toaster: {
      // 全局配置
      defaults: {
        position: 'top-right',
        duration: 3000,
        progress: true
      }
    }
  }
}) 