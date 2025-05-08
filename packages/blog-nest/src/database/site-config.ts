import { SiteConfig } from '../modules/blog/entities/site-config.entity';
import { Repository } from 'typeorm';
import { Logger } from '@nestjs/common';

/**
 * 初始化网站配置数据
 */
export async function initSiteConfig(siteConfigRepository: Repository<SiteConfig>): Promise<void> {
  const logger = new Logger('SiteConfigInit');

  try {
    // 检查站点配置表是否为空
    const count = await siteConfigRepository.count();
    if (count > 0) {
      logger.log('站点配置数据已存在，无需初始化');
      return;
    }

    logger.log('开始初始化站点配置数据...');

    // 默认站点配置
    const siteConfig = siteConfigRepository.create({
      id: 1,
      userAvatar: 'http://img.conder.top/config/avatar.jpg',
      touristAvatar: 'http://img.conder.top/config/default_avatar.jpg',
      siteName: "Conder's blog",
      siteAddress: 'https://www.conder.top',
      siteIntro: '每天进步一点点。',
      siteNotice:
        '小站新开，有点小bug很正常，欢迎大家来多多测试。\n后端基于NestJs开发，前端基于Vue3 Ts Navie UI开发',
      createSiteTime: '2025-5-20',
      recordNumber: '豫ICP备2024068028号',
      authorAvatar: 'http://img.conder.top/config/avatar.jpg',
      siteAuthor: '@ConderL',
      articleCover: 'http://img.conder.top/config/default_cover.png',
      aboutMe: '\uD83C\uDF40个人简介\n\n全栈开发工程师\n\n喜欢捣鼓一些新奇的东西',
      github: 'https://github.com/ConderL',
      bilibili: 'https://space.bilibili.com/180248324',
      qq: '912277676',
      commentCheck: 1,
      messageCheck: 1,
      isReward: true,
      baiduCheck: 0,
      weiXinCode: '',
      aliCode: '',
      emailNotice: true,
      socialList: 'github,qq,bilibili',
      loginList: '',
      isMusic: true,
      musicId: '13616943965',
      isChat: true,
      websocketUrl: 'ws://localhost:3300/chat',
      archiveWallpaper: '',
      categoryWallpaper: '',
      tagWallpaper: '',
      talkWallpaper: '',
      albumWallpaper: '',
      friendWallpaper: '',
      messageWallpaper: '',
      aboutWallpaper: '',
      createTime: new Date(),
      updateTime: new Date(),
    });

    // 保存站点配置
    await siteConfigRepository.save(siteConfig);

    logger.log('成功初始化站点配置数据');
  } catch (error) {
    logger.error('初始化站点配置数据失败: ' + error.message);
    logger.error('错误堆栈:', error.stack);
    throw error;
  }
}
