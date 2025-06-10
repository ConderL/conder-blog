export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('render:html', (html, { event }) => {
    const tianliGptScripts = `
      <link rel="stylesheet" href="https://ai.zhheo.com/static/public/tianli_gpt.min.css">
      <script>
        // 设置全局标记，表示这是SSR渲染的页面
        window.__TIANLI_SSR__ = true;
        
        window.tianliGPT_postSelector = '#preview-only-preview';
        window.tianliGPT_postURL = "*/article/*";
        window.tianliGPT_Title = 'Conder 文章摘要';
        window.tianliGPT_key = 'S-CIOJ6OWF1BJGVNJK';
        
        // 添加延迟初始化逻辑
        window.addEventListener('load', function() {
          // 确保DOM完全加载后再初始化
          setTimeout(function() {
            if (window.tianliGPT && typeof window.tianliGPT.checkURLAndRun === 'function') {
              window.tianliGPT.checkURLAndRun();
            }
          }, 500);
        });
      </script>
      <script src="https://ai.zhheo.com/static/public/tianli_gpt.min.js" defer></script>
      <script>
        // 覆盖原始的removeExistingAIDiv方法，避免闪烁
        if (window.__TIANLI_SSR__) {
          document.addEventListener('DOMContentLoaded', function() {
            if (window.tianliGPT) {
              // 保存原始方法
              const originalRemove = window.tianliGPT.removeExistingAIDiv;
              
              // 覆盖方法
              window.tianliGPT.removeExistingAIDiv = function() {
                // 在文章页面，第一次加载时不移除已有的DIV
                if (window.location.href.includes('/article/') && !window.__TIANLI_FIRST_REMOVE_DONE__) {
                  window.__TIANLI_FIRST_REMOVE_DONE__ = true;
                  console.log('洪墨摘要AI：跳过首次移除，避免闪烁');
                  return;
                }
                // 其他情况使用原始方法
                originalRemove.call(window.tianliGPT);
              };
            }
          });
        }
      </script>
    `
    
    // 在 </body> 标签前插入
    html.bodyAppend = html.bodyAppend || []
    html.bodyAppend.push(tianliGptScripts)
  })
}) 