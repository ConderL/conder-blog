import { useApi } from '../composables/useApi';
import { defineNuxtPlugin } from '#imports';

export default defineNuxtPlugin((nuxtApp) => {
  const api = useApi();

  // 将API添加到nuxtApp实例中
  return {
    provide: {
      api
    }
  };
}); 