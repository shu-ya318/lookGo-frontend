/**
 * 驗證是否為 yyyy-MM-dd 格式
 */
export const isValidDateFormat = (value: string): boolean => {
  if (!value) return true;

  return /^\d{4}-\d{2}-\d{2}$/.test(value);
};

/**
 * 驗證是否為 09 開頭的 10 碼手機號碼
 */
export const isValidCellphone = (value: string): boolean => {
  return /^09\d{8}$/.test(value);
};

/**
 * 驗證出生日期是否為合理範圍內的真實日期，且不大於今日
 */
export const isValidBirthDate = (value: string): boolean => {
  if (!value) return true;

  const parts = value.split("-");

  if (parts.length !== 3) return false;

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // Date 物件的月份為 0-11
  const day = parseInt(parts[2], 10);

  if (year < 1911) return false;

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
