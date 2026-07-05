import type { RefObject } from 'react';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import SendIcon from '@mui/icons-material/Send';

import { formatDateTime } from '@/utils/date';

import type { StationDetails } from '@/services/metro/interface';
import type { StationChatMessage } from '@/services/stationChat/interface';
import type { GetCurrentUserResponse } from '@/services/user/interface';

interface MessageSectionProps {
    selectedStation: StationDetails | null;
    messages: StationChatMessage[];
    isLoadingMessages: boolean;
    hasMore: boolean;
    isLoadingMore: boolean;
    onLoadMoreMessages: () => void;
    currentUser: GetCurrentUserResponse | null;
    onDeleteMessage: (messageId: number) => void;
    messageListRef: RefObject<HTMLDivElement | null>;
    inputMessage: string;
    onInputMessageChange: (value: string) => void;
    onKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) => void;
    onSend: () => void;
}

export const MessageSection = ({
    selectedStation,
    messages,
    isLoadingMessages,
    hasMore,
    isLoadingMore,
    onLoadMoreMessages,
    currentUser,
    onDeleteMessage,
    messageListRef,
    inputMessage,
    onInputMessageChange,
    onKeyDown,
    onSend,
}: MessageSectionProps) => {
    const canDeleteMessage = (message: StationChatMessage): boolean =>
        message.username === currentUser?.username ||
        currentUser?.role === 'ADMIN';

    return (
        <>
            {/* 訊息區 */}
            <Stack
                ref={messageListRef}
                sx={{
                    backgroundColor: theme =>
                        alpha(theme.palette.primary.main, 0.06),
                    minHeight: 400,
                    maxHeight: 500,
                    overflowY: 'auto',
                    px: 3,
                    py: 3,
                    gap: 3,
                }}
            >
                {!selectedStation ? (
                    <Stack
                        sx={{
                            flex: 1,
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <Typography variant='body1' color='text.secondary'>
                            請選擇車站以進入聊天室
                        </Typography>
                    </Stack>
                ) : isLoadingMessages ? (
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
                        }}
                    >
                        <Typography variant='body1' color='text.secondary'>
                            目前還沒有任何訊息
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
                                    disabled={isLoadingMore}
                                    startIcon={
                                        isLoadingMore ? (
                                            <CircularProgress size='0.875rem' />
                                        ) : undefined
                                    }
                                >
                                    載入更早的訊息
                                </Button>
                            </Stack>
                        )}

                        {messages.map(message => {
                            const isSelf =
                                message.username === currentUser?.username;
                            const isTripPlan = message.chatType === 'TRIP_PLAN';
                            const hasTripDetail =
                                isTripPlan &&
                                !!message.fromStationName &&
                                !!message.toStationName;

                            return (
                                <Stack
                                    key={message.id}
                                    direction='row'
                                    sx={{
                                        justifyContent: isSelf
                                            ? 'flex-end'
                                            : 'flex-start',
                                        gap: 1.5,
                                    }}
                                >
                                    {!isSelf && (
                                        <Avatar
                                            sx={{
                                                width: 36,
                                                height: 36,
                                                backgroundColor:
                                                    'primary.light',
                                                flexShrink: 0,
                                            }}
                                        >
                                            <PersonOutlinedIcon fontSize='small' />
                                        </Avatar>
                                    )}
                                    <Stack
                                        sx={{
                                            maxWidth: '55%',
                                            gap: 0.5,
                                            alignItems: isSelf
                                                ? 'flex-end'
                                                : 'flex-start',
                                        }}
                                    >
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
                                            >
                                                {message.username}
                                            </Typography>
                                            {canDeleteMessage(message) && (
                                                <IconButton
                                                    size='small'
                                                    onClick={() =>
                                                        onDeleteMessage(
                                                            message.id
                                                        )
                                                    }
                                                    sx={{ p: 0.25 }}
                                                >
                                                    <DeleteOutlinedIcon
                                                        sx={{
                                                            fontSize:
                                                                '0.875rem',
                                                        }}
                                                    />
                                                </IconButton>
                                            )}
                                        </Stack>

                                        {isTripPlan ? (
                                            hasTripDetail ? (
                                                <Card
                                                    sx={{
                                                        backgroundColor:
                                                            'background.paper',
                                                        boxShadow: 'none',
                                                        border: '1px solid',
                                                        borderColor: 'divider',
                                                        width: '100%',
                                                    }}
                                                >
                                                    <CardContent
                                                        sx={{
                                                            '&:last-child': {
                                                                pb: 2,
                                                            },
                                                        }}
                                                    >
                                                        <Typography
                                                            variant='body2'
                                                            sx={{
                                                                fontWeight: 700,
                                                            }}
                                                        >
                                                            {
                                                                message.fromStationName
                                                            }{' '}
                                                            →{' '}
                                                            {
                                                                message.toStationName
                                                            }
                                                        </Typography>
                                                        <Typography
                                                            variant='caption'
                                                            color='text.secondary'
                                                        >
                                                            {message.transferCount !==
                                                                null
                                                                ? `轉乘 ${message.transferCount} 次`
                                                                : ''}
                                                            {message.farePrice !==
                                                                null
                                                                ? ` · 票價 ${message.farePrice} 元`
                                                                : ''}
                                                        </Typography>
                                                    </CardContent>
                                                </Card>
                                            ) : (
                                                <Box
                                                    sx={{
                                                        backgroundColor:
                                                            'background.paper',
                                                        borderRadius: 2,
                                                        px: 2,
                                                        py: 1.5,
                                                    }}
                                                >
                                                    <Typography
                                                        variant='body2'
                                                        color='text.secondary'
                                                    >
                                                        {message.content ??
                                                            '該旅程分享已被移除'}
                                                    </Typography>
                                                </Box>
                                            )
                                        ) : (
                                            <Box
                                                sx={{
                                                    backgroundColor:
                                                        'background.paper',
                                                    borderRadius: 2,
                                                    px: 2,
                                                    py: 1.5,
                                                }}
                                            >
                                                <Typography variant='body2'>
                                                    {message.content}
                                                </Typography>
                                            </Box>
                                        )}

                                        <Typography
                                            variant='caption'
                                            color='text.secondary'
                                            sx={{ fontSize: '0.65rem' }}
                                        >
                                            {formatDateTime(message.createdAt)}
                                        </Typography>
                                    </Stack>
                                    {isSelf && (
                                        <Avatar
                                            sx={{
                                                width: 36,
                                                height: 36,
                                                backgroundColor:
                                                    'primary.light',
                                                flexShrink: 0,
                                            }}
                                        >
                                            <PersonOutlinedIcon fontSize='small' />
                                        </Avatar>
                                    )}
                                </Stack>
                            );
                        })}
                    </>
                )}
            </Stack>
            {/* 輸入列 */}
            <Stack
                direction='row'
                sx={{
                    alignItems: 'center',
                    px: 2,
                    py: 1.5,
                    backgroundColor: 'background.paper',
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    gap: 1,
                }}
            >
                <Tooltip title='旅程分享功能尚未開放'>
                    <span>
                        <Button
                            startIcon={<AttachFileIcon />}
                            size='small'
                            color='inherit'
                            disabled
                            sx={{ flexShrink: 0 }}
                        >
                            分享旅程
                        </Button>
                    </span>
                </Tooltip>

                <Divider orientation='vertical' flexItem sx={{ mx: 0.5 }} />

                <TextField
                    value={inputMessage}
                    onChange={event =>
                        onInputMessageChange(event.target.value)
                    }
                    onKeyDown={onKeyDown}
                    placeholder={
                        selectedStation ? '請輸入訊息' : '請先選擇車站'
                    }
                    size='small'
                    fullWidth
                    variant='standard'
                    disabled={!selectedStation}
                    slotProps={{
                        input: { disableUnderline: true },
                    }}
                />

                <Button
                    endIcon={<SendIcon />}
                    size='small'
                    color='inherit'
                    onClick={onSend}
                    disabled={!selectedStation || !inputMessage.trim()}
                    sx={{ flexShrink: 0 }}
                >
                    送出訊息
                </Button>
            </Stack>
        </>
    );
};
