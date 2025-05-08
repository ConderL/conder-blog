import { Between, LessThan } from 'typeorm';
import * as moment from 'moment';

/**
 * 获取今日日期范围
 */
export function getTodayRange() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return Between(today, tomorrow);
}

/**
 * 获取指定小时范围
 */
export function getHourRange(date: Date) {
  const hourStart = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    date.getHours(),
    0,
    0,
  );
  const hourEnd = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    date.getHours(),
    59,
    59,
  );
  return Between(hourStart, hourEnd);
}

/**
 * 获取日期之前的数据
 * @param days 天数
 */
export function getBeforeDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(0, 0, 0, 0);
  return LessThan(date);
}

/**
 * 获取近N天日期数组
 * @param days 天数
 */
export function getRecentDays(days: number) {
  const result = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    date.setHours(0, 0, 0, 0);
    result.push(date);
  }

  return result;
}

/**
 * 格式化日期
 * @param date 日期
 * @param format 格式
 */
export function formatDate(date: Date, format = 'YYYY-MM-DD') {
  return moment(date).format(format);
}
