import { useEffect, useState } from 'react';
import { enqueueSnackbar } from 'notistack';

import { getStationByCode } from '@/services/metro';

import type { StationDetail, StationOption } from '@/services/metro/interface';

interface UseStationSelectionResult {
    selectedStationOption: StationOption | null;
    setSelectedStationOption: (option: StationOption | null) => void;
    selectedStation: StationDetail | null;
}

/* 負責處理車站選取邏輯。
 * 把 StationAutocomplete 給的 stationCode 解析成車站聊天室請求 API 需要的 stationId 等詳細資訊。
*/
export const useStationSelection = (): UseStationSelectionResult => {
    const [selectedStationOption, setSelectedStationOption] =
        useState<StationOption | null>(null);
    const [selectedStation, setSelectedStation] =
        useState<StationDetail | null>(null);

    useEffect(() => {
        if (!selectedStationOption) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setSelectedStation(null);
            return;
        }

        let isCancelled = false;

        setSelectedStation(null);

        const resolveStation = async () => {
            try {
                const response = await getStationByCode({
                    stationCode: selectedStationOption.stationCode,
                });

                if (!isCancelled) {
                    setSelectedStation(response);
                }
            } catch (error) {
                if (!isCancelled) {
                    enqueueSnackbar((error as string) || '取得車站資訊失敗', {
                        variant: 'error',
                    });
                    setSelectedStationOption(null);
                }
            }
        };

        resolveStation();

        return () => {
            isCancelled = true;
        };
    }, [selectedStationOption]);

    return { selectedStationOption, setSelectedStationOption, selectedStation };
};
