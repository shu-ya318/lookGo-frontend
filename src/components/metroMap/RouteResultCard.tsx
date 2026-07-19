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

import {
  buildRouteChunkMinutes,
  formatTravelTime,
  normalizeHexColor,
} from '@/utils/route';

import {
  FARE_TYPE_LABELS,
  ROUTING_STRATEGY_LABELS,
} from '@/services/metro/types';
import type { GetOriginDestinationDetailsResponse } from '@/services/metro/interface';

interface RouteResultCardProps {
  routeResult: GetOriginDestinationDetailsResponse;
  onClose: () => void;
}

export const RouteResultCard = ({
  routeResult,
  onClose,
}: RouteResultCardProps) => {
  const fromName =
    routeResult.route[0]?.stations[0]?.nameZhTw ?? routeResult.fromStationCode;

  const lastSegment = routeResult.route[routeResult.route.length - 1];
  const toName =
    lastSegment?.stations[lastSegment.stations.length - 1]?.nameZhTw ??
    routeResult.toStationCode;

  // 偶數索引為區段分鐘數、奇數索引為轉乘分鐘數
  const chunkMinutes = buildRouteChunkMinutes(
    routeResult.route.map((segment) => segment.segmentTimeSeconds),
    routeResult.transferTimeSeconds,
    routeResult.totalTravelTimeSeconds
  );

  const summaryRows = [
    {
      label: '票價種類',
      value: FARE_TYPE_LABELS[routeResult.fareType] ?? '全票',
    },
    {
      label: '乘車時間計算依據',
      value:
        ROUTING_STRATEGY_LABELS[routeResult.routingStrategy] ?? '最少轉乘次數',
    },
    { label: '轉乘次數', value: `${routeResult.transferCount} 次` },
    {
      label: '車程時間',
      value: formatTravelTime(routeResult.totalTravelTimeSeconds),
    },
    {
      label: '票價',
      value:
        routeResult.farePrice !== null && routeResult.farePrice !== undefined
          ? `NT$${routeResult.farePrice}`
          : '--',
      isHighlight: true,
    },
  ];

  return (
    <Card
      elevation={4}
      sx={{
        position: 'absolute',
        bottom: 24,
        left: 24,
        width: 280,
        zIndex: 10,
        borderRadius: 2,
        maxHeight: 'calc(100% - 48px)',
        overflowY: 'auto',
      }}
    >
      <CardContent sx={{ '&:last-child': { pb: 2 } }}>
        {/* 標題與起訖站 */}
        <Stack
          direction='row'
          sx={{ justifyContent: 'space-between', alignItems: 'center' }}
        >
          <Typography variant='body2' sx={{ fontWeight: 700 }}>
            路徑查詢結果
          </Typography>
          <IconButton
            size='small'
            onClick={onClose}
            sx={{ mt: -0.5, mr: -0.5 }}
          >
            <CloseIcon fontSize='small' />
          </IconButton>
        </Stack>
        <Typography variant='caption' color='text.secondary'>
          {fromName} → {toName}
        </Typography>
        <Divider sx={{ my: 1 }} />
        {/* 路線區段與轉乘 */}
        <Stack spacing={0.75}>
          {routeResult.route.map((segment, index) => (
            <Box key={`${segment.lineCode}-${index}`}>
              <Stack
                direction='row'
                sx={{ alignItems: 'flex-start', gap: 0.75 }}
              >
                <Chip
                  label={segment.lineCode}
                  size='small'
                  sx={{
                    backgroundColor: normalizeHexColor(segment.lineColor),
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: 11,
                    height: 20,
                    minWidth: 32,
                    flexShrink: 0,
                  }}
                />
                <Box>
                  <Typography
                    variant='caption'
                    sx={{ fontWeight: 600, display: 'block', lineHeight: 1.3 }}
                  >
                    {segment.lineNameZhTw}
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    共 {segment.stations.length} 站・
                    {chunkMinutes[index * 2]} 分鐘
                  </Typography>
                </Box>
              </Stack>
              {index < routeResult.route.length - 1 && (
                <Stack
                  direction='row'
                  sx={{ alignItems: 'center', ml: 0.5, mt: 0.5, mb: 0.25 }}
                >
                  <SwapHorizIcon
                    sx={{
                      fontSize: 13,
                      color: 'warning.main',
                      transform: 'rotate(90deg)',
                    }}
                  />
                  <Typography
                    variant='caption'
                    color='warning.main'
                    sx={{ fontSize: 10, ml: 0.25 }}
                  >
                    轉乘 {chunkMinutes[index * 2 + 1]} 分鐘
                  </Typography>
                </Stack>
              )}
            </Box>
          ))}
        </Stack>
        <Divider sx={{ my: 1 }} />
        {/* 查詢條件與票價 */}
        <Stack spacing={0.5}>
          {summaryRows.map(({ label, value, isHighlight }) => (
            <Stack
              key={label}
              direction='row'
              sx={{ justifyContent: 'space-between', alignItems: 'baseline' }}
            >
              <Typography
                variant='caption'
                color='text.secondary'
                sx={{ fontSize: 11, flexShrink: 0 }}
              >
                {label}
              </Typography>
              <Typography
                variant='caption'
                sx={{
                  fontSize: 11,
                  fontWeight: isHighlight ? 700 : 500,
                  color: isHighlight ? 'primary.main' : 'text.primary',
                  textAlign: 'right',
                  ml: 1,
                }}
              >
                {value}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
};
