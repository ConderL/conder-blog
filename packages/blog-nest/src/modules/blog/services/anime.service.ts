import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Anime } from '../entities/anime.entity';
import { CreateAnimeDto, QueryAnimeDto, UpdateAnimeDto } from '../dto/anime.dto';
import axios from 'axios';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';

@Injectable()
export class AnimeService {
  private readonly logger = new Logger(AnimeService.name);

  constructor(
    @InjectRepository(Anime)
    private readonly animeRepository: Repository<Anime>,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  /**
   * 创建番剧
   * @param createAnimeDto 创建番剧DTO
   * @returns 创建的番剧
   */
  async create(createAnimeDto: CreateAnimeDto): Promise<Anime> {
    const anime = this.animeRepository.create(createAnimeDto);
    const savedAnime = await this.animeRepository.save(anime);
    
    // 创建后立即获取番剧信息
    await this.fetchAnimeInfo(savedAnime.id);
    
    return savedAnime;
  }

  /**
   * 获取番剧列表
   * @param queryAnimeDto 查询条件
   * @returns 番剧列表和总数
   */
  async findAll(queryAnimeDto: QueryAnimeDto): Promise<{ list: Anime[]; total: number }> {
    const { page = 1, limit = 10, animeName, platform, animeStatus, watchStatus } = queryAnimeDto;
    
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
    
    const total = await queryBuilder.getCount();
    
    const list = await queryBuilder
      .orderBy('anime.createTime', 'DESC')
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
    
    // 如果番剧ID或平台发生变化，需要重新获取信息
    const needFetch = anime.animeId !== updateAnimeDto.animeId || anime.platform !== updateAnimeDto.platform;
    
    // 更新番剧信息
    Object.assign(anime, updateAnimeDto);
    const updatedAnime = await this.animeRepository.save(anime);
    
    // 如果需要重新获取信息，立即执行
    if (needFetch) {
      await this.fetchAnimeInfo(id);
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
  async fetchAnimeInfo(id: number): Promise<void> {
    try {
      const anime = await this.findOne(id);
      
      // 目前只支持bilibili平台
      if (anime.platform === 1) {
        const response = await axios.get('https://api.bilibili.com/pgc/view/web/season', {
          params: {
            season_id: anime.animeId
          }
        });
        
        if (response.data.code === 0 && response.data.result) {
          const result = response.data.result;
          
          // 更新番剧信息
          anime.cover = result.cover || anime.cover;
          anime.rating = result.rating?.score || anime.rating;
          anime.totalEpisodes = result.episodes?.length || anime.totalEpisodes;
          anime.currentEpisodes = result.episodes?.length || anime.currentEpisodes;
          anime.description = result.evaluate || anime.description;
          anime.details = result;
          anime.lastUpdateTime = new Date();
          
          await this.animeRepository.save(anime);
          this.logger.log(`成功更新番剧信息: ${anime.animeName}`);
        } else {
          this.logger.warn(`获取番剧信息失败: ${response.data.message}`);
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
} 