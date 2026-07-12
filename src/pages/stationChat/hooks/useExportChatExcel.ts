import { useState } from 'react';
import dayjs from 'dayjs';
import { enqueueSnackbar } from 'notistack';

import { useUserStore } from '@/stores/userStore';

import { getExcelByStationId } from '@/services/stationChat';

import type { StationDetail } from '@/services/metro/interface';

interface UseExportChatExcelResult {
  isExportingExcel: boolean;
  handleExportExcel: () => Promise<void>;
}

export const useExportChatExcel = (
  selectedStation: StationDetail | null,
): UseExportChatExcelResult => {
  const username = useUserStore((state) => state.userInfo?.username);

  const [isExportingExcel, setIsExportingExcel] = useState(false);

  const handleExportExcel = async () => {
    if (!selectedStation) return;

    setIsExportingExcel(true);

    try {
      const blob = await getExcelByStationId({
        stationId: selectedStation.id,
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.setAttribute(
        'download',
        `${username}_${selectedStation.nameZhTw}聊天紀錄_${dayjs().format('YYYYMMDD')}.xlsx`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      enqueueSnackbar('匯出成功', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar((error as string) || '匯出失敗', {
        variant: 'error',
      });
    } finally {
      setIsExportingExcel(false);
    }
  };

  return { isExportingExcel, handleExportExcel };
};
