/**
 * 敏感词过滤工具
 * 基于DFA算法(确定有限自动机)实现
 */
export class SensitiveWordFilter {
  // 敏感词字典树
  private static wordTreeMap: Map<string, any> = new Map();

  // 敏感词替换字符
  private static readonly REPLACE_CHAR = '*';

  // 是否已初始化
  private static isInitialized = false;

  // 默认敏感词列表 (可以从外部加载更完整的词库)
  private static readonly DEFAULT_WORDS = [
    // 政治相关
    '政府',
    '国家机密',
    '颠覆',
    '暴乱',
    '造反',
    // 暴力相关
    '自杀',
    '杀人',
    '枪支',
    '炸弹',
    // 色情相关
    '色情',
    '赌博',
    '吸毒',
    // 网络欺诈相关
    '诈骗',
    '黑客',
    '钓鱼',
    // 侮辱性词汇
    '傻子',
    '白痴',
    '混蛋',
  ];

  /**
   * 初始化敏感词库
   * @param words 敏感词列表，不传则使用默认词库
   */
  public static init(words?: string[]): void {
    const wordList = words || this.DEFAULT_WORDS;
    this.wordTreeMap.clear();

    // 构建字典树
    for (const word of wordList) {
      if (!word || word.trim() === '') continue;

      let currentMap = this.wordTreeMap;
      for (let i = 0; i < word.length; i++) {
        const char = word.charAt(i);
        let wordMap = currentMap.get(char);

        if (!wordMap) {
          wordMap = new Map();
          currentMap.set(char, wordMap);
        }

        currentMap = wordMap;

        // 设置结束标记
        if (i === word.length - 1) {
          currentMap.set('isEnd', true);
        }
      }
    }

    this.isInitialized = true;
  }

  /**
   * 检查是否包含敏感词
   * @param text 要检查的文本
   * @returns 是否包含敏感词
   */
  public static hasSensitiveWord(text: string): boolean {
    if (!this.isInitialized) {
      this.init();
    }

    if (!text) return false;

    for (let i = 0; i < text.length; i++) {
      // 检查从i开始的字符串是否包含敏感词
      const length = this.checkSensitiveWord(text, i);
      if (length > 0) {
        return true;
      }
    }

    return false;
  }

  /**
   * 获取文本中的所有敏感词
   * @param text 要检查的文本
   * @returns 敏感词列表
   */
  public static getSensitiveWords(text: string): string[] {
    if (!this.isInitialized) {
      this.init();
    }

    const result: string[] = [];
    if (!text) return result;

    for (let i = 0; i < text.length; i++) {
      const length = this.checkSensitiveWord(text, i);
      if (length > 0) {
        const word = text.substring(i, i + length);
        // 避免重复添加
        if (!result.includes(word)) {
          result.push(word);
        }
        // 跳过已检测的敏感词
        i += length - 1;
      }
    }

    return result;
  }

  /**
   * 过滤敏感词
   * @param text 要过滤的文本
   * @param replaceChar 替换字符，默认为*
   * @returns 过滤后的文本
   */
  public static filter(text: string, replaceChar?: string): string {
    if (!this.isInitialized) {
      this.init();
    }

    if (!text) return '';

    const replace = replaceChar || this.REPLACE_CHAR;
    let result = text;

    // 获取所有敏感词
    const sensitiveWords = this.getSensitiveWords(text);

    // 替换所有敏感词
    for (const word of sensitiveWords) {
      const replaceStr = replace.repeat(word.length);
      // 使用正则表达式全局替换
      const regex = new RegExp(word, 'g');
      result = result.replace(regex, replaceStr);
    }

    return result;
  }

  /**
   * 检查从指定位置开始是否包含敏感词
   * @param text 要检查的文本
   * @param beginIndex 开始位置
   * @returns 敏感词长度，0表示不包含
   */
  private static checkSensitiveWord(text: string, beginIndex: number): number {
    let currentMap = this.wordTreeMap;
    let wordLength = 0;
    let tempLength = 0;

    for (let i = beginIndex; i < text.length; i++) {
      const char = text.charAt(i);
      const wordMap = currentMap.get(char);

      if (wordMap) {
        currentMap = wordMap;
        tempLength++;

        // 找到完整敏感词
        if (wordMap.get('isEnd')) {
          wordLength = tempLength;
        }
      } else {
        break;
      }
    }

    return wordLength;
  }

  /**
   * 添加敏感词
   * @param word 要添加的敏感词
   */
  public static addWord(word: string): void {
    if (!this.isInitialized) {
      this.init();
    }

    if (!word || word.trim() === '') return;

    let currentMap = this.wordTreeMap;
    for (let i = 0; i < word.length; i++) {
      const char = word.charAt(i);
      let wordMap = currentMap.get(char);

      if (!wordMap) {
        wordMap = new Map();
        currentMap.set(char, wordMap);
      }

      currentMap = wordMap;

      if (i === word.length - 1) {
        currentMap.set('isEnd', true);
      }
    }
  }

  /**
   * 添加多个敏感词
   * @param words 要添加的敏感词列表
   */
  public static addWords(words: string[]): void {
    if (!words || words.length === 0) return;

    for (const word of words) {
      this.addWord(word);
    }
  }
}
