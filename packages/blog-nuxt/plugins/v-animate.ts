export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('animate', {
    // 在服务端渲染时执行
    created(el, binding) {
      if (binding.value && Array.isArray(binding.value)) {
        // 在SSR环境下，仅添加类名，但不激活动画效果
        if (process.server) {
          el.classList = binding.value.join(' ');
        }
      }
    },
    // 在客户端挂载时执行
    mounted(el, binding) {
      if (binding.value && Array.isArray(binding.value)) {
        binding.value.forEach(className => {
          el.classList.add(className);
        });
      }
      
      // 设置可见性
      el.style.visibility = 'visible';
      
      // 添加动画效果
      el.style.animationDuration = '0.5s';
    }
  });
}); 