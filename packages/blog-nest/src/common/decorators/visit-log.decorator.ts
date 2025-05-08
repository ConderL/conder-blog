import { SetMetadata } from '@nestjs/common';

/**
 * 访问日志元数据键
 */
export const VISIT_LOG_KEY = 'visit_log';

/**
 * 访问日志装饰器
 * 用于标记需要记录访问日志的路由
 * @param pageName 页面名称
 * @returns 装饰器
 */
export const VisitLog = (pageName: string) => SetMetadata(VISIT_LOG_KEY, pageName);
