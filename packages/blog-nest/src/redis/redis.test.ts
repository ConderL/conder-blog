import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { RedisService } from './redis.service';
import { RedisConstant } from '../common/constants/redis.constant';

/**
 * 手动测试Redis点赞功能
 *
 * 使用方式:
 * 1. 将此文件保存为 redis.test.ts
 * 2. 在终端执行: npx ts-node src/redis/redis.test.ts
 */
async function bootstrap() {
  // 创建NestJS应用实例
  const app = await NestFactory.create(AppModule);

  // 获取RedisService实例
  const redisService = app.get(RedisService);

  // 测试参数
  const userId = 1;
  const articleId = 1;

  try {
    console.log('====== 开始测试Redis点赞功能 ======');

    // 1. 获取用户点赞集合
    const key = `${RedisConstant.USER_ARTICLE_LIKE}${userId}`;
    const userLikes = await redisService.smembers(key);
    console.log(`用户 ${userId} 点赞列表:`, userLikes);

    // 2. 检查是否已点赞该文章
    const isLiked = await redisService.sismember(key, articleId.toString());
    console.log(`用户 ${userId} 是否已点赞文章 ${articleId}:`, isLiked ? '是' : '否');

    // 3. 获取文章当前点赞数
    const likeCount = await redisService.getHash(
      RedisConstant.ARTICLE_LIKE_COUNT,
      articleId.toString(),
    );
    console.log(`文章 ${articleId} 当前点赞数:`, likeCount);

    // 4. 测试点赞与取消点赞功能
    if (isLiked) {
      // 如果已点赞，测试取消点赞
      console.log('测试取消点赞...');

      // 移除用户点赞记录
      await redisService.srem(key, articleId.toString());
      console.log(`已从用户点赞集合中移除文章 ${articleId}`);

      // 减少文章点赞数
      if (likeCount > 0) {
        const newCount = await redisService.hincrby(
          RedisConstant.ARTICLE_LIKE_COUNT,
          articleId.toString(),
          -1,
        );
        console.log(`文章 ${articleId} 点赞数减少为:`, newCount);
      }
    } else {
      // 如果未点赞，测试点赞
      console.log('测试点赞...');

      // 添加用户点赞记录
      await redisService.sadd(key, articleId.toString());
      console.log(`已将文章 ${articleId} 添加到用户点赞集合`);

      // 增加文章点赞数
      const newCount = await redisService.hincrby(
        RedisConstant.ARTICLE_LIKE_COUNT,
        articleId.toString(),
        1,
      );
      console.log(`文章 ${articleId} 点赞数增加为:`, newCount);
    }

    // 5. 再次获取用户点赞集合和文章点赞数，验证操作结果
    const updatedUserLikes = await redisService.smembers(key);
    console.log(`操作后用户 ${userId} 点赞列表:`, updatedUserLikes);

    const updatedLikeCount = await redisService.getHash(
      RedisConstant.ARTICLE_LIKE_COUNT,
      articleId.toString(),
    );
    console.log(`操作后文章 ${articleId} 点赞数:`, updatedLikeCount);

    console.log('====== Redis点赞功能测试完成 ======');
  } catch (error) {
    console.error('测试出错:', error.message);
  } finally {
    // 关闭应用
    await app.close();
  }
}

// 执行测试
bootstrap();
