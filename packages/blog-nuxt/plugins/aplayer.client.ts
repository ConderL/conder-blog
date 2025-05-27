// APlayer 客户端插件
import 'aplayer/dist/APlayer.min.css';

export default defineNuxtPlugin(() => {
  return {
    provide: {
      // 占位，实际APlayer会在组件中按需加载
    }
  };
}); 