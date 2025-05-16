import { defineNuxtPlugin } from '#app';
import SvgIcon from '~/components/SvgIcon/index.vue';
 
export default defineNuxtPlugin((nuxtApp) => {
  // 注册SvgIcon组件为全局组件
  nuxtApp.vueApp.component('svg-icon', SvgIcon);
}); 