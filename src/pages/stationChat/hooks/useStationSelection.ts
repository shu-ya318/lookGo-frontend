import { useEffect, useState } from 'react';
import { enqueueSnackbar } from 'notistack';

import { getStationByCode } from '@/services/metro';

import type { StationDetails, StationOption } from '@/services/metro/interface';

interface UseStationSelectionResult {
    selectedStationOption: StationOption | null;
    setSelectedStationOption: (option: StationOption | null) => void;
    selectedStation: StationDetails | null;
}

// 管理聊天室的車站選取：將 StationAutocomplete 的選項解析為含 stationId 的車站詳細資訊
export const useStationSelection = (): UseStationSelectionResult => {
    const [selectedStationOption, setSelectedStationOption] =
        useState<StationOption | null>(null);
    const [selectedStation, setSelectedStation] =
        useState<StationDetails | null>(null);

    useEffect(() => {
        if (!selectedStationOption) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setSelectedStation(null);
            return;
        }

        let isCancelled = false;

        setSelectedStation(null);

        // StationAutocomplete 僅提供 stationCode，聊天室 API 需要的 stationId 需另行查詢
        const resolveStation = async () => {
            try {
                const details = await getStationByCode({
                    stationCode: selectedStationOption.stationCode,
                });
                if (!isCancelled) {
                    setSelectedStation(details);
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
