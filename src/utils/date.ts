import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export const formatDateTime = (isoString: string): string => {
  if (!isoString) {
    return "";
  }

  // 將輸入解析為 UTC，然後轉換為台北時間 (UTC+8)
  return dayjs.utc(isoString).tz('Asia/Taipei').format('YYYY-MM-DD HH:mm');
};
