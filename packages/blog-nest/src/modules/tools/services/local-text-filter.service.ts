import { Injectable, Logger } from '@nestjs/common';
import { sensitiveWords as defaultSensitiveWords } from '../sensitiveWords';

export interface FilterResult {
  isSafe: boolean;
  filteredText: string;
  reasons?: string[];
  originalText?: string;
}

/**
 * 本地文本过滤服务
 * 提供基于敏感词库的文本内容过滤功能
 */
@Injectable()
export class LocalTextFilterService {
  private readonly logger = new Logger(LocalTextFilterService.name);

  /**
   * 本地敏感词过滤
   * @param text 待过滤文本
   * @returns 过滤结果
   */
  public filter(text: string): FilterResult {
    // 如果文本为空，直接返回安全
    if (!text || text.trim() === '') {
      return {
        isSafe: true,
        filteredText: text,
      };
    }

    // 创建表情图片正则表达式
    const emojiImgRegex = /<img\s+[^>]*?src\s*=\s*(['"])[^>]*?img\.conder\.top\/emoji[^>]*?>/gi;

    // 将文本分割成普通文本和图片标签
    const segments: string[] = [];
    const imgTags: string[] = [];

    // 使用match方法获取所有匹配的图片标签
    const allImgTags = text.match(emojiImgRegex) || [];

    // 将所有匹配的图片标签保存到数组
    allImgTags.forEach((tag) => {
      imgTags.push(tag);
    });

    // 如果没有图片标签，直接处理整个文本
    if (imgTags.length === 0) {
      segments.push(text);
    } else {
      // 使用图片标签分割文本
      let remainingText = text;

      for (const imgTag of imgTags) {
        const imgIndex = remainingText.indexOf(imgTag);
        if (imgIndex > 0) {
          // 添加图片前的文本
          segments.push(remainingText.substring(0, imgIndex));
        }
        // 添加图片标签（作为特殊标记）
        segments.push(`__IMG_TAG_${imgTags.indexOf(imgTag)}__`);
        // 更新剩余文本
        remainingText = remainingText.substring(imgIndex + imgTag.length);
      }

      // 添加最后剩余的文本
      if (remainingText) {
        segments.push(remainingText);
      }
    }

    // 使用默认敏感词列表
    const sensitiveWords = defaultSensitiveWords;
    const foundWords = [];

    // 只过滤非图片标签的段落
    const filteredSegments = segments.map((segment) => {
      // 如果是图片标签占位符，直接返回
      if (segment.startsWith('__IMG_TAG_') && segment.endsWith('__')) {
        return segment;
      }

      // 对普通文本进行敏感词过滤
      let filteredSegment = segment;
      sensitiveWords.forEach((word) => {
        if (segment.includes(word)) {
          foundWords.push(word);
          // 替换为等长的星号
          const replacement = '*'.repeat(word.length);
          const regex = new RegExp(this.escapeRegExp(word), 'g');
          filteredSegment = filteredSegment.replace(regex, replacement);
        }
      });

      return filteredSegment;
    });

    // 恢复图片标签
    let filteredText = filteredSegments.join('');
    for (let i = 0; i < imgTags.length; i++) {
      filteredText = filteredText.replace(`__IMG_TAG_${i}__`, imgTags[i]);
    }

    const hasSensitiveContent = foundWords.length > 0;

    if (hasSensitiveContent) {
      this.logger.warn(`检测到敏感内容, 敏感词: ${foundWords.join(', ')}`);
    }

    return {
      // 即使含有敏感词，也不阻止消息发送，仅标记状态
      isSafe: !hasSensitiveContent,
      // 返回过滤后的文本
      filteredText,
      reasons: hasSensitiveContent ? ['存在敏感内容，已自动过滤'] : undefined,
      originalText: hasSensitiveContent ? text : undefined,
    };
  }

  /**
   * 转义正则表达式特殊字符
   */
  private escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
