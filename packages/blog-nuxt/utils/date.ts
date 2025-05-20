import dayjs from "dayjs";

/**
 * 格式化日期
 * @param date 需要格式化的日期
 * @param format 格式化格式
 * @returns 格式化后的日期字符串
 */
export function formatDate(date: string | Date | null | undefined, format = 'YYYY-MM-DD'): string {
  if (!date) return '';
  
  try {
    // 使用dayjs库处理日期，确保最大兼容性
    return dayjs(date).format(format);
  } catch (error) {
    console.warn('日期格式化失败:', date);
    // 返回一个安全的默认值
    return typeof date === 'string' ? date : '';
  }
}

/**
 * 计算相对时间
 * @param date 日期字符串
 * @returns 相对时间描述
 */
export function relativeTime(dateStr: string): string {
  if (!dateStr) return '';
  
  try {
    const date = dayjs(dateStr);
    const now = dayjs();
    const diff = now.diff(date, 'second');
    
    if (diff < 60) {
      return '刚刚';
    }
    
    // 转换为分钟
    const minutes = Math.floor(diff / 60);
    if (minutes < 60) {
      return `${minutes}分钟前`;
    }
    
    // 转换为小时
    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return `${hours}小时前`;
    }
    
    // 转换为天
    const days = Math.floor(hours / 24);
    if (days < 30) {
      return `${days}天前`;
    }
    
    // 转换为月
    const months = Math.floor(days / 30);
    if (months < 12) {
      return `${months}个月前`;
    }
    
    // 转换为年
    const years = Math.floor(months / 12);
    return `${years}年前`;
  } catch (error) {
    console.warn('相对时间计算失败:', dateStr);
    return '';
  }
}

export function formatDateTime(date: string | Date | null | undefined, format = "YYYY-MM-DD HH:mm:ss") {
  return formatDate(date, format);
} 