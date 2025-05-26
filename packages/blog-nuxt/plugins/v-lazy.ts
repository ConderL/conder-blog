import { defineNuxtPlugin } from '#app';

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('lazy', {
    mounted(el, binding) {
      // 创建一个IntersectionObserver实例
      const observer = new IntersectionObserver((entries) => {
        // 当元素进入视口时
        if (entries[0].isIntersecting) {
          // 设置src属性为绑定的值
          el.src = binding.value;
          // 图片加载完成后，取消观察
          el.addEventListener('load', () => {
            observer.unobserve(el);
          });
          // 图片加载失败时的处理
          el.addEventListener('error', () => {
            // 可以设置一个默认图片
            el.src = '/images/default-cover.jpg';
            observer.unobserve(el);
          });
        }
      });
      
      // 开始观察元素
      observer.observe(el);
    }
  });
}); 