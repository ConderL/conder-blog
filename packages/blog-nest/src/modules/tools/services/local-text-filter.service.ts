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

    const imgDomains = [
      'img\\.conder\\.top',
      'bbs\\.api\\.hoilai\\.com'
    ];
    
    // 创建正则表达式
    const emojiImgRegex = new RegExp(
      `<img\\s+[^>]*?src\\s*=\\s*(['"])[^>]*?(?:${imgDomains.join('|')})[^>]*?>`,
      'gi'
    );

    // 表情代码正则表达式
    const emojiCodeRegex = /\[([^\[\]]+?)\]/g;

    // 将文本分割成普通文本、图片标签和表情代码
    const segments: string[] = [];
    const imgTags: string[] = [];
    const emojiCodes: string[] = [];

    // 使用match方法获取所有匹配的图片标签
    const allImgTags = text.match(emojiImgRegex) || [];
    allImgTags.forEach((tag) => {
      imgTags.push(tag);
    });

    // 使用match方法获取所有匹配的表情代码
    const allEmojiCodes = text.match(emojiCodeRegex) || [];
    allEmojiCodes.forEach((code) => {
      emojiCodes.push(code);
    });

    // 如果没有图片标签和表情代码，直接处理整个文本
    if (imgTags.length === 0 && emojiCodes.length === 0) {
      segments.push(text);
    } else {
      // 使用图片标签和表情代码分割文本
      let remainingText = text;

      // 先处理图片标签
      for (const imgTag of imgTags) {
        const imgIndex = remainingText.indexOf(imgTag);
        if (imgIndex > 0) {
          segments.push(remainingText.substring(0, imgIndex));
        }
        segments.push(`__IMG_TAG_${imgTags.indexOf(imgTag)}__`);
        remainingText = remainingText.substring(imgIndex + imgTag.length);
      }

      // 再处理表情代码
      for (const emojiCode of emojiCodes) {
        const emojiIndex = remainingText.indexOf(emojiCode);
        if (emojiIndex > 0) {
          segments.push(remainingText.substring(0, emojiIndex));
        }
        segments.push(`__EMOJI_CODE_${emojiCodes.indexOf(emojiCode)}__`);
        remainingText = remainingText.substring(emojiIndex + emojiCode.length);
      }

      // 添加最后剩余的文本
      if (remainingText) {
        segments.push(remainingText);
      }
    }

    // 使用默认敏感词列表
    const sensitiveWords = defaultSensitiveWords;
    const foundWords = [];

    // 只过滤非图片标签和非表情代码的段落
    const filteredSegments = segments.map((segment) => {
      // 如果是图片标签或表情代码占位符，直接返回
      if ((segment.startsWith('__IMG_TAG_') || segment.startsWith('__EMOJI_CODE_')) && segment.endsWith('__')) {
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

    // 恢复图片标签和表情代码
    let filteredText = filteredSegments.join('');
    for (let i = 0; i < imgTags.length; i++) {
      filteredText = filteredText.replace(`__IMG_TAG_${i}__`, imgTags[i]);
    }
    for (let i = 0; i < emojiCodes.length; i++) {
      filteredText = filteredText.replace(`__EMOJI_CODE_${i}__`, emojiCodes[i]);
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
