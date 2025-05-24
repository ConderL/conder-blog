// SVG加载插件，仅在客户端执行
// 这个插件注册一个$loadSvg辅助方法用于加载SVG

export default defineNuxtPlugin((nuxtApp) => {
  // SVG缓存，避免重复加载
  const svgCache = new Map();
  
  // 加载SVG内容
  const loadSvg = async (name: string): Promise<string | null> => {
    // 如果缓存中存在，直接返回
    if (svgCache.has(name)) {
      return svgCache.get(name);
    }
    
    try {
      // 尝试动态导入SVG
      const module = await import(`~/assets/icons/${name}.svg?raw`);
      const svg = module.default || '';
      
      // 缓存SVG内容
      svgCache.set(name, svg);
      return svg;
    } catch (error) {
      console.error(`Failed to load SVG: ${name}`, error);
      return null;
    }
  };
  
  // 提供辅助方法
  return {
    provide: {
      // 加载SVG
      loadSvg,
      
      // 获取标准化图标名
      normalizeSvgName: (name: string): string => {
        // 移除前缀
        if (name.startsWith('icon-')) {
          return name.substring(5);
        }
        return name;
      }
    }
  };
}); 