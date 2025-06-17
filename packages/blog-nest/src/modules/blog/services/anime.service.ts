import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Anime } from '../entities/anime.entity';
import { CreateAnimeDto, QueryAnimeDto, UpdateAnimeDto } from '../dto/anime.dto';
import axios from 'axios';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import { UploadService } from '../../upload/services/upload/upload.service';

@Injectable()
export class AnimeService {
  private readonly logger = new Logger(AnimeService.name);

  constructor(
    @InjectRepository(Anime)
    private readonly animeRepository: Repository<Anime>,
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly uploadService: UploadService,
  ) {}

  /**
   * 创建番剧
   * @param createAnimeDto 创建番剧DTO
   * @returns 创建的番剧
   */
  async create(createAnimeDto: CreateAnimeDto): Promise<Anime> {
    // 设置默认的番剧状态，将在获取信息时被更新
    if (!createAnimeDto.animeStatus) {
      createAnimeDto.animeStatus = 1; // 默认为连载中，将通过API更新
      this.logger.log(`设置默认番剧状态: animeStatus=1`);
    }
    
    // 创建番剧对象
    const anime = this.animeRepository.create(createAnimeDto);
    
    // 为爱奇艺和优酷平台设置lastUpdateTime，因为它们不会通过API更新
    if (anime.platform === 3 || anime.platform === 4) {
      anime.lastUpdateTime = new Date();
      this.logger.log(`为平台${anime.platform}设置lastUpdateTime: ${anime.lastUpdateTime}`);
    }
    
    const savedAnime = await this.animeRepository.save(anime);
    this.logger.log(`创建番剧: ID=${savedAnime.id}, 名称=${savedAnime.animeName}, 初始状态=${savedAnime.animeStatus}`);
    
    // 创建后立即获取番剧信息
    this.logger.log(`创建番剧后获取信息: ID=${savedAnime.id}`);
    await this.fetchAnimeInfo(savedAnime.id, createAnimeDto);
    
    // 重新获取更新后的番剧信息
    const finalAnime = await this.findOne(savedAnime.id);
    this.logger.log(`创建番剧完成: ID=${finalAnime.id}, 名称=${finalAnime.animeName}, 最终状态=${finalAnime.animeStatus}`);
    
    return finalAnime;
  }

  /**
   * 获取番剧列表
   * @param queryAnimeDto 查询条件
   * @returns 番剧列表和总数
   */
  async findAll(queryAnimeDto: QueryAnimeDto): Promise<{ list: Anime[]; total: number }> {
    const { page = 1, limit = 10, animeName, platform, animeStatus, watchStatus, sortBy = 'rating', area } = queryAnimeDto;
    
    const queryBuilder = this.animeRepository.createQueryBuilder('anime');
    
    if (animeName) {
      queryBuilder.andWhere('anime.animeName LIKE :animeName', { animeName: `%${animeName}%` });
    }
    
    if (platform) {
      queryBuilder.andWhere('anime.platform = :platform', { platform });
    }
    
    if (animeStatus) {
      queryBuilder.andWhere('anime.animeStatus = :animeStatus', { animeStatus });
    }
    
    if (watchStatus) {
      queryBuilder.andWhere('anime.watchStatus = :watchStatus', { watchStatus });
    }
    
    if (area) {
      queryBuilder.andWhere('JSON_UNQUOTE(JSON_EXTRACT(anime.area, "$.id")) = :areaId', { areaId: area });
    }
    
    const total = await queryBuilder.getCount();
    
    // 根据sortBy字段进行排序
    if (sortBy === 'rating') {
      // 按评分排序，评分为空的排在后面
      queryBuilder
        .orderBy('anime.rating IS NULL', 'ASC')
        .addOrderBy('anime.rating', 'DESC');
    } else if (sortBy === 'publishTime') {
      // 按发布时间排序，发布时间为空的排在后面
      queryBuilder
        .orderBy('anime.publishTime IS NULL', 'ASC')
        .addOrderBy('anime.publishTime', 'DESC');
    }
    
    // 最后都按更新时间和创建时间排序
    queryBuilder
      .addOrderBy('anime.lastUpdateTime IS NULL', 'ASC')
      .addOrderBy('anime.lastUpdateTime', 'DESC')
      .addOrderBy('anime.createTime', 'DESC');
    
    const list = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();
    
    return { list, total };
  }

