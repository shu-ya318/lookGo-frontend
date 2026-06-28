import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';

import type { PositionedLine, PositionedStation } from './computeLayout';

interface Props {
  station: PositionedStation;
  line: PositionedLine;
  allLines: PositionedLine[];
  onClose: () => void;
}

function normalize(raw: string): string {
  return raw.startsWith('#') ? raw : `#${raw}`;
}

export function StationInfoCard({ station, line, allLines, onClose }: Props): React.ReactElement {
  // 找出同名轉乘路線
  const transferLines = station.isTransfer
    ? allLines.filter(
        (l) =>
          l.letter !== line.letter &&
          l.stations.some((s) => s.nameZhTw === station.nameZhTw)
      )
    : [];

  return (
    <Card
      elevation={4}
      sx={{
        position: 'absolute',
        bottom: 24,
        left: 24,
        width: 240,
        zIndex: 10,
        borderRadius: 2,
      }}
    >
      <CardContent sx={{ '&:last-child': { pb: 2 } }}>
        {/* 標題列 */}
        <Stack direction='row' sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant='body1' sx={{ fontWeight: 700, lineHeight: 1.3 }}>
              {station.nameZhTw}
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              {station.nameEn}
            </Typography>
          </Box>
          <IconButton size='small' onClick={onClose} sx={{ mt: -0.5, mr: -0.5 }}>
            <CloseIcon fontSize='small' />
          </IconButton>
        </Stack>

        <Divider sx={{ my: 1 }} />

        {/* 路線標籤 */}
        <Stack direction='row' sx={{ flexWrap: 'wrap', gap: 0.75 }}>
          <Chip
            label={`${station.stationCode} ${line.nameZhTw}`}
            size='small'
            sx={{
              backgroundColor: normalize(line.color),
              color: '#fff',
              fontWeight: 700,
              fontSize: 11,
            }}
          />
          {transferLines.map((tl) => {
            const ts = tl.stations.find((s) => s.nameZhTw === station.nameZhTw);
            return (
              <Chip
                key={tl.letter}
                label={`${ts?.stationCode ?? tl.letter} ${tl.nameZhTw}`}
                size='small'
                sx={{
                  backgroundColor: normalize(tl.color),
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 11,
                }}
              />
            );
          })}
        </Stack>

        {/* 轉乘提示 */}
        {station.isTransfer && (
          <Stack direction='row' spacing={0.5} sx={{ mt: 1, alignItems: 'center' }}>
            <SwapHorizIcon sx={{ fontSize: 16, color: 'warning.main' }} />
            <Typography variant='caption' color='warning.main' sx={{ fontWeight: 600 }}>
              可轉乘 {transferLines.length} 條路線
            </Typography>
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
