// 先创建一个简化版本的表情处理器
// 后续可以导入实际的表情列表

import { emojiList } from './emoji';
import { emojiGenshinList } from './emojiGenshin';
import { emojiMygoList } from './emojiMygo';

/**
 * 处理文本中的表情代码，将其转换为HTML图片标签
 * @param content 包含表情代码的原始文本
 * @param emojiType 表情类型：0-普通表情，1-原神表情，2-Mygo表情
 * @returns 处理后的HTML内容
 */
export function processEmoji(content: string, emojiType: number = 0): string {
  if (!content) return '';
  
  try {
    // 创建临时字符串保存处理结果
    const processedContent = content;
    
    // 创建正则表达式寻找所有表情标记 [xxx]
    const emojiPattern = /\[([^\[\]]+?)\]/g;
    
    // 查找所有匹配项
    const matches = [...processedContent.matchAll(emojiPattern)];
    
    // 从后向前替换，避免替换过程中改变索引位置
    for (let i = matches.length - 1; i >= 0; i--) {
      const match = matches[i];
      const fullMatch = match[0]; // 完整匹配，例如 [doge]
      const startIndex = match.index || 0;
      const endIndex = startIndex + fullMatch.length;
      
      // 根据表情类型选择不同的表情集
      const currentEmojiList = [emojiList, emojiGenshinList, emojiMygoList][emojiType];
      
      // 如果表情存在于表情集中，则保留原始表情代码
      if (currentEmojiList[fullMatch]) {
        // 直接保留原始表情代码，不转换为HTML
        continue;
      }
    }
    
    return processedContent;
  } catch (error) {
    console.error("处理表情时出错:", error);
    // 出错时返回原始内容
    return content;
  }
}

/**
 * 清理可能包含未处理表情和HTML标签混合的内容
 * @param content 可能混合了表情代码和HTML的内容
 * @returns 规范化处理后的内容
 */
export function cleanupContent(content: string): string {
  if (!content) return '';
  
  try {
    // 创建临时字符串保存处理结果
    let processedContent = content;
    
    // 创建正则表达式寻找所有表情标记 [xxx]
    const emojiPattern = /\[([^\[\]]+?)\]/g;
    
    // 查找所有匹配项
    const matches = [...processedContent.matchAll(emojiPattern)];
    
    // 从后向前替换，避免替换过程中改变索引位置
    for (let i = matches.length - 1; i >= 0; i--) {
      const match = matches[i];
      const fullMatch = match[0]; // 完整匹配，例如 [doge]
      const startIndex = match.index || 0;
      const endIndex = startIndex + fullMatch.length;
      
      // 尝试所有表情集
      for (let emojiType = 0; emojiType < 3; emojiType++) {
        const currentEmojiList = [emojiList, emojiGenshinList, emojiMygoList][emojiType];
        
        if (currentEmojiList[fullMatch]) {
          const imgSize = emojiType === 0 ? 21 : 60;
          const imgHtml = `<img src="${currentEmojiList[fullMatch]}" width="${imgSize}" height="${imgSize}" style="margin: 0 1px;vertical-align: text-bottom"/>`;
          
          // 替换原字符串中的表情标记
          processedContent = 
            processedContent.substring(0, startIndex) + 
            imgHtml + 
            processedContent.substring(endIndex);
          break;
        }
      }
    }
    
    return processedContent;
  } catch (error) {
    console.error("清理内容时出错:", error);
    return content;
  }
} 