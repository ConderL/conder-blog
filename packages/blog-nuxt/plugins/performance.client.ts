import PerformanceMonitor from '~/components/Performance/Monitor.vue';

export default defineNuxtPlugin((nuxtApp) => {
  // 注册性能监控组件
  nuxtApp.vueApp.component('PerformanceMonitor', PerformanceMonitor);
}); 