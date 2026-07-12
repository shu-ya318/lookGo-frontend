import dayjs from 'dayjs';

/**
 * 驗證是否為 yyyy-MM-dd 格式
 */
export const isValidDateFormat = (value: string) => {
  if (!value) return true;

  return /^\d{4}-\d{2}-\d{2}$/.test(value);
};

/**
 * 驗證是否為 09 開頭的 10 碼手機號碼
 */
export const isValidCellphone = (value: string) => {
  return /^09\d{8}$/.test(value);
};

/**
 * 驗證出生日期是否為合理範圍內的真實日期，且不大於今日
 */
export const isValidBirthDate = (value: string) => {
  if (!value) return true;

  const parts = value.split('-');

  if (parts.length !== 3) return false;

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // Date 物件的月份為 0-11
  const day = parseInt(parts[2], 10);

  const inputDate = new Date(year, month, day);

  // 輸入的年月日與 Date 物件解析後的年月日不同，表示日期不存在
  if (
    inputDate.getFullYear() !== year ||
    inputDate.getMonth() !== month ||
    inputDate.getDate() !== day
  ) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return inputDate <= today;
};

// data URI 前綴（不分大小寫），如 data:image/png;base64,xxxx
const DATA_URI_PATTERN = /data:[\w.+-]+\/[\w.+-]+;base64,/i;
// 連續 200 字元以上的 base64 字元序列，攔截未帶前綴的裸 base64
const LONG_BASE64_PATTERN = /[A-Za-z0-9+/=]{200,}/;
// HTML 標籤，如 <img src=...>、<script>（不分大小寫）
const HTML_TAG_PATTERN = /<\s*(img|script|iframe|svg|object|embed)\b/i;

// 驗證聊天內容是否僅為純文字
// 夾帶圖片 data URI、裸 base64 或 HTML 標籤時回傳 false。
export const isPlainTextChatContent = (value: string) => {
  return (
    !DATA_URI_PATTERN.test(value) &&
    !LONG_BASE64_PATTERN.test(value) &&
    !HTML_TAG_PATTERN.test(value)
  );
};

/**
 * 驗證出生日期換算年齡是否介於 6 歲（含）至 150 歲（含）之間
 */
export const isValidBirthDateRange = (value: string) => {
  if (!value) return true; // 是否必填由各表單決定

  const birthDate = dayjs(value);
  const minBirthDate = dayjs().subtract(150, 'year');
  const maxBirthDate = dayjs().subtract(6, 'year');

  return (
    !birthDate.isBefore(minBirthDate, 'day') &&
    !birthDate.isAfter(maxBirthDate, 'day')
  );
};
