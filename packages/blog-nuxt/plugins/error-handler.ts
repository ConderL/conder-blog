import { defineNuxtPlugin } from '#app'

// 全局错误处理
export default defineNuxtPlugin((nuxtApp) => {
  // 添加全局错误处理
  nuxtApp.hook('vue:error', (err, instance, info) => {
    console.error('Vue错误捕获:', err)
    console.log('错误组件:', instance)
    console.log('错误信息:', info)
  })

  // 添加路由错误处理
  nuxtApp.hook('app:error', (err) => {
    console.error('Nuxt应用错误:', err)
  })
  
  // 添加页面转换错误处理
  nuxtApp.hook('page:transition:finish', () => {
    // 确保路由元数据存在
    const route = useRoute()
    if (!route.meta) {
      console.log('路由元数据不存在，正在创建...')
      route.meta = {}
    }
  })

  // 处理组件级错误
  nuxtApp.vueApp.config.errorHandler = (error, instance, info) => {
    console.error('Vue错误:', error);
    console.error('错误位置:', info);
  };

  // 处理未捕获的Promise错误
  if (import.meta.client) {
    window.addEventListener('unhandledrejection', (event) => {
      console.error('未捕获的Promise错误:', event.reason);
    });
  }

  // 注入错误处理方法
  return {
    provide: {
      handleError: (error: any) => {
        console.error('应用错误:', error);
      }
    }
  };
});
