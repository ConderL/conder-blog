// 此文件用于在客户端加载SVG图标
// 在Nuxt中，我们需要确保此代码仅在浏览器端执行

export default function() {
  // 仅在客户端执行
  if (typeof window === 'undefined') return;

  try {
    // 创建SVG容器
    const svgSymbols = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgSymbols.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svgSymbols.setAttribute('style', 'position: absolute; width: 0; height: 0;');
    svgSymbols.setAttribute('id', 'svg-symbols');
    document.body.appendChild(svgSymbols);
    
    // 加载公共图标 - 使用新的glob选项格式
    const iconModules = import.meta.glob('./svg/*.svg', { eager: true, query: '?raw', import: 'default' });
    
    // 处理每个SVG文件
    Object.entries(iconModules).forEach(([path, svgContent]) => {
      try {
        const iconName = path.split('/').pop().replace('.svg', '');
        
        // 创建临时DOM元素解析SVG
        const div = document.createElement('div');
        div.innerHTML = svgContent;
        const svg = div.querySelector('svg');
        
        if (svg) {
          // 提取SVG的viewBox和内部元素
          const viewBox = svg.getAttribute('viewBox') || '0 0 1024 1024';
          const svgChildren = svg.innerHTML;
          
          // 创建symbol元素
          const symbol = document.createElementNS('http://www.w3.org/2000/svg', 'symbol');
          symbol.setAttribute('id', `icon-${iconName}`);
          symbol.setAttribute('viewBox', viewBox);
          symbol.innerHTML = svgChildren;
          
          // 将symbol添加到SVG容器
          svgSymbols.appendChild(symbol);
        }
      } catch (error) {
        console.error(`加载图标 ${path} 出错:`, error);
      }
    });
    
    // 尝试加载本地图标（如果有的话）- 使用新的glob选项格式
    try {
      const localIconModules = import.meta.glob('../../../public/icons/svg/*.svg', { eager: true, query: '?raw', import: 'default' });
      
      Object.entries(localIconModules).forEach(([path, svgContent]) => {
        try {
          const iconName = path.split('/').pop().replace('.svg', '');
          
          // 创建临时DOM元素解析SVG
          const div = document.createElement('div');
          div.innerHTML = svgContent;
          const svg = div.querySelector('svg');
          
          if (svg) {
            // 提取SVG的viewBox和内部元素
            const viewBox = svg.getAttribute('viewBox') || '0 0 1024 1024';
            const svgChildren = svg.innerHTML;
            
            // 创建symbol元素，使用icon-local前缀区分
            const symbol = document.createElementNS('http://www.w3.org/2000/svg', 'symbol');
            symbol.setAttribute('id', `icon-local-${iconName}`);
            symbol.setAttribute('viewBox', viewBox);
            symbol.innerHTML = svgChildren;
            
            // 将symbol添加到SVG容器
            svgSymbols.appendChild(symbol);
        }
        } catch (error) {
          console.error(`加载本地图标 ${path} 出错:`, error);
      }
    });
    } catch (error) {
      console.warn('没有找到本地图标或加载失败:', error);
    }
    
    console.log('SVG图标加载完成');
  } catch (error) {
    console.error('加载SVG图标出错:', error);
  }
} 