import { useState } from 'react';
import dayjs from 'dayjs';
import { enqueueSnackbar } from 'notistack';

import { getExcelByStationId } from '@/services/stationChat';

import type { StationDetails } from '@/services/metro/interface';

interface UseExportChatExcelResult {
    isExportingExcel: boolean;
    handleExportExcel: () => Promise<void>;
}

// 管理當日聊天紀錄的 Excel 匯出：下載 blob 並觸發瀏覽器存檔
export const useExportChatExcel = (
    selectedStation: StationDetails | null
): UseExportChatExcelResult => {
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
                `${selectedStation.nameZhTw}聊天紀錄_${dayjs().format('YYYYMMDD')}.xlsx`
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
