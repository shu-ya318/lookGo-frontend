import { useState } from 'react';
import dayjs from 'dayjs';
import { enqueueSnackbar } from 'notistack';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';

import { UpdateTripPlanNameDialog } from '@/components/tripPlan/UpdateTripPlanNameDialog';

import { useStationBookmarkStore } from '@/stores/stationBookmarkStore';
import { useUserStore } from '@/stores/userStore';

import {
  FARE_TYPE_LABELS,
  ROUTING_STRATEGY_LABELS,
} from '@/services/metro/types';
import { getExcelByTripPlanId } from '@/services/tripPlan';

import { formatDateTime } from '@/utils/date';

import type { TripPlan } from '@/services/tripPlan/interface';

const CARD_HEIGHT = '20rem';

interface TripPlanCardProps {
  tripPlan: TripPlan;
  onClick: (tripPlan: TripPlan) => void;
  onDelete: (tripPlan: TripPlan) => void;
  onUpdated: (tripPlan: TripPlan) => void;
}

export const TripPlanCard = ({
  tripPlan,
  onClick,
  onDelete,
  onUpdated,
}: TripPlanCardProps) => {
  const username = useUserStore((state) => state.userInfo?.username);

  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [nameDialogSessionId, setNameDialogSessionId] = useState(0);
  const [isNameDialogOpen, setIsNameDialogOpen] = useState(false);

  const bookmarks = useStationBookmarkStore((state) => state.bookmarks);
  const toggleBookmark = useStationBookmarkStore(
    (state) => state.toggleBookmark,
  );

  const travelMinutes = Math.ceil(tripPlan.travelTimeSeconds / 60);

  const isFromBookmarked = bookmarks.some(
    (bookmark) => bookmark.stationId === tripPlan.fromStationId,
  );
  const isToBookmarked = bookmarks.some(
    (bookmark) => bookmark.stationId === tripPlan.toStationId,
  );

  const routingLabel =
    ROUTING_STRATEGY_LABELS[tripPlan.routingStrategy] ?? '最少轉乘次數';

  const handleOpenNameDialog = () => {
    setNameDialogSessionId((prev) => prev + 1);
    setIsNameDialogOpen(true);
  };

  const handleNameSaved = (updated: TripPlan) => {
    onUpdated(updated);
    setIsNameDialogOpen(false);
  };

  const handleExportExcel = async () => {
    setIsExportingExcel(true);

    try {
      const blob = await getExcelByTripPlanId({ tripPlanId: tripPlan.id });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.setAttribute(
        'download',
        `${username}_${tripPlan.name}_${dayjs().format('YYYYMMDD')}.xlsx`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      enqueueSnackbar('匯出成功', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar((error as string) || '匯出失敗', { variant: 'error' });
    } finally {
      setIsExportingExcel(false);
    }
  };

  return (
    <Card
      elevation={4}
      sx={{
        height: CARD_HEIGHT,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
      }}
    >
      {/* 卡片內容 */}
      <CardContent
        sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      >
        {/* 標題與刪除按鈕 */}
        <Stack
          direction='row'
          sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}
        >
          {/* 旅程名稱與編輯按鈕 */}
          <Stack
            direction='row'
            sx={{ alignItems: 'center', gap: 0.25, minWidth: 0 }}
          >
            <Typography
              variant='body1'
              noWrap
              sx={{ fontWeight: 700, lineHeight: 1.3, minWidth: 0 }}
            >
              {tripPlan.name}
            </Typography>
            <IconButton
              size='small'
              onClick={handleOpenNameDialog}
              sx={{ p: 0.25, flexShrink: 0 }}
            >
              <EditOutlinedIcon fontSize='small' />
            </IconButton>
          </Stack>
          {/* 刪除按鈕 */}
          <IconButton
            size='small'
            onClick={() => onDelete(tripPlan)}
            sx={{ mt: -0.5, mr: -0.5, flexShrink: 0 }}
          >
            <DeleteOutlinedIcon fontSize='small' />
          </IconButton>
        </Stack>
        {/* 起點與結束車站 */}
        <Stack
          direction='row'
          sx={{ alignItems: 'center', gap: 0.25, mt: 0.5, minWidth: 0 }}
        >
          {/* 起始車站 */}
          <Typography variant='subtitle2' noWrap sx={{ minWidth: 0 }}>
            {tripPlan.fromStationNameZhTw}
          </Typography>
          <IconButton
            size='small'
            onClick={() => toggleBookmark(tripPlan.fromStationId)}
            sx={{ p: 0.25, flexShrink: 0 }}
          >
            {isFromBookmarked ? (
              <BookmarkIcon fontSize='small' color='primary' />
            ) : (
              <BookmarkBorderIcon fontSize='small' />
            )}
          </IconButton>
          {/* 箭頭 */}
          <ArrowForwardIcon
            fontSize='small'
            sx={{ color: 'text.secondary', flexShrink: 0, mx: 0.25 }}
          />
          {/* 終點車站 */}
          <Typography variant='subtitle2' noWrap sx={{ minWidth: 0 }}>
            {tripPlan.toStationNameZhTw}
          </Typography>
          <IconButton
            size='small'
            onClick={() => toggleBookmark(tripPlan.toStationId)}
            sx={{ p: 0.25, flexShrink: 0 }}
          >
            {isToBookmarked ? (
              <BookmarkIcon fontSize='small' color='primary' />
            ) : (
              <BookmarkBorderIcon fontSize='small' />
            )}
          </IconButton>
        </Stack>
        <Divider sx={{ my: 1 }} />
        {/* 票價與車程 */}
        <Stack direction='row' sx={{ justifyContent: 'space-between' }}>
          {/* 票價種類 */}
          <Typography variant='caption' color='text.secondary'>
            {FARE_TYPE_LABELS[tripPlan.fareType] ?? '全票'}
          </Typography>
          {/* 票價 */}
          <Typography variant='caption' sx={{ fontWeight: 700 }}>
            NT${tripPlan.farePrice}
          </Typography>
        </Stack>
        {/* 車程 */}
        <Stack direction='row' sx={{ justifyContent: 'space-between' }}>
          {/* 路徑規劃策略 */}
          <Typography variant='caption' color='text.secondary' noWrap>
            車程（{routingLabel}）
          </Typography>
          {/* 車程時間 */}
          <Typography
            variant='caption'
            sx={{ fontWeight: 700, flexShrink: 0, ml: 1 }}
          >
            {travelMinutes} 分鐘
          </Typography>
        </Stack>
        <Divider sx={{ my: 1 }} />
        {/* 筆記 */}
        <Box sx={{ flexGrow: 1, minHeight: 0 }}>
          <Typography
            variant='caption'
            color='text.secondary'
            sx={{ display: 'block', mb: 0.5, fontWeight: 600 }}
          >
            筆記
          </Typography>
          <Tooltip
            title={tripPlan.notes || ''}
            disableHoverListener={!tripPlan.notes}
          >
            <Typography
              variant='body2'
              color={tripPlan.notes ? 'text.primary' : 'text.disabled'}
              sx={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {tripPlan.notes || '尚無筆記'}
            </Typography>
          </Tooltip>
        </Box>
        <Divider sx={{ my: 1 }} />
        {/* 更新時間 */}
        <Typography variant='caption' sx={{ color: 'text.secondary' }}>
          更新時間：{formatDateTime(tripPlan.updatedAt)}
        </Typography>
        {/* 匯出 Excel 與編輯旅程資訊按鈕 */}
        <Stack direction='row' sx={{ gap: 1, mt: 1 }}>
          {/* 匯出 Excel 按鈕 */}
          <Button
            size='small'
            variant='outlined'
            color='neutral'
            startIcon={<FileDownloadOutlinedIcon fontSize='small' />}
            loading={isExportingExcel}
            onClick={handleExportExcel}
          >
            匯出 Excel
          </Button>
          {/* 編輯旅程資訊按鈕 */}
          <Button
            size='small'
            variant='contained'
            sx={{ backgroundColor: 'primary.main' }}
            startIcon={<EditOutlinedIcon fontSize='small' />}
            onClick={() => onClick(tripPlan)}
          >
            編輯旅程資訊
          </Button>
        </Stack>
      </CardContent>
      {/* 更新旅程名稱對話框 */}
      <UpdateTripPlanNameDialog
        key={nameDialogSessionId}
        isOpen={isNameDialogOpen}
        onClose={() => setIsNameDialogOpen(false)}
        tripPlan={tripPlan}
        onSaved={handleNameSaved}
      />
    </Card>
  );
};
