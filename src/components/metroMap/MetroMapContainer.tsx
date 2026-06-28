import { useEffect, useMemo, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

import { useMetroMapStore } from '@/stores/metroMapStore';
import { computeLayout, type PositionedLine, type PositionedStation } from './computeLayout';
import { MetroMapCanvas } from './MetroMapCanvas';
import { MetroMapLegend } from './MetroMapLegend';
import { StationInfoCard } from './StationInfoCard';

interface SelectedStation {
  station: PositionedStation;
  line: PositionedLine;
}

export function MetroMapContainer(): React.ReactElement {
  const { lines, isLoading, error, fetchMetroMap } = useMetroMapStore();
  const [selected, setSelected] = useState<SelectedStation | null>(null);

  useEffect(() => {
    fetchMetroMap();
  }, [fetchMetroMap]);

  const positionedLines = useMemo(() => computeLayout(lines), [lines]);

  const handleStationClick = useCallback(
    (station: PositionedStation, line: PositionedLine) => {
      setSelected((prev) =>
        prev?.station.stationCode === station.stationCode &&
        prev?.line.letter === line.letter
          ? null
          : { station, line }
      );
    },
    []
  );

  const handleClose = useCallback(() => setSelected(null), []);

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
      {/* D3 可視化層 */}
      <MetroMapCanvas lines={positionedLines} onStationClick={handleStationClick} />

      {/* 圖例面板 */}
      {positionedLines.length > 0 && (
        <MetroMapLegend lines={positionedLines} />
      )}

      {/* 車站資訊彈窗 */}
      {selected && (
        <StationInfoCard
          station={selected.station}
          line={selected.line}
          allLines={positionedLines}
          onClose={handleClose}
        />
      )}
    </Box>
  );
}
