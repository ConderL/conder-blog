/**
 * Toast通知插件 - 基于Nuxt UI的Toast组件
 */
export default defineNuxtPlugin(() => {
  const toast = {
    /**
     * 显示成功提示
     */
    success(message: string) {
      const { $ui } = useNuxtApp();
      $ui?.toast.add({
        title: message,
        color: 'green',
        icon: 'i-svg-check-circle'
      });
    },
    
    /**
     * 显示错误提示
     */
    error(message: string) {
      const { $ui } = useNuxtApp();
      $ui?.toast.add({
        title: message,
        color: 'red',
        icon: 'i-svg-x-circle'
      });
    },
    
    /**
     * 显示警告提示
     */
    warning(message: string) {
      const { $ui } = useNuxtApp();
      $ui?.toast.add({
        title: message,
        color: 'yellow',
        icon: 'i-svg-exclamation-triangle'
      });
    },
    
    /**
     * 显示普通信息提示
     */
    info(message: string) {
      const { $ui } = useNuxtApp();
      $ui?.toast.add({
        title: message,
        color: 'blue',
        icon: 'i-svg-information-circle'
      });
    }
  };
  
  return {
    provide: {
      toast
    }
  };
}); 