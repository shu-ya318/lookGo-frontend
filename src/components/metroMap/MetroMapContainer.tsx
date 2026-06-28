import { useEffect } from 'react';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

import { useMetroMapStore } from '@/stores/metroMapStore';
import { useStationStore } from '@/stores/useStationStore';
import type { MetroMapLine, MetroMapStation } from '@/services/metro/interface';
import { MetroMapImageViewer } from './MetroMapImageViewer';
//import { MetroMapLegend } from './MetroMapLegend';
import { StationInfoCard } from './StationInfoCard';

export function MetroMapContainer(): React.ReactElement {
  const { lines, isLoading, error, fetchMetroMap } = useMetroMapStore();
  const currentStationCode = useStationStore((state) => state.currentStationCode);
  const clearSelection = useStationStore((state) => state.clearSelection);

  useEffect(() => {
    fetchMetroMap();
  }, [fetchMetroMap]);

  let selectedStation: MetroMapStation | null = null;
  let selectedLine: MetroMapLine | null = null;
  if (currentStationCode) {
    for (const line of lines) {
      const station = line.stations.find((s) => s.stationCode === currentStationCode);
      if (station) {
        selectedStation = station;
        selectedLine = line;
        break;
      }
    }
  }

  if (isLoading) {
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
          路網資料載入中…
        </Typography>
      </Box>
    );
  }

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
          路網資料載入失敗，請重新整理頁面
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
      <MetroMapImageViewer lines={lines} />

      {/* {lines.length > 0 && <MetroMapLegend lines={lines} />} */}

      {selectedStation && selectedLine && (
        <StationInfoCard
          station={selectedStation}
          line={selectedLine}
          allLines={lines}
          onClose={clearSelection}
        />
      )}
    </Box>
  );
}
