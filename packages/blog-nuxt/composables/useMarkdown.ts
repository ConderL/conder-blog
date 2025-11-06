/**
 * Markdown 处理 Composable
 * 使用 markdown-it 渲染 Markdown 内容
 */

import MarkdownIt from 'markdown-it';

// 创建 markdown-it 实例（单例模式）
let mdInstance: MarkdownIt | null = null;

const createMarkdownInstance = () => {
  if (mdInstance) {
    return mdInstance;
  }

  // 创建 markdown-it 实例
  mdInstance = new MarkdownIt({
    html: true, // 允许 HTML 标签
    breaks: true, // 转换换行为 <br>
    linkify: true, // 自动转换 URL 为链接
    typographer: true, // 启用一些语言中性的替换 + 引号美化
  });

  // 如果有 prismjs，可以添加代码高亮支持
  // 注意：需要在客户端环境中使用，prismjs 需要在浏览器中运行
  if (process.client) {
    // 可以在这里添加代码高亮插件
    // 例如：markdown-it-prism 或类似的插件
  }

  return mdInstance;
};

export const useMarkdown = () => {
  const render = (content: string): string => {
    if (!content) return '';
    
    const md = createMarkdownInstance();
    return md.render(content);
  };

  const renderInline = (content: string): string => {
    if (!content) return '';
    
    const md = createMarkdownInstance();
    return md.renderInline(content);
  };

  return {
    render,
    renderInline,
  };
};

