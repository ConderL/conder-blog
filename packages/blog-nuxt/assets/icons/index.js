// 此文件用于在客户端加载SVG图标
// 在Nuxt中，我们需要确保此代码仅在浏览器端执行

export default function() {
  // 仅在客户端执行
  if (typeof window === 'undefined') return;

  // 动态导入SVG图标
  const importAll = (r) => {
    r.keys().forEach(r);
  };

  try {
    // 通过Vite的import.meta.glob导入所有svg文件
    const icons = import.meta.glob('./svg/*.svg', { eager: true });
    
    // 加载所有图标
    Object.values(icons).forEach(module => {
      if (typeof module === 'object' && module.default) {
        const svgContent = module.default;
        // 将SVG添加到DOM
        document.body.insertAdjacentHTML('afterbegin', svgContent);
      }
    });
    
    // 移动SVG到body之外
    const symbolEl = document.querySelectorAll('body > svg');
    const svgDom = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgDom.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svgDom.setAttribute('id', 'svg-symbols');
    svgDom.style.position = 'absolute';
    svgDom.style.width = '0';
    svgDom.style.height = '0';
    
    symbolEl.forEach(item => {
      if (item.id !== 'svg-symbols') {
        if (item.childNodes[0]) {
          svgDom.appendChild(item.childNodes[0]);
        }
        item.remove();
      }
    });
    
    document.body.appendChild(svgDom);
  } catch (error) {
    console.error('加载SVG图标出错:', error);
  }
} 