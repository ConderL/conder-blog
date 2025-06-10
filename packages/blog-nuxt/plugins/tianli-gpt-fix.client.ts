export default defineNuxtPlugin(() => {
  if (process.client) {
    // 监听路由变化
    const router = useRouter()
    
    // 在路由变化后重新初始化tianliGPT
    router.afterEach((to, from) => {
      // 从非文章页到文章页，或者从一篇文章到另一篇文章
      if (to.path.includes('/article/') && 
         ((!from.path.includes('/article/')) || 
          (from.path.includes('/article/') && from.path !== to.path))) {
        
        // 标记为需要重新生成
        window.__TIANLI_FIRST_REMOVE_DONE__ = true
        
        // 延迟执行，确保DOM已更新
        setTimeout(() => {
          if (window.tianliGPT && typeof window.tianliGPT.checkURLAndRun === 'function') {
            // 重置运行状态
            window.tianliGPTIsRunning = false
            // 重新运行
            window.tianliGPT.checkURLAndRun()
          }
        }, 500)
      }
    })
  }
}) 