  /**
   * 根据ID获取番剧
   * @param id 番剧ID
   * @returns 番剧信息
   */
  async findOne(id: number): Promise<Anime> {
    const anime = await this.animeRepository.findOne({ where: { id } });
    if (!anime) {
      throw new HttpException(`ID为${id}的番剧不存在`, HttpStatus.NOT_FOUND);
    }
    return anime;
  }

  /**
   * 更新番剧
   * @param id 番剧ID
   * @param updateAnimeDto 更新番剧DTO
   * @returns 更新后的番剧
   */
  async update(id: number, updateAnimeDto: UpdateAnimeDto): Promise<Anime> {
    const anime = await this.findOne(id);
    
    // 记录原始值用于日志和判断是否需要刷新信息
    const originalAnimeId = anime.animeId;
    const originalPlatform = anime.platform;
    const originalCover = anime.cover;
    
    // 逐个更新字段，而不是使用 Object.assign
    anime.animeName = updateAnimeDto.animeName;
    anime.platform = updateAnimeDto.platform;
    anime.animeId = updateAnimeDto.animeId;
    anime.watchStatus = updateAnimeDto.watchStatus;
    
    // 如果提供了新封面，则使用新封面
    if (updateAnimeDto.cover) {
      this.logger.log(`更新番剧封面: 从 ${anime.cover} 到 ${updateAnimeDto.cover}`);
      anime.cover = updateAnimeDto.cover;
    }
    
    // 处理额外的自定义字段
    if ('rating' in updateAnimeDto) {
      anime.rating = updateAnimeDto.rating;
      this.logger.log(`更新番剧评分: ${anime.rating}`);
    }
    
    if ('totalEpisodes' in updateAnimeDto) {
      anime.totalEpisodes = updateAnimeDto.totalEpisodes;
      this.logger.log(`更新番剧总集数: ${anime.totalEpisodes}`);
    }
    
    if ('animeStatus' in updateAnimeDto) {
      anime.animeStatus = updateAnimeDto.animeStatus;
    }
    
    if ('description' in updateAnimeDto) {
      anime.description = updateAnimeDto.description;
    }
    
    if ('actors' in updateAnimeDto) {
      anime.actors = updateAnimeDto.actors;
    }
    
    if ('areas' in updateAnimeDto) {
      anime.areas = updateAnimeDto.areas;
    }
    
    if ('area' in updateAnimeDto) {
      anime.area = updateAnimeDto.area;
    }
    
    if ('publishTime' in updateAnimeDto) {
      anime.publishTime = updateAnimeDto.publishTime;
    }
    
    if ('styles' in updateAnimeDto) {
      anime.styles = updateAnimeDto.styles;
    }
    
    if ('link' in updateAnimeDto) {
      anime.link = updateAnimeDto.link;
    }
    
    // 为爱奇艺和优酷平台更新lastUpdateTime
    if (anime.platform === 3 || anime.platform === 4) {
      anime.lastUpdateTime = new Date();
      this.logger.log(`为平台${anime.platform}更新lastUpdateTime: ${anime.lastUpdateTime}`);
    }
    
    // 保存更新后的番剧信息
    const updatedAnime = await this.animeRepository.save(anime);
    
    // 只有bilibili和腾讯视频平台才需要获取API信息
    // 如果番剧ID或平台发生变化，需要重新获取信息
    const needFetch = (anime.platform === 1 || anime.platform === 2) && 
                     (originalAnimeId !== updateAnimeDto.animeId || originalPlatform !== updateAnimeDto.platform);
    
    // 如果需要重新获取信息，立即执行
    if (needFetch) {
      this.logger.log(`番剧ID或平台发生变化，重新获取信息: ID从 ${originalAnimeId} 到 ${updateAnimeDto.animeId}, 平台从 ${originalPlatform} 到 ${updateAnimeDto.platform}`);
      await this.fetchAnimeInfo(id);
      
      // 获取信息后再次获取番剧，确保返回最新状态
      const refreshedAnime = await this.findOne(id);
      
      // 如果提供了封面，确保在获取信息后封面不被覆盖
      if (updateAnimeDto.cover) {
        refreshedAnime.cover = updateAnimeDto.cover;
        await this.animeRepository.save(refreshedAnime);
        return refreshedAnime;
      }
      
      return refreshedAnime;
    }
    
    return updatedAnime;
  }

