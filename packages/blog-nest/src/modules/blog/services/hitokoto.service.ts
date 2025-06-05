import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';
import sentences from '../sentences';
export interface HitokotoItem {
  id: number;
  uuid: string;
  hitokoto: string;
  type: string;
  from: string;
  from_who: string | null;
  creator: string;
  creator_uid: number;
  reviewer: number;
  commit_from: string;
  created_at: string;
  length: number;
}

@Injectable()
export class HitokotoService {
  private sentences: HitokotoItem[] = sentences;
  /**
   * 获取随机一言数据
   * @returns 随机10条一言数据
   */
  getRandomHitokoto() {
    if (this.sentences.length === 0) {
      return { code: 500, message: '无法获取一言数据' };
    }

    // 随机选择10条数据
    const randomSentences = this.getRandomItems(this.sentences, 10);

    return {
      code: 200,
      data: randomSentences,
    };
  }

  /**
   * 从数组中随机获取指定数量的元素
   * @param array 源数组
   * @param count 需要获取的元素数量
   * @returns 随机选取的元素数组
   */
  private getRandomItems<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }
}
