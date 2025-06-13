import dayjs from "dayjs";

export function formatDate(date: string | Date | null, format = "YYYY-MM-DD"): string {
  if (date == null) {
    return "";
  }
  return dayjs(date).format(format);
}

export function formatDateTime(date: string | Date | null | undefined, format = "YYYY-MM-DD HH:mm:ss"): string {
  if (date == null) {
    return "";
  }
  return formatDate(date, format);
}
