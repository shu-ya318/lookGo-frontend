import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';

import { useStationStore } from '@/stores/useStationStore';
import type { MetroMapLine, MetroMapStation, StationDetails } from '@/services/metro/interface';

interface Props {
  station: MetroMapStation;
  line: MetroMapLine;
  allLines: MetroMapLine[];
  onClose: () => void;
}

function normalize(raw: string): string {
  return raw.startsWith('#') ? raw : `#${raw}`;
}

type FacilityKey = Extract<
  keyof StationDetails,
  'atm' | 'nursingRoom' | 'diaperTable' | 'chargingStation' | 'ticketMachine' | 'locker' | 'drinkingWater' | 'restroom' | 'elevator' | 'escalator'
>;

const FACILITY_LABELS: { key: FacilityKey; label: string }[] = [
  { key: 'elevator', label: '電梯' },
  { key: 'escalator', label: '電扶梯' },
  { key: 'atm', label: 'ATM' },
  { key: 'restroom', label: '廁所' },
  { key: 'drinkingWater', label: '飲水機' },
  { key: 'locker', label: '置物櫃' },
  { key: 'chargingStation', label: '充電站' },
  { key: 'ticketMachine', label: '售票機' },
  { key: 'nursingRoom', label: '哺乳室' },
  { key: 'diaperTable', label: '尿布台' },
];

export function StationInfoCard({ station, line, allLines, onClose }: Props): React.ReactElement {
  const stationDetails = useStationStore((state) => state.stationDetails);
  const isLoading = useStationStore((state) => state.isLoading);

  const transferLines = allLines.filter(
    (l) =>
      l.letter !== line.letter &&
      l.stations.some((s) => s.nameZhTw === station.nameZhTw)
  );
  const isTransfer = transferLines.length > 0;

  const availableFacilities = stationDetails
    ? FACILITY_LABELS.filter(({ key }) => stationDetails[key] !== null)
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
        {isTransfer && (
          <Stack direction='row' spacing={0.5} sx={{ mt: 1, alignItems: 'center' }}>
            <SwapHorizIcon sx={{ fontSize: 16, color: 'warning.main' }} />
            <Typography variant='caption' color='warning.main' sx={{ fontWeight: 600 }}>
              可轉乘 {transferLines.length} 條路線
            </Typography>
          </Stack>
        )}

        {/* 設施資訊 */}
        <Divider sx={{ my: 1 }} />
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
            <CircularProgress size={20} />
          </Box>
        ) : availableFacilities.length > 0 ? (
          <>
            <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 0.75 }}>
              站內設施
            </Typography>
            <Stack spacing={0.5}>
              {availableFacilities.map(({ key, label }) => (
                <Stack key={key} direction='row' sx={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <Typography variant='caption' color='text.secondary' sx={{ fontSize: 11, flexShrink: 0 }}>
                    {label}
                  </Typography>
                  <Typography variant='caption' sx={{ fontSize: 11, fontWeight: 500, textAlign: 'right', ml: 1 }}>
                    {stationDetails![key] as string}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </>
        ) : stationDetails !== null ? (
          <Typography variant='caption' color='text.secondary'>
            無特殊設施資訊
          </Typography>
        ) : null}
      </CardContent>
    </Card>
  );
}
