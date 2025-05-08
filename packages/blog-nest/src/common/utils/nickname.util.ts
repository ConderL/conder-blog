/**
 * 随机昵称生成器
 */
export class NicknameGenerator {
  // 姓氏列表
  private static readonly FIRST_NAMES = [
    '快乐',
    '可爱',
    '聪明',
    '调皮',
    '文静',
    '高雅',
    '活泼',
    '开朗',
    '机智',
    '善良',
    '幽默',
    '温柔',
    '热情',
    '勇敢',
    '稳重',
    '帅气',
    '靓丽',
    '认真',
    '好奇',
    '可靠',
    '真诚',
    '优雅',
    '睿智',
    '友善',
  ];

  // 动物名
  private static readonly ANIMAL_NAMES = [
    '熊猫',
    '老虎',
    '狮子',
    '猴子',
    '兔子',
    '海豚',
    '鹿',
    '狐狸',
    '猫咪',
    '小狗',
    '鹦鹉',
    '蝴蝶',
    '大象',
    '长颈鹿',
    '浣熊',
    '考拉',
    '羊驼',
    '斑马',
    '松鼠',
    '雪豹',
    '飞鼠',
    '蜻蜓',
    '刺猬',
    '河马',
  ];

  // IP映射表，用于存储IP与昵称的关系，确保使用静态变量保持状态
  private static readonly IP_NICKNAME_MAP = new Map<string, string>();

  /**
   * 获取指定IP对应的昵称，如果不存在则生成一个
   * @param ip IP地址
   * @returns 随机生成的昵称
   */
  public static getNickname(ip: string): string {
    // 确保IP不为空
    if (!ip || ip.trim() === '') {
      ip = '127.0.0.1'; // 使用本地IP作为默认值
    }

    // 检查是否已经为这个IP生成过昵称
    if (this.IP_NICKNAME_MAP.has(ip)) {
      const nickname = this.IP_NICKNAME_MAP.get(ip);
      console.log(`使用已缓存的昵称: ${ip} -> ${nickname}`);
      return nickname;
    }

    // 生成新昵称
    const nickname = this.generateNickname();
    console.log(`生成新昵称: ${ip} -> ${nickname}`);

    // 存储IP与昵称的映射关系
    this.IP_NICKNAME_MAP.set(ip, nickname);

    return nickname;
  }

  /**
   * 生成随机昵称
   * @returns 随机昵称
   */
  private static generateNickname(): string {
    const firstName = this.FIRST_NAMES[Math.floor(Math.random() * this.FIRST_NAMES.length)];
    const animalName = this.ANIMAL_NAMES[Math.floor(Math.random() * this.ANIMAL_NAMES.length)];
    const number = Math.floor(Math.random() * 1000);

    return `${firstName}${animalName}${number}`;
  }

  /**
   * 清除指定IP的昵称缓存
   * @param ip IP地址
   */
  public static clearNickname(ip: string): void {
    this.IP_NICKNAME_MAP.delete(ip);
    console.log(`已清除IP昵称缓存: ${ip}`);
  }

  /**
   * 获取当前缓存的IP-昵称映射数量
   */
  public static getCacheSize(): number {
    return this.IP_NICKNAME_MAP.size;
  }

  /**
   * 获取所有已缓存的IP-昵称映射
   */
  public static getAllNicknames(): Map<string, string> {
    return new Map(this.IP_NICKNAME_MAP);
  }
}
