/**
 * 驗證是否為 yyyy-MM-dd 格式
 */
export const isValidDateFormat = (val: string | undefined): boolean => {
  if (!val) return true;
  return /^\d{4}-\d{2}-\d{2}$/.test(val);
};

/**
 * 驗證出生日期是否不大於今日
 */
export const isValidBirthDate = (val: string | undefined): boolean => {
  if (!val) return true;
  const parts = val.split("-");
  if (parts.length !== 3) return false;

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  const inputDate = new Date(year, month, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return inputDate <= today;
};