  /**
   * 删除番剧
   * @param id 番剧ID
   */
  async remove(id: number): Promise<void> {
    const anime = await this.findOne(id);
    await this.animeRepository.remove(anime);
  }

  /**
   * 获取番剧信息
   * @param id 番剧ID
   */
  async fetchAnimeInfo(id: number, createAnimeDto?: CreateAnimeDto): Promise<void> {
    try {
      const anime = await this.findOne(id);
      
      this.logger.log(`开始获取番剧信息: ID=${id}, 名称=${anime.animeName}, 当前状态=${anime.animeStatus}`);
      
      // 保存原始封面，以便在更新后恢复
      const originalCover = anime.cover;
      
      // 根据平台调用不同的API
      if (anime.platform === 1) {
        const response = await axios.get('https://api.bilibili.com/pgc/view/web/season', {
          params: {
            season_id: anime.animeId
          }
        });
        
        if (response.data.code === 0 && response.data.result) {
          const result = response.data.result;
          
          // 获取seasons中与当前season_id匹配的索引
          const seasonIndex = result.seasons ? 
            result.seasons.findIndex(item => item.season_id === result.season_id) : -1;
          
          // 解析weekday信息
          let weekday = 0;
          if (result.new_ep && result.new_ep.desc) {
            const weekdayMatch = result.new_ep.desc.match(/每周([一二三四五六日天])/);
            if (weekdayMatch) {
              const weekdayText = weekdayMatch[1];
              const weekdayMap = { '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '日': 0, '天': 0 };
              weekday = weekdayMap[weekdayText] || 0;
            }
          }
          
          // 获取indexShow
          const indexShow = seasonIndex !== -1 && result.seasons[seasonIndex].new_ep ? 
            result.seasons[seasonIndex].new_ep.index_show : null;
          
          // 根据番剧状态和indexShow确定当前集数
          let currentEpisodes;
          const animeStatus = result.publish?.is_finish === 1 ? 2 : 1; // 1: 连载中, 2: 已完结
          
          if (animeStatus === 2) { // 已完结
            currentEpisodes = result.total || result.episodes?.length;
          } else { // 连载中
            if (indexShow) {
              // 从indexShow中提取数字（如"更新至第4话"中的"4"）
              const match = indexShow.match(/第(\d+)话/);
              if (match && match[1]) {
                currentEpisodes = parseInt(match[1]);
              } else {
                currentEpisodes = result.episodes?.length;
              }
            } else {
              currentEpisodes = result.episodes?.length;
            }
          }
          
          // 更新番剧信息
          anime.animeName = result.title || anime.animeName;
          // 更新番剧状态
          this.logger.log(`更新番剧状态: 从 ${anime.animeStatus} 到 ${animeStatus}`);
          anime.animeStatus = animeStatus;
          
          // 封面处理逻辑: 
          // 1. 保留原有自定义封面 
          // 2. 记录日志以便追踪问题
          if (originalCover) {
            // 检查是否是自定义封面 (通常自定义封面会有不同的域名)
            const isBilibiliCover = originalCover.includes('hdslb.com') || originalCover.includes('bilibili.com');
            if (!isBilibiliCover) {
              this.logger.log(`保留自定义封面: ${originalCover}`);
              // 保持原有自定义封面不变
            } else {
              // 使用新的B站封面
              this.logger.log(`更新B站封面: 从 ${originalCover} 到 ${result.cover}`);
              anime.cover = result.cover;
            }
          } else {
            // 没有原始封面，使用B站封面
            this.logger.log(`设置B站封面: ${result.cover}`);
            anime.cover = result.cover;
          }
          anime.rating = result.rating?.score || anime.rating;
          anime.ratingCount = result.rating?.count || anime.ratingCount;
          anime.totalEpisodes = result.total || result.episodes?.length || anime.totalEpisodes;
          
          // 更新当前集数逻辑
          anime.indexShow = indexShow;
            
          // 根据番剧状态设置当前集数
          if (animeStatus === 2) { // 已完结
            anime.currentEpisodes = anime.totalEpisodes;
          } else { // 连载中
            if (anime.indexShow) {
              // 从indexShow中提取数字（如"更新至第4话"中的"4"）
              const match = anime.indexShow.match(/第(\d+)话/);
              if (match && match[1]) {
                anime.currentEpisodes = parseInt(match[1]);
              }
            }
          }
          
          anime.description = result.evaluate || anime.description;
          anime.actors = result.actors ? (Array.isArray(result.actors) ? result.actors.join(', ') : result.actors) : anime.actors;
          
          // 处理地区信息
          if (result.areas && result.areas.length > 0) {
            // 保存原始areas字符串
            anime.areas = result.areas?.map(area => area.name).join(', ') || anime.areas;
            
            // 处理area对象
            const areaMapping = [
              {id: 1, name: '国漫'},
              {id: 2, name: '日漫'},
              {id: 3, name: '美漫'}
            ];
            
            // 根据areas[0].id查找对应的area
            if (result.areas[0] && result.areas[0].id) {
              const matchedArea = areaMapping.find(item => item.id === result.areas[0].id);
              if (matchedArea) {
                anime.area = matchedArea;
              }
            }
          }
          
          anime.subtitle = result.subtitle || anime.subtitle;
          anime.uname = result.up_info?.uname || anime.uname;
          anime.publishTime = result.publish?.pub_time_show || anime.publishTime;
          anime.link = result.link || anime.link;
          anime.styles = result.styles || anime.styles;
          anime.weekday = weekday;
          
          // 更新统计信息
          if (seasonIndex !== -1 && result.seasons[seasonIndex].stat) {
            // 安全处理大数值，确保不会超出数据库字段范围
            const safeBigint = (value) => {
              if (!value) return null;
              // 确保值是数字类型
              const numValue = Number(value);
              // 检查是否为有效数字
              if (isNaN(numValue)) return null;
              return numValue;
            };
            
            anime.favorites = safeBigint(result.seasons[seasonIndex].stat.favorites);
            anime.views = safeBigint(result.seasons[seasonIndex].stat.views);
            anime.seriesFollow = safeBigint(result.seasons[seasonIndex].stat.series_follow);
            
            this.logger.log(`统计信息更新: 播放量=${anime.views}, 收藏数=${anime.favorites}, 追番人数=${anime.seriesFollow}`);
          }
          
          anime.lastUpdateTime = new Date();
          
          await this.animeRepository.save(anime);
          this.logger.log(`成功更新番剧信息: ${anime.animeName}, 更新后状态=${anime.animeStatus}`);
          
          // 获取更新后的完整对象进行验证
          const updatedAnime = await this.findOne(id);
          this.logger.log(`验证更新后的番剧状态: ID=${id}, 名称=${updatedAnime.animeName}, 状态=${updatedAnime.animeStatus}`);
        } else {
          this.logger.warn(`获取番剧信息失败: ${response.data.message}`);
        }
      } else if (anime.platform === 2) {
        // 腾讯视频平台
        try {
          const response = await axios.get(`http://node.video.qq.com/x/api/float_vinfo2?cid=${anime.animeId}`);
          
          if (response.data) {
            const result = response.data;
            let area = null;
            let styles = [];
            let areaSource = '';
            
            // 保存原始数据到details字段
            anime.details = result;
            
            // 更新番剧信息
            if (result.nam && result.nam[0]) {
              anime.actors = Array.isArray(result.nam[0]) ? result.nam[0].join(', ') : result.nam[0];
            }

            this.logger.log(result.typ);
            
            if (result.typ) {

              // 处理area对象
              const areaMapping = [
                {id: 1, name: '国漫'},
                {id: 2, name: '日漫'},
                {id: 3, name: '美漫'},
                {id: 4, name: '其他'}
              ];

              if (result.typ.length === 1) {
                areaSource = result.typ[0];
              } else if (result.typ.length === 2) {
                areaSource = result.typ[1];
                styles = Array.isArray(result.typ[0]) ? result.typ[0] : [];
              }

              ['内地', '中国大陆', '中国香港', '中国台湾'].forEach(item => {
                if (areaSource.includes(item)) {
                  area = '国漫';
                }
              });

              area = areaSource.includes('日本') ? areaMapping[1] : areaSource.includes('美国') ? areaMapping[2] : areaMapping[3];
            }

            anime.area = area;
            anime.styles = styles;
            
            // 更新简介
            if (result.c && result.c.description) {
              anime.description = result.c.description;
            }
            
            // 更新封面
            if (result.c && result.c.pic && !originalCover) {
              anime.cover = result.c.pic;
            } else if (originalCover) {
              // 保留自定义封面
              this.logger.log(`保留腾讯视频自定义封面: ${originalCover}`);
            }
            
            // 更新发布时间
            if (result.c && result.c.year) {
              anime.publishTime = result.c.year;
            }
            
            // 更新标题
            if (result.c && result.c.title) {
              anime.animeName = result.c.title || anime.animeName;
            }
            
            // 更新链接
            anime.link = `https://v.qq.com/detail/m/${anime.animeId}.html`;
            
            // 更新时间
            anime.lastUpdateTime = new Date();
            
            await this.animeRepository.save(anime);
            this.logger.log(`成功更新腾讯视频番剧信息: ${anime.animeName}`);
          } else {
            this.logger.warn(`获取腾讯视频番剧信息失败: 无数据返回`);
          }
        } catch (error) {
          this.logger.error(`获取腾讯视频番剧信息出错: ${error.message}`, error.stack);
        }
      } else {
        this.logger.warn(`暂不支持平台${anime.platform}的番剧信息获取`);
      }
    } catch (error) {
      this.logger.error(`获取番剧信息出错: ${error.message}`, error.stack);
    }
  }

  /**
   * 手动更新番剧信息
   * @param id 番剧ID
   */
  async updateAnimeInfo(id: number): Promise<void> {
    await this.fetchAnimeInfo(id);
  }

  /**
   * 每天凌晨2点自动更新番剧信息
   */
  @Cron('0 0 2 * * *')
  async handleCron() {
    this.logger.log('开始定时更新番剧信息');
    
    try {
      const animes = await this.animeRepository.find();
      
      for (const anime of animes) {
        await this.fetchAnimeInfo(anime.id);
        // 添加延迟，避免频繁请求API
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      this.logger.log('番剧信息更新完成');
    } catch (error) {
      this.logger.error(`定时更新番剧信息出错: ${error.message}`, error.stack);
    }
  }

  /**
   * 添加手动执行的定时任务
   * @param name 任务名称
   * @param seconds 延迟秒数
   */
  addCronJob(name: string, seconds: number) {
    try {
      // 创建一个一次性的延迟任务
      const timeout = setTimeout(() => {
        this.logger.warn(`手动任务 "${name}" 执行中!`);
        this.handleCron().catch(err => {
          this.logger.error(`任务执行失败: ${err.message}`);
        });
      }, seconds * 1000);
      
      // 将任务添加到超时任务列表中
      this.schedulerRegistry.addTimeout(name, timeout);
      
      this.logger.warn(
        `任务 ${name} 已添加，将在 ${seconds} 秒后执行!`,
      );
    } catch (error) {
      this.logger.error(`添加任务失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 从B站API获取番剧数据并保存
   * @param animeId B站番剧ID
   * @param customCover 可选的自定义封面URL
   * @returns 保存的番剧信息
   */
  async fetchAndSaveBilibiliAnime(animeId: string, customCover?: string): Promise<Anime> {
    try {
      this.logger.log(`开始获取B站番剧信息: ${animeId}`);
      
      // 检查该番剧是否已存在
      const existingAnime = await this.animeRepository.findOne({ 
        where: { 
          platform: 1, // bilibili
          animeId: animeId 
        } 
      });
      
      if (existingAnime) {
        this.logger.log(`番剧已存在，将更新信息: ${existingAnime.animeName}`);
        await this.fetchAnimeInfo(existingAnime.id);
        
        // 如果提供了自定义封面，则更新封面
        if (customCover) {
          existingAnime.cover = customCover;
          await this.animeRepository.save(existingAnime);
        }
        
        return await this.findOne(existingAnime.id);
      }
      
      // 从B站API获取番剧信息
      const response = await axios.get('https://api.bilibili.com/pgc/view/web/season', {
        params: {
          season_id: animeId
        }
      });
      
      if (response.data.code !== 0 || !response.data.result) {
        throw new HttpException(`获取B站番剧信息失败: ${response.data.message || '未知错误'}`, HttpStatus.BAD_REQUEST);
      }
      
      const result = response.data.result;
      
      // 解析weekday信息
      let weekday = 0;
      if (result.new_ep && result.new_ep.desc) {
        const weekdayMatch = result.new_ep.desc.match(/每周([一二三四五六日天])/);
        if (weekdayMatch) {
          const weekdayText = weekdayMatch[1];
          const weekdayMap = { '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '日': 0, '天': 0 };
          weekday = weekdayMap[weekdayText] || 0;
        }
      }
      
      // 获取seasons中与当前season_id匹配的索引
      const seasonIndex = result.seasons ? 
        result.seasons.findIndex(item => item.season_id === result.season_id) : -1;
      
      // 获取indexShow
      const indexShow = seasonIndex !== -1 && result.seasons[seasonIndex].new_ep ? 
        result.seasons[seasonIndex].new_ep.index_show : null;
      
      // 根据番剧状态和indexShow确定当前集数
      let currentEpisodes;
      const animeStatus = result.publish?.is_finish === 1 ? 2 : 1; // 1: 连载中, 2: 已完结
      
      if (animeStatus === 2) { // 已完结
        currentEpisodes = result.total || result.episodes?.length;
      } else { // 连载中
        if (indexShow) {
          // 从indexShow中提取数字（如"更新至第4话"中的"4"）
          const match = indexShow.match(/第(\d+)话/);
          if (match && match[1]) {
            currentEpisodes = parseInt(match[1]);
          } else {
            currentEpisodes = result.episodes?.length;
          }
        } else {
          currentEpisodes = result.episodes?.length;
        }
      }
      
      // 创建新番剧
      const newAnime = this.animeRepository.create({
        animeName: result.title,
        platform: 1, // bilibili
        animeId: animeId,
        animeStatus: animeStatus,
        watchStatus: 1, // 默认为"想看"
        // 如果提供了自定义封面，则使用自定义封面，否则使用B站封面
        cover: customCover || result.cover,
        rating: result.rating?.score,
        ratingCount: result.rating?.count,
        totalEpisodes: result.total || result.episodes?.length,
        currentEpisodes: currentEpisodes,
        description: result.evaluate,
        actors: result.actors ? (Array.isArray(result.actors) ? result.actors.join(', ') : result.actors) : null,
        areas: result.areas?.map(area => area.name).join(', '),
        subtitle: result.subtitle,
        uname: result.up_info?.uname,
        publishTime: result.publish?.pub_time_show,
        link: result.link,
        styles: result.styles,
        indexShow: indexShow,
        weekday: weekday,
        favorites: seasonIndex !== -1 ? result.seasons[seasonIndex].stat?.favorites : null,
        views: seasonIndex !== -1 ? result.seasons[seasonIndex].stat?.views : null,
        seriesFollow: seasonIndex !== -1 ? result.seasons[seasonIndex].stat?.series_follow : null
      });
      
      // 处理area字段
      if (result.areas && result.areas.length > 0) {
        const areaMapping = [
          {id: 1, name: '国漫'},
          {id: 2, name: '日漫'},
          {id: 3, name: '美漫'}
        ];
        
        if (result.areas[0] && result.areas[0].id) {
          const matchedArea = areaMapping.find(item => item.id === result.areas[0].id);
          if (matchedArea) {
            newAnime.area = matchedArea;
          }
        }
      }
      
      // 保存番剧基本信息
      const savedAnime = await this.animeRepository.save(newAnime);
      
      // 获取详细信息并更新
      await this.fetchAnimeInfo(savedAnime.id);
      
      // 返回完整信息
      return await this.findOne(savedAnime.id);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(`获取B站番剧信息出错: ${error.message}`, error.stack);
      throw new HttpException(`获取B站番剧信息出错: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
} 