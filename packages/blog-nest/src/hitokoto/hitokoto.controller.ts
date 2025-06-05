import { Controller, Get } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';
import { Public } from '../common/decorators/public.decorator';

interface HitokotoItem {
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

@Controller('hitokoto')
export class HitokotoController {
  private sentences: HitokotoItem[] = [];

  constructor() {
    try {
      const filePath = join(process.cwd(), 'public', 'sentences.json');
      const fileContent = readFileSync(filePath, 'utf8');
      this.sentences = JSON.parse(fileContent);
    } catch (error) {
      console.error('无法加载一言数据:', error);
      this.sentences = [];
    }
  }

  @Public()
  @Get()
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

  private getRandomItems<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }
}
