import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';

import { DEFAULT_AVATAR_URL } from '@/constants/user';
import { FARE_TYPE_LABELS } from '@/services/metro/types';
import { ChatType } from '@/services/stationChat/types';

import { formatDateTime } from '@/utils/date';

import type { StationChatMessage } from '@/services/stationChat/interface';

interface MessageBubbleProps {
  message: StationChatMessage;
  isSelf: boolean;
  canDelete: boolean;
  onDelete: (messageId: number) => void;
}

export const MessageBubble = ({
  message,
  isSelf,
  canDelete,
  onDelete,
}: MessageBubbleProps) => {
  const isTripPlan = message.chatType === ChatType.TRIP_PLAN;
  const hasTripDetail =
    isTripPlan && !!message.fromStationName && !!message.toStationName;

  const bubbleSx = isSelf
    ? {
        background: 'info.light',
        color: 'text.primary',
        borderRadius: '20px 4px 20px 20px',
        boxShadow: '0 4px 14px rgba(95, 166, 240, 0.2)',
        px: 2,
        py: 1.5,
      }
    : {
        backgroundColor: 'background.paper',
        color: 'text.primary',
        borderRadius: '4px 20px 20px 20px',
        boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
        px: 2,
        py: 1.5,
      };

  return (
    <Stack
      direction='row'
      sx={{
        justifyContent: isSelf ? 'flex-end' : 'flex-start',
        gap: { xs: 1, md: 1.5 },
      }}
    >
      {/* 其他使用者頭像 */}
      {!isSelf && (
        <Avatar
          src={message.avatar ?? DEFAULT_AVATAR_URL}
          sx={{
            width: 44,
            height: 44,
            background: 'primary.light',
            flexShrink: 0,
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          }}
        >
          <PersonOutlinedIcon fontSize='small' />
        </Avatar>
      )}
      <Stack
        sx={{
          maxWidth: { xs: '80%', md: '65%' },
          gap: 0.5,
          alignItems: isSelf ? 'flex-end' : 'flex-start',
        }}
      >
        {/* 使用者名稱與刪除按鈕 */}
        <Stack
          direction='row'
          sx={{
            alignItems: 'center',
            gap: 0.5,
          }}
        >
          <Typography
            variant='caption'
            color='text.secondary'
            sx={{ opacity: 0.8 }}
          >
            {message.username}
          </Typography>
          {canDelete && (
            <IconButton
              size='small'
              onClick={() => onDelete(message.id)}
              sx={{ p: 0.25 }}
            >
              <DeleteOutlinedIcon
                sx={{
                  fontSize: '0.875rem',
                }}
              />
            </IconButton>
          )}
        </Stack>
        {/* 1. 一般文字訊息情形 */}
        {!isTripPlan && (
          <Box sx={bubbleSx}>
            <Typography variant='body2' sx={{ wordBreak: 'break-word' }}>
              {message.content}
            </Typography>
          </Box>
        )}
        {/* 2. 旅程訊息情形，但旅程已刪除 */}
        {isTripPlan && !hasTripDetail && (
          <Box sx={bubbleSx}>
            <Typography variant='body2' sx={{ opacity: 0.8 }}>
              {message.content ?? '該旅程分享已被移除'}
            </Typography>
          </Box>
        )}
        {/* 3. 旅程訊息情形，旅程未刪除 */}
        {isTripPlan && hasTripDetail && (
          <Box
            sx={{
              ...bubbleSx,
              width: '100%',
            }}
          >
            <Typography
              variant='body2'
              sx={{
                fontWeight: 700,
                mb: 0.5,
              }}
            >
              旅程分享
            </Typography>
            <Stack sx={{ gap: 0.25 }}>
              <Typography variant='caption' sx={{ opacity: 0.8 }}>
                {message.fromStationName} → {message.toStationName}
              </Typography>
              <Typography variant='caption' sx={{ opacity: 0.8 }}>
                {(message.fareType !== null &&
                  FARE_TYPE_LABELS[message.fareType]) ||
                  '全票'}{' '}
                ${message.farePrice ?? '--'}元
              </Typography>
              <Typography variant='caption' sx={{ opacity: 0.8 }}>
                轉乘次數 {message.transferCount ?? '--'}次
              </Typography>
              <Typography variant='caption' sx={{ opacity: 0.8 }}>
                車程時間{' '}
                {typeof message.travelTimeSeconds === 'number'
                  ? Math.ceil(message.travelTimeSeconds / 60)
                  : '--'}
                分鐘
              </Typography>
              <Typography
                variant='caption'
                sx={{
                  opacity: 0.8,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                筆記 {message.notes || '--'}
              </Typography>
            </Stack>
          </Box>
        )}
        {/* 發送時間 */}
        <Typography
          variant='caption'
          color='text.secondary'
          sx={{ fontSize: '0.65rem', opacity: 0.7 }}
        >
          {formatDateTime(message.createdAt)}
        </Typography>
      </Stack>
      {/* 自己的頭像 */}
      {isSelf && (
        <Avatar
          src={message.avatar ?? DEFAULT_AVATAR_URL}
          sx={{
            width: 44,
            height: 44,
            backgroundColor: 'primary.main',
            flexShrink: 0,
            boxShadow: '0 2px 8px rgba(95, 166, 240, 0.3)',
          }}
        >
          <PersonOutlinedIcon fontSize='small' />
        </Avatar>
      )}
    </Stack>
  );
};
