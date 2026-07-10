import { useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import CloseIcon from '@mui/icons-material/Close';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';

import { StationFacilityList } from '@/components/StationFacilityList';

import { useStationStore } from '@/stores/stationStore';
import { useStationBookmarkStore } from '@/stores/stationBookmarkStore';

import { normalizeHexColor } from '@/utils/route';

import type { MetroMapLine, MetroMapStation } from '@/services/metro/interface';

interface StationInfoCardProps {
  station: MetroMapStation;
  line: MetroMapLine;
  allLines: MetroMapLine[];
  onClose: () => void;
}

export const StationInfoCard = ({
  station,
  line,
  allLines,
  onClose,
}: StationInfoCardProps) => {
  const stationDetail = useStationStore((state) => state.stationDetail);
  const isStationLoading = useStationStore((state) => state.isStationLoading);
  const bookmarks = useStationBookmarkStore((state) => state.bookmarks);

  const fetchAllBookmark = useStationBookmarkStore(
    (state) => state.fetchAllBookmark
  );
  const toggleBookmark = useStationBookmarkStore(
    (state) => state.toggleBookmark
  );

  useEffect(() => {
    fetchAllBookmark();
  }, [fetchAllBookmark]);

  const isBookmarked = bookmarks.some(
    (bookmark) => bookmark.stationId === station.stationId
  );

  const transferLines = allLines.filter(
    (lines) =>
      lines.letter !== line.letter &&
      lines.stations.some((station) => station.nameZhTw === station.nameZhTw)
  );

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
        maxHeight: 'calc(100% - 48px)',
        overflowY: 'auto',
      }}
    >
      <CardContent sx={{ '&:last-child': { pb: 2 } }}>
        {/* 站名與書籤 */}
        <Stack
          direction='row'
          sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}
        >
          <Box>
            <Stack direction='row' sx={{ alignItems: 'center', gap: 0.25 }}>
              <Typography
                variant='body1'
                sx={{ fontWeight: 700, lineHeight: 1.3 }}
              >
                {station.nameZhTw}
              </Typography>
              <IconButton
                size='small'
                onClick={() => toggleBookmark(station.stationId)}
                sx={{ p: 0.25 }}
              >
                {isBookmarked ? (
                  <BookmarkIcon fontSize='small' color='primary' />
                ) : (
                  <BookmarkBorderIcon fontSize='small' />
                )}
              </IconButton>
            </Stack>
            <Typography variant='caption' color='text.secondary'>
              {station.nameEn}
            </Typography>
          </Box>
          <IconButton
            size='small'
            onClick={onClose}
            sx={{ mt: -0.5, mr: -0.5 }}
          >
            <CloseIcon fontSize='small' />
          </IconButton>
        </Stack>
        <Divider sx={{ my: 1 }} />
        {/* 所屬路線與可轉乘路線 */}
        <Stack direction='row' sx={{ flexWrap: 'wrap', gap: 0.75 }}>
          <Chip
            label={`${station.stationCode} ${line.nameZhTw}`}
            size='small'
            sx={{
              backgroundColor: normalizeHexColor(line.color),
              color: '#fff',
              fontWeight: 700,
              fontSize: 11,
            }}
          />
          {transferLines.map((transferLine) => {
            const transferStation = transferLine.stations.find(
              (station) => station.nameZhTw === station.nameZhTw
            );
            return (
              <Chip
                key={transferLine.letter}
                label={`${transferStation?.stationCode ?? transferLine.letter} ${transferLine.nameZhTw}`}
                size='small'
                sx={{
                  backgroundColor: normalizeHexColor(transferLine.color),
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 11,
                }}
              />
            );
          })}
        </Stack>
        {/* 可轉乘的提示訊息 */}
        {transferLines.length > 0 && (
          <Stack
            direction='row'
            spacing={0.5}
            sx={{ mt: 1, alignItems: 'center' }}
          >
            <SwapHorizIcon sx={{ fontSize: 16, color: 'warning.main' }} />
            <Typography
              variant='caption'
              color='warning.main'
              sx={{ fontWeight: 600 }}
            >
              可轉乘 {transferLines.length} 條路線
            </Typography>
          </Stack>
        )}
        <Divider sx={{ my: 1 }} />
        {/* 車站設備 */}
        {isStationLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
            <CircularProgress size={20} />
          </Box>
        ) : (
          stationDetail && <StationFacilityList facilities={stationDetail} />
        )}
      </CardContent>
    </Card>
  );
};
