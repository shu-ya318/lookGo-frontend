import { useEffect } from 'react';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

import { useMetroMapStore } from '@/stores/metroMapStore';
import { useStationStore } from '@/stores/stationStore';

import { MetroMapImageViewer } from './MetroMapImageViewer';
import { RouteResultCard } from './RouteResultCard';
import { StationInfoCard } from './StationInfoCard';

export const MetroMapContainer = () => {
  const { lines, isMetroMapLoading, error, fetchMetroMap, routeResult, clearRoute } = useMetroMapStore();
  const currentStationCode = useStationStore((state) => state.currentStationCode);
  const clearSelection = useStationStore((state) => state.clearSelection);

  useEffect(() => {
    fetchMetroMap();
  }, [fetchMetroMap]);

  // 遍歷方式，透過車站代碼找到對應的路線與車站資料，找到就停止搜尋，不用找其他路線
  let selectedStation = null;
  let selectedLine = null;
  if (currentStationCode) {
    for (const line of lines) {
      const station = line.stations.find((station) => station.stationCode === currentStationCode);
      if (station) {
        selectedStation = station;
        selectedLine = line;
        break;
      }
    }
  }

  {/* 資料載入中的提示畫面 */ }
  if (isMetroMapLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          gap: 2,
        }}
      >
        <CircularProgress />
        <Typography variant='body2' color='text.secondary'>
          路網圖資料載入中…
        </Typography>
      </Box>
    );
  }

  {/* 資料載入失敗的提示畫面 */ }
  if (error) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
        }}
      >
        <Typography variant='body2' color='error'>
          路網圖資料載入失敗，請重新整理頁面嘗試
        </Typography>
      </Box>
    );
  }

  {/* 資料載入成功的顯示畫面 */ }
  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* 顯示路網圖與可點擊區域 */}
      <MetroMapImageViewer lines={lines} />
      {/* 顯示選取車站的資訊 */}
      {selectedStation && selectedLine && (
        <StationInfoCard
          station={selectedStation}
          line={selectedLine}
          allLines={lines}
          onClose={clearSelection}
        />
      )}
      {/* 顯示起訖車站查詢結果的資訊 */}
      {!selectedStation && routeResult && (
        <RouteResultCard routeResult={routeResult} onClose={clearRoute} />
      )}
    </Box>
  );
}
