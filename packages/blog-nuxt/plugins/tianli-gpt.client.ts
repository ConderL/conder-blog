// tianli-gpt.client.ts - 仅在客户端加载的插件
export default defineNuxtPlugin(() => {
  // 仅在客户端环境下执行
  if (process.client) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://ai.tianli0.top/static/public/tianli_gpt.min.css';
    document.head.appendChild(link);

    // 创建脚本元素
    const script = document.createElement('script');
    script.src = 'https://ai.tianli0.top/static/public/tianli_gpt.min.js';
    script.async = true;
    
    // 添加脚本到文档头部
    document.head.appendChild(script);
    
    // 脚本加载完成后配置参数
    script.onload = () => {
      // 设置全局变量
      window.tianliGPT_postSelector = '#preview-only-preview';
      window.tianliGPT_postURL = "*/article/*";
      window.tianliGPT_Title = 'Conder 文章摘要';
      window.tianliGPT_key = 'S-CIOJ6OWF1BJGVNJK';
      
      console.log('TianliGPT 脚本已加载');
    };
  }
});

// 为 TypeScript 声明全局变量
declare global {
  interface Window {
    tianliGPT_postSelector: string;
    tianliGPT_postURL: string;
    tianliGPT_Title: string;
    tianliGPT_key: string;
  }
} 