// 这个插件用于全局注册组件或添加全局功能
// Nuxt会自动导入defineNuxtPlugin，不需要显式导入

// @ts-ignore - Nuxt自动导入
export default defineNuxtPlugin((nuxtApp) => {
  // 这里可以注册全局组件或添加全局功能
  // 例如：
  // nuxtApp.vueApp.component('MyGlobalComponent', MyGlobalComponent)
  
  // 也可以添加全局属性
  // nuxtApp.vueApp.config.globalProperties.$myGlobalMethod = () => {}
  
  // 或者添加全局指令
  // nuxtApp.vueApp.directive('my-directive', {
  //   mounted(el, binding) {
  //     // 指令逻辑
  //   }
  // })
  
  return {
    provide: {
      // 这里可以提供一些全局可用的方法
      formatDate: (date: string) => {
        return new Date(date).toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
    }
  };
}); 