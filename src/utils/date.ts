import dayjs from 'dayjs';

export const formatDateTime = (isoString: string): string => {
  if (!isoString) {
    return "";
  }

  return dayjs(isoString).format('YYYY-MM-DD HH:mm');
};
