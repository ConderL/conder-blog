import dayjs from "dayjs";

export function formatDate(date: string | Date | null | undefined, format = "YYYY-MM-DD") {
  if (!date) return "";
  try {
    return dayjs(date).format(format);
  } catch (error) {
    console.error("日期格式化错误:", error);
    return "";
  }
}

export function formatDateTime(date: string | Date | null | undefined, format = "YYYY-MM-DD HH:mm:ss") {
  return formatDate(date, format);
} 