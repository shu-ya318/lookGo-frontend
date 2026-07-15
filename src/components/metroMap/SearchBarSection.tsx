import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { enqueueSnackbar } from 'notistack';

import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SearchIcon from '@mui/icons-material/Search';

import { LabeledStationField } from '@/components/LabeledStationField';
import { AdvancedFilterMenu } from '@/components/metroMap/AdvancedFilterMenu';

import { useMetroMapStore } from '@/stores/metroMapStore';
import { useStationStore } from '@/stores/stationStore';

import { formatStationLabel } from '@/utils/station';

import {
  FareType,
  RoutingStrategy,
  type StationFacility,
} from '@/services/metro/types';
import type { StationOption } from '@/services/metro/interface';
import type { AdvancedFilters } from '@/components/metroMap/AdvancedFilterMenu';

const SEARCH_BAR_HEIGHT = '5.5rem';
const SEARCH_CONTROL_HEIGHT = '2.5rem';

export const SearchBarSection = () => {
  const {
    stations,
    fetchRoute,
    isRouteLoading,
    setSelectedFacilities,
    clearRoute,
  } = useMetroMapStore();
  const stationOptions = useMetroMapStore((state) => state.stationOptions);
  const selectAndFetchStation = useStationStore(
    (state) => state.selectAndFetchStation,
  );
  const isStationLoading = useStationStore((state) => state.isStationLoading);
  const clearSelection = useStationStore((state) => state.clearSelection);

  const [searchParams, setSearchParams] = useSearchParams();
  // 避免更新時無限觸發 useEffect
  const hasAppliedSearchParam = useRef(false);

  const [fromStation, setFromStation] = useState<StationOption | null>(null);
  const [toStation, setToStation] = useState<StationOption | null>(null);
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({
    facilities: [],
    fare: null,
    routingStrategy: null,
  });

  useEffect(() => {
    const keyword = searchParams.get('search')?.trim();
    if (!keyword || hasAppliedSearchParam.current || stations.length === 0) {
      return;
    }

    hasAppliedSearchParam.current = true;

    const matchedStation = stationOptions.find(
      (option) =>
        option.stationCode === keyword || option.nameZhTw.includes(keyword),
    );

    if (matchedStation) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFromStation(matchedStation);
      selectAndFetchStation(matchedStation.stationCode);
    } else {
      enqueueSnackbar(`找不到符合「${keyword}」的車站，請重新查詢`, {
        variant: 'warning',
      });
    }

    setSearchParams({}, { replace: true });
  }, [
    stations,
    searchParams,
    setSearchParams,
    selectAndFetchStation,
    stationOptions,
  ]);

  // 判斷使用者只選擇單一車站或起訖車站，並設定對應的搜尋行為
  const hasFromStation = fromStation !== null;
  const hasToStation = toStation !== null;
  const isSingleStationMode = hasFromStation && !hasToStation;
  const isRouteMode = hasFromStation && hasToStation;
  const canSearch = hasFromStation && !isRouteLoading && !isStationLoading;

  const infoText = !hasFromStation
    ? '可點擊地圖路線(文湖、淡水信義、松山新店、中和新蘆、板南)的任意車站代碼，或選擇起始車站進行查詢'
    : isSingleStationMode
      ? `已選起始站「${formatStationLabel(fromStation)}」，可直接查詢單站資訊，或再選終點車站查詢路徑`
      : `已選起訖站，可查詢路徑（${formatStationLabel(fromStation)} → ${formatStationLabel(toStation!)}）`;

  const handleToggleFacility = (value: StationFacility) => {
    setAdvancedFilters((prev) => {
      const updated = prev.facilities.includes(value)
        ? prev.facilities.filter((v) => v !== value)
        : [...prev.facilities, value];
      setSelectedFacilities(updated);

      return { ...prev, facilities: updated };
    });
  };

  const handleSelectFare = (value: FareType) => {
    setAdvancedFilters((prev) => ({
      ...prev,
      fare: prev.fare === value ? null : value,
    }));
  };

  const handleSelectTime = (value: RoutingStrategy) => {
    setAdvancedFilters((prev) => ({
      ...prev,
      routingStrategy: prev.routingStrategy === value ? null : value,
    }));
  };

  const handleSearch = async () => {
    if (!fromStation) return;

    // 單站查詢模式：呼叫單站詳細資訊 API（與點擊地圖車站行為一致）
    if (!toStation) {
      clearRoute();
      await selectAndFetchStation(fromStation.stationCode);

      return;
    }

    clearSelection();
    // 使用者選取的票價種類（預設全票）
    const fareType = advancedFilters.fare ?? FareType.FULL;
    // 使用者選取的路線策略（預設最少轉乘時間）
    const routingStrategy =
      advancedFilters.routingStrategy ?? RoutingStrategy.MIN_TRANSFER;
    await fetchRoute({
      fromStationCode: fromStation.stationCode,
      toStationCode: toStation.stationCode,
      fareType,
      routingStrategy,
    });
  };

  return (
    <Stack
      sx={{
        position: 'sticky',
        flexShrink: 0,
        backgroundColor: 'primary.main',
        px: 3,
        py: 1.5,
        gap: 1,
        height: { xs: 'auto', sm: SEARCH_BAR_HEIGHT },
        minHeight: { sm: SEARCH_BAR_HEIGHT },
        zIndex: 10,
      }}
    >
      {/* 查詢提示 */}
      <Stack direction='row' sx={{ alignItems: 'center', gap: 1 }}>
        <InfoOutlinedIcon
          sx={{ color: 'primary.contrastText', fontSize: 20 }}
        />
        <Typography
          variant='caption'
          sx={{
            color: isSingleStationMode
              ? 'rgba(255,255,160,0.95)'
              : isRouteMode
                ? 'rgba(180,255,180,0.95)'
                : 'primary.contrastText',
            transition: 'color 0.3s ease',
          }}
        >
          {infoText}
        </Typography>
      </Stack>
      <Stack
        direction='row'
        sx={{
          alignItems: 'center',
          justifyContent: { xs: 'center', sm: 'flex-start' },
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        {/* 起始車站 */}
        <LabeledStationField
          label='起始車站'
          value={fromStation}
          onChange={setFromStation}
          width={210}
          controlHeight={SEARCH_CONTROL_HEIGHT}
        />
        {/* 終點車站 */}
        <LabeledStationField
          label='終點車站'
          value={toStation}
          onChange={(selectedOption) => {
            setToStation(selectedOption);
            if (selectedOption) {
              setAdvancedFilters((prev) => ({ ...prev, facilities: [] }));
              setSelectedFacilities([]);
            } else {
              setAdvancedFilters((prev) => ({
                ...prev,
                fare: null,
                routingStrategy: null,
              }));
            }
          }}
          width={210}
          controlHeight={SEARCH_CONTROL_HEIGHT}
        />
        {/* 進階查詢 */}
        <AdvancedFilterMenu
          filters={advancedFilters}
          isSingleStationMode={isSingleStationMode}
          isRouteMode={isRouteMode}
          disabled={!hasFromStation}
          controlHeight={SEARCH_CONTROL_HEIGHT}
          onToggleFacility={handleToggleFacility}
          onSelectFare={handleSelectFare}
          onSelectTime={handleSelectTime}
        />
        {/* 查詢按鈕 */}
        <Button
          startIcon={<SearchIcon />}
          variant='contained'
          size='small'
          disabled={!canSearch}
          onClick={handleSearch}
          sx={{
            height: SEARCH_CONTROL_HEIGHT,
            minWidth: 140,
            backgroundColor: 'primary.contrastText',
            color: 'primary.main',
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.85)' },
          }}
        >
          {isRouteLoading || isStationLoading
            ? '查詢中…'
            : isSingleStationMode
              ? '查詢車站'
              : '開始查詢'}
        </Button>
      </Stack>
    </Stack>
  );
};
