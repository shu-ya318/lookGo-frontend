import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import SendIcon from '@mui/icons-material/Send';

import { MessageBubble } from '@/components/stationChat/MessageBubble';

import { UserRole } from '@/services/user/types';

import type { RefObject } from 'react';
import type { StationDetail } from '@/services/metro/interface';
import type { StationChatMessage } from '@/services/stationChat/interface';
import type { GetCurrentUserResponse } from '@/services/user/interface';

interface MessageSectionProps {
  selectedStation: StationDetail | null;
  messages: StationChatMessage[];
  isMessagesLoading: boolean;
  hasMore: boolean;
  isMoreMessagesLoading: boolean;
  onLoadMoreMessages: () => void;
  currentUser: GetCurrentUserResponse | null;
  onDeleteMessage: (messageId: number) => void;
  messageListRef: RefObject<HTMLDivElement | null>;
  inputMessage: string;
  onInputMessageChange: (value: string) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) => void;
  onSend: () => void;
  onOpenShareTripPlan: () => void;
}

export const MessageSection = ({
  selectedStation,
  messages,
  isMessagesLoading,
  hasMore,
  isMoreMessagesLoading,
  onLoadMoreMessages,
  currentUser,
  onDeleteMessage,
  messageListRef,
  inputMessage,
  onInputMessageChange,
  onKeyDown,
  onSend,
  onOpenShareTripPlan,
}: MessageSectionProps) => {
  const canDeleteMessage = (message: StationChatMessage) =>
    message.username === currentUser?.username ||
    currentUser?.role === UserRole.ADMIN;

  return (
    <Stack
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        backgroundColor: 'rgba(95, 166, 240, 0.03)',
      }}
    >
      {/* 訊息區 */}
      <Stack
        ref={messageListRef}
        sx={{
          flex: 1,
          overflowY: 'auto',
          px: { xs: 2, md: 3 },
          py: 3,
          gap: 3,
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(0,0,0,0.1)',
            borderRadius: '10px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: 'rgba(0,0,0,0.2)',
          },
        }}
      >
        {/* 尚未選取車站 */}
        {!selectedStation ? (
          <Stack
            sx={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Typography
              variant='body2'
              sx={{ color: 'text.disabled', letterSpacing: 0.5 }}
            >
              請選擇車站以進入聊天室
            </Typography>
          </Stack>
        ) : isMessagesLoading ? (
          <Stack
            sx={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <CircularProgress size='2rem' />
          </Stack>
        ) : messages.length === 0 ? (
          <Stack
            sx={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Typography
              variant='body2'
              sx={{ color: 'text.disabled', letterSpacing: 0.5 }}
            >
              目前還沒有任何訊息，來說第一句話吧！
            </Typography>
          </Stack>
        ) : (
          <>
            {hasMore && (
              <Stack
                sx={{
                  alignItems: 'center',
                  pb: 1,
                }}
              >
                <Button
                  size='small'
                  onClick={onLoadMoreMessages}
                  disabled={isMoreMessagesLoading}
                  startIcon={
                    isMoreMessagesLoading ? (
                      <CircularProgress size='0.875rem' />
                    ) : undefined
                  }
                  sx={{
                    borderRadius: '20px',
                    px: 2.5,
                    fontSize: '0.75rem',
                    color: '#5fa6f0',
                    border: '1px solid',
                    borderColor: 'rgba(95,166,240,0.3)',
                    '&:hover': {
                      backgroundColor: 'rgba(95,166,240,0.06)',
                    },
                  }}
                >
                  載入更早的訊息
                </Button>
              </Stack>
            )}

            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isSelf={message.username === currentUser?.username}
                canDelete={canDeleteMessage(message)}
                onDelete={onDeleteMessage}
              />
            ))}
          </>
        )}
      </Stack>

      {/* 輸入區外層容器 - 負責浮動視覺與 RWD */}
      <Box
        sx={{
          px: { xs: 2, md: 3 },
          py: 2,
          backgroundColor: 'transparent',
        }}
      >
        <Stack
          direction='row'
          sx={{
            alignItems: 'center',
            px: 2,
            py: 1,
            backgroundColor: 'background.paper',
            borderRadius: '30px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            gap: 1,
          }}
        >
          <Tooltip title='分享旅程規劃'>
            <span>
              <IconButton
                size='small'
                color='inherit'
                disabled={!selectedStation}
                onClick={onOpenShareTripPlan}
                sx={{ flexShrink: 0 }}
              >
                <AttachFileIcon fontSize='small' />
              </IconButton>
            </span>
          </Tooltip>

          <Divider orientation='vertical' flexItem sx={{ mx: 0.5, my: 1 }} />

          <TextField
            value={inputMessage}
            onChange={(event) => onInputMessageChange(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder={
              selectedStation ? '請輸入內容（僅接受文字訊息）' : '請先選擇車站'
            }
            size='small'
            fullWidth
            variant='standard'
            disabled={!selectedStation}
            slotProps={{
              input: { disableUnderline: true },
            }}
            sx={{ ml: 1 }}
          />

          <IconButton
            size='small'
            onClick={onSend}
            disabled={!selectedStation || !inputMessage.trim()}
            sx={{
              flexShrink: 0,
              background:
                !selectedStation || !inputMessage.trim()
                  ? 'auto'
                  : 'linear-gradient(to right, #5fa6f0, #6de69d)',
              color:
                !selectedStation || !inputMessage.trim()
                  ? 'action.disabled'
                  : 'white',
              '&:hover': {
                opacity: 0.9,
              },
            }}
          >
            <SendIcon fontSize='small' />
          </IconButton>
        </Stack>
      </Box>
    </Stack>
  );
};
