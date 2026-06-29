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
import type {
  MetroMapLine,
  MetroMapStation,
  StationDetails,
  GetOriginDestinationDetailResponse,
} from '@/services/metro/interface';

interface Props {
  station?: MetroMapStation;
  line?: MetroMapLine;
  allLines?: MetroMapLine[];
  routeResult?: GetOriginDestinationDetailResponse;
  onClose: () => void;
}

function normalize(raw: string): string {
  return raw.startsWith('#') ? raw : `#${raw}`;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  return `${mins} 分鐘`;
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

export function StationInfoCard({ station, line, allLines = [], routeResult, onClose }: Props): React.ReactElement {
  const stationDetails = useStationStore((state) => state.stationDetails);
  const isLoading = useStationStore((state) => state.isLoading);

  const transferLines = station && line
    ? allLines.filter(
        (l) => l.letter !== line.letter && l.stations.some((s) => s.nameZhTw === station.nameZhTw)
      )
    : [];
  const isTransfer = transferLines.length > 0;

  const availableFacilities = stationDetails
    ? FACILITY_LABELS.filter(({ key }) => stationDetails[key] !== null)
    : [];

  const fromName =
    routeResult?.route[0]?.stations[0]?.nameZhTw ?? routeResult?.fromStationCode ?? '';
  const lastSeg = routeResult?.route[routeResult.route.length - 1];
  const toName =
    lastSeg?.stations[lastSeg.stations.length - 1]?.nameZhTw ?? routeResult?.toStationCode ?? '';

  return (
    <Card
      elevation={4}
      sx={{
        position: 'absolute',
        bottom: 24,
        left: 24,
        width: routeResult ? 280 : 240,
        zIndex: 10,
        borderRadius: 2,
        maxHeight: 'calc(100% - 48px)',
        overflowY: 'auto',
      }}
    >
      {/* ── 站點資訊模式 ── */}
      {station && line && (
        <CardContent sx={{ '&:last-child': { pb: 2 } }}>
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

          {isTransfer && (
            <Stack direction='row' spacing={0.5} sx={{ mt: 1, alignItems: 'center' }}>
              <SwapHorizIcon sx={{ fontSize: 16, color: 'warning.main' }} />
              <Typography variant='caption' color='warning.main' sx={{ fontWeight: 600 }}>
                可轉乘 {transferLines.length} 條路線
              </Typography>
            </Stack>
          )}

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
      )}

      {/* ── 路徑查詢結果模式 ── */}
      {routeResult && (
        <CardContent sx={{ '&:last-child': { pb: 2 } }}>
          <Stack direction='row' sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant='body2' sx={{ fontWeight: 700 }}>
              路徑查詢結果
            </Typography>
            <IconButton size='small' onClick={onClose} sx={{ mt: -0.5, mr: -0.5 }}>
              <CloseIcon fontSize='small' />
            </IconButton>
          </Stack>

          <Typography variant='caption' color='text.secondary'>
            {fromName} → {toName}
          </Typography>

          <Divider sx={{ my: 1 }} />

          <Stack spacing={0.75}>
            {routeResult.route.map((segment, index) => (
              <Box key={`${segment.lineCode}-${index}`}>
                <Stack direction='row' sx={{ alignItems: 'flex-start', gap: 0.75 }}>
                  <Chip
                    label={segment.lineCode}
                    size='small'
                    sx={{
                      backgroundColor: normalize(segment.lineColor),
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: 11,
                      height: 20,
                      minWidth: 32,
                      flexShrink: 0,
                    }}
                  />
                  <Box>
                    <Typography variant='caption' sx={{ fontWeight: 600, display: 'block', lineHeight: 1.3 }}>
                      {segment.lineNameZhTw}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      {segment.stations.length} 站・{formatTime(segment.segmentTimeSeconds)}
                    </Typography>
                  </Box>
                </Stack>
                {index < routeResult.route.length - 1 && (
                  <Stack direction='row' sx={{ alignItems: 'center', ml: 0.5, mt: 0.5, mb: 0.25 }}>
                    <SwapHorizIcon
                      sx={{ fontSize: 13, color: 'warning.main', transform: 'rotate(90deg)' }}
                    />
                    <Typography variant='caption' color='warning.main' sx={{ fontSize: 10, ml: 0.25 }}>
                      轉乘
                    </Typography>
                  </Stack>
                )}
              </Box>
            ))}
          </Stack>

          <Divider sx={{ my: 1 }} />

          <Stack direction='row' sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant='caption' color='text.secondary'>
              轉乘 {routeResult.transferCount} 次
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              {formatTime(routeResult.totalTravelTimeSeconds)}
            </Typography>
            <Typography variant='caption' sx={{ fontWeight: 700, color: 'primary.main' }}>
              NT${routeResult.farePrice}
            </Typography>
          </Stack>
        </CardContent>
      )}
    </Card>
  );
}
