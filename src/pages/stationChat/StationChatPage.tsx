import { useCallback, useEffect, useRef, useState } from 'react';
import { enqueueSnackbar } from 'notistack';

import Autocomplete from '@mui/material/Autocomplete';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import SendIcon from '@mui/icons-material/Send';

import { DeleteDialog } from '@/components/DeleteDialog';
import { CreateAnnouncementDialog } from '@/components/stationChat/CreateAnnouncementDialog';
import { UpdateAnnouncementDialog } from '@/components/stationChat/UpdateAnnouncementDialog';

import { useUserStore } from '@/stores/userStore';

import { getAllStation } from '@/services/metro';
import {
    deleteAnnouncement,
    getAnnouncementByStationId,
    getMessageByStationId,
} from '@/services/stationChat';
import { connectStationChatSocket } from '@/services/stationChat/socket';

import { formatDateTime } from '@/utils/date';

import type { StationDetails } from '@/services/metro/interface';
import type {
    StationChatAnnouncement,
    StationChatMessage,
} from '@/services/stationChat/interface';
import type { StationChatSocket } from '@/services/stationChat/socket';

const MESSAGE_PAGE_SIZE = 16;
const ANNOUNCEMENT_PAGE_SIZE = 5;

const StationChatPage = () => {
    const currentUser = useUserStore(state => state.userInfo);

    const [stations, setStations] = useState<StationDetails[]>([]);
    const [selectedStation, setSelectedStation] =
        useState<StationDetails | null>(null);

    const [announcements, setAnnouncements] = useState<
        StationChatAnnouncement[]
    >([]);
    const [messages, setMessages] = useState<StationChatMessage[]>([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [inputMessage, setInputMessage] = useState('');

    const [isCreateAnnouncementOpen, setIsCreateAnnouncementOpen] =
        useState(false);
    const [editingAnnouncement, setEditingAnnouncement] =
        useState<StationChatAnnouncement | null>(null);
    const [deletingAnnouncement, setDeletingAnnouncement] =
        useState<StationChatAnnouncement | null>(null);
    const [isDeletingAnnouncement, setIsDeletingAnnouncement] = useState(false);
    const [isAnnouncementExpanded, setIsAnnouncementExpanded] = useState(false);
    const [announcementPage, setAnnouncementPage] = useState(0);
    const [announcementTotalPages, setAnnouncementTotalPages] = useState(0);
    const [isLoadingMoreAnnouncements, setIsLoadingMoreAnnouncements] =
        useState(false);

    const isAdmin = currentUser?.role === 'ADMIN';

    const sortedAnnouncements = [...announcements].sort(
        (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    const [latestAnnouncement, ...restAnnouncements] = sortedAnnouncements;

    const renderAnnouncementItem = (
        announcement: StationChatAnnouncement,
        showToggle: boolean
    ) => (
        <Stack
            key={announcement.id}
            direction='row'
            sx={{
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: 1,
                px: 3,
                py: 1.5,
                borderTop: isAdmin || !showToggle ? '1px solid' : 'none',
                borderColor: 'divider',
            }}
        >
            <Stack direction='row' sx={{ gap: 1, flex: 1 }}>
                <CampaignOutlinedIcon
                    fontSize='small'
                    sx={{
                        color: 'primary.main',
                        mt: '2px',
                        flexShrink: 0,
                    }}
                />
                <Box sx={{ flex: 1 }}>
                    <Typography variant='body2'>
                        {announcement.content}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                        {formatDateTime(announcement.updatedAt)}
                    </Typography>
                </Box>
            </Stack>

            <Stack direction='row' sx={{ flexShrink: 0, alignItems: 'center' }}>
                {isAdmin && (
                    <>
                        <IconButton
                            size='small'
                            onClick={() => setEditingAnnouncement(announcement)}
                        >
                            <EditOutlinedIcon fontSize='small' />
                        </IconButton>
                        <IconButton
                            size='small'
                            onClick={() =>
                                setDeletingAnnouncement(announcement)
                            }
                        >
                            <DeleteOutlinedIcon fontSize='small' />
                        </IconButton>
                    </>
                )}
                {showToggle &&
                    (restAnnouncements.length > 0 ||
                        announcementTotalPages > 1) && (
                        <>
                            {isAnnouncementExpanded && (
                                <Typography
                                    variant='caption'
                                    color='text.secondary'
                                >
                                    {announcementPage + 1} /{' '}
                                    {announcementTotalPages}
                                </Typography>
                            )}
                            <IconButton
                                size='small'
                                onClick={() =>
                                    setIsAnnouncementExpanded(
                                        expanded => !expanded
                                    )
                                }
                            >
                                {isAnnouncementExpanded ? (
                                    <KeyboardArrowUpIcon fontSize='small' />
                                ) : (
                                    <KeyboardArrowDownIcon fontSize='small' />
                                )}
                            </IconButton>
                        </>
                    )}
            </Stack>
        </Stack>
    );

    const socketRef = useRef<StationChatSocket | null>(null);
    const messageListRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = useCallback(() => {
        requestAnimationFrame(() => {
            const container = messageListRef.current;
            if (container) {
                container.scrollTop = container.scrollHeight;
            }
        });
    }, []);

    const fetchAnnouncements = useCallback(
        async (stationId: number): Promise<void> => {
            try {
                const response = await getAnnouncementByStationId({
                    stationId,
                    page: 0,
                    size: ANNOUNCEMENT_PAGE_SIZE,
                });
                setAnnouncements(
                    Array.isArray(response.content) ? response.content : []
                );
                setAnnouncementPage(0);
                setAnnouncementTotalPages(response.totalPages);
            } catch (error) {
                enqueueSnackbar((error as string) || '取得公告失敗', {
                    variant: 'error',
                });
            }
        },
        []
    );

    const handleLoadMoreAnnouncements = async (): Promise<void> => {
        if (!selectedStation || isLoadingMoreAnnouncements) return;

        const nextPage = announcementPage + 1;

        setIsLoadingMoreAnnouncements(true);
        try {
            const response = await getAnnouncementByStationId({
                stationId: selectedStation.id,
                page: nextPage,
                size: ANNOUNCEMENT_PAGE_SIZE,
            });

            setAnnouncements(prev => [
                ...prev,
                ...(Array.isArray(response.content) ? response.content : []),
            ]);
            setAnnouncementPage(nextPage);
            setAnnouncementTotalPages(response.totalPages);
        } catch (error) {
            enqueueSnackbar((error as string) || '載入更多公告失敗', {
                variant: 'error',
            });
        } finally {
            setIsLoadingMoreAnnouncements(false);
        }
    };

    useEffect(() => {
        const fetchStations = async () => {
            try {
                const allStation = await getAllStation();
                setStations(allStation);
            } catch (error) {
                enqueueSnackbar((error as string) || '取得車站列表失敗', {
                    variant: 'error',
                });
            }
        };

        fetchStations();
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsAnnouncementExpanded(false);

        if (!selectedStation) {
            setMessages([]);
            setAnnouncements([]);
            setHasMore(false);
            setPage(0);
            setAnnouncementPage(0);
            setAnnouncementTotalPages(0);
            return;
        }

        let isCancelled = false;

        const init = async () => {
            setIsLoadingMessages(true);
            try {
                const [messageResponse, announcementResponse] =
                    await Promise.all([
                        getMessageByStationId({
                            stationId: selectedStation.id,
                            page: 0,
                            size: MESSAGE_PAGE_SIZE,
                        }),
                        getAnnouncementByStationId({
                            stationId: selectedStation.id,
                            page: 0,
                            size: ANNOUNCEMENT_PAGE_SIZE,
                        }),
                    ]);

                if (isCancelled) return;

                // API 依建立時間新到舊排序，畫面需舊到新（新訊息在下方）
                setMessages([...messageResponse.content].reverse());
                setHasMore(messageResponse.totalPages > 1);
                setPage(0);
                setAnnouncements(
                    Array.isArray(announcementResponse.content)
                        ? announcementResponse.content
                        : []
                );
                setAnnouncementPage(0);
                setAnnouncementTotalPages(announcementResponse.totalPages);
                scrollToBottom();
            } catch (error) {
                if (!isCancelled) {
                    enqueueSnackbar((error as string) || '取得聊天室資料失敗', {
                        variant: 'error',
                    });
                }
            } finally {
                if (!isCancelled) {
                    setIsLoadingMessages(false);
                }
            }
        };

        init();

        socketRef.current = connectStationChatSocket(selectedStation.id, {
            onEvent: event => {
                if (event.eventType === 'NEW' && event.message) {
                    const newMessage = event.message;
                    setMessages(prev => [...prev, newMessage]);
                    scrollToBottom();
                } else if (
                    event.eventType === 'DELETE' &&
                    event.deletedMessageId !== undefined
                ) {
                    const deletedMessageId = event.deletedMessageId;
                    setMessages(prev =>
                        prev.filter(message => message.id !== deletedMessageId)
                    );
                }
            },
            onError: message => {
                enqueueSnackbar(message, { variant: 'error' });
            },
            onConnectionChange: setIsConnected,
        });

        return () => {
            isCancelled = true;
            socketRef.current?.disconnect();
            socketRef.current = null;
        };
    }, [selectedStation, scrollToBottom]);

    const handleLoadMoreMessages = async (): Promise<void> => {
        if (!selectedStation || isLoadingMore) return;

        const container = messageListRef.current;
        const prevScrollHeight = container?.scrollHeight ?? 0;
        const nextPage = page + 1;

        setIsLoadingMore(true);
        try {
            const response = await getMessageByStationId({
                stationId: selectedStation.id,
                page: nextPage,
                size: MESSAGE_PAGE_SIZE,
            });

            setMessages(prev => [...[...response.content].reverse(), ...prev]);
            setHasMore(nextPage + 1 < response.totalPages);
            setPage(nextPage);

            requestAnimationFrame(() => {
                if (container) {
                    container.scrollTop =
                        container.scrollHeight - prevScrollHeight;
                }
            });
        } catch (error) {
            enqueueSnackbar((error as string) || '載入更多訊息失敗', {
                variant: 'error',
            });
        } finally {
            setIsLoadingMore(false);
        }
    };

    const handleSend = (): void => {
        if (!inputMessage.trim() || !socketRef.current) return;

        socketRef.current.sendMessage({
            chatType: 'TEXT',
            content: inputMessage.trim(),
            tripPlanId: null,
        });
        setInputMessage('');
    };

    const handleKeyDown = (
        event: React.KeyboardEvent<HTMLDivElement>
    ): void => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSend();
        }
    };

    const handleDeleteMessage = (messageId: number): void => {
        socketRef.current?.deleteMessage(messageId);
    };

    const handleDeleteAnnouncement = async (): Promise<void> => {
        if (!deletingAnnouncement || !selectedStation) return;

        setIsDeletingAnnouncement(true);
        try {
            const { message } = await deleteAnnouncement({
                announcementId: deletingAnnouncement.id,
            });
            enqueueSnackbar(message || '公告刪除成功', { variant: 'success' });
            setDeletingAnnouncement(null);
            await fetchAnnouncements(selectedStation.id);
        } catch (error) {
            enqueueSnackbar((error as string) || '公告刪除失敗', {
                variant: 'error',
            });
        } finally {
            setIsDeletingAnnouncement(false);
        }
    };

    const canDeleteMessage = (message: StationChatMessage): boolean =>
        message.username === currentUser?.username ||
        currentUser?.role === 'ADMIN';

    return (
        <Stack
            sx={{
                width: '100%',
                maxWidth: '1280px',
                margin: '3.75rem auto',
                gap: 2,
            }}
        >
            <Typography variant='h5'>車站聊天室</Typography>

            {/* 篩選列 */}
            <Stack direction='row' sx={{ alignItems: 'center', gap: 1 }}>
                <Typography variant='body2' sx={{ flexShrink: 0 }}>
                    車站
                </Typography>
                <Autocomplete
                    value={selectedStation}
                    onChange={(_event, newValue) =>
                        setSelectedStation(newValue)
                    }
                    options={stations}
                    getOptionLabel={option => option.nameZhTw}
                    isOptionEqualToValue={(option, value) =>
                        option.id === value.id
                    }
                    renderInput={params => (
                        <TextField
                            {...params}
                            placeholder='選擇或搜尋車站'
                            size='small'
                        />
                    )}
                    sx={{ width: 250 }}
                />
                {selectedStation && (
                    <Chip
                        size='small'
                        label={isConnected ? '即時連線中' : '連線中…'}
                        color={isConnected ? 'success' : 'default'}
                        variant='outlined'
                    />
                )}
            </Stack>

            {/* 聊天區域 */}
            <Stack
                sx={{
                    borderRadius: 2,
                    overflow: 'hidden',
                    border: '1px solid',
                    borderColor: 'divider',
                }}
            >
                {/* 公告列 */}
                {selectedStation && (announcements.length > 0 || isAdmin) && (
                    <Stack sx={{ position: 'relative' }}>
                        <Stack
                            sx={{
                                backgroundColor: theme =>
                                    alpha(theme.palette.primary.main, 0.12),
                            }}
                        >
                            {isAdmin && (
                                <Stack
                                    direction='row'
                                    sx={{
                                        justifyContent: 'flex-end',
                                        px: 3,
                                        py: 1.5,
                                    }}
                                >
                                    <Button
                                        size='small'
                                        variant='contained'
                                        color='primary'
                                        startIcon={<AddIcon />}
                                        onClick={() =>
                                            setIsCreateAnnouncementOpen(true)
                                        }
                                    >
                                        新增公告
                                    </Button>
                                </Stack>
                            )}

                            {latestAnnouncement &&
                                renderAnnouncementItem(
                                    latestAnnouncement,
                                    true
                                )}
                        </Stack>

                        {/* 展開公告：覆蓋於下方訊息區上層，不推擠版面 */}
                        {isAnnouncementExpanded &&
                            (restAnnouncements.length > 0 ||
                                announcementPage + 1 <
                                    announcementTotalPages) && (
                                <Stack
                                    sx={{
                                        position: 'absolute',
                                        top: '100%',
                                        left: 0,
                                        right: 0,
                                        zIndex: 2,
                                        maxHeight: 320,
                                        overflowY: 'auto',
                                        boxShadow: 3,
                                        backgroundColor: theme =>
                                            alpha(
                                                theme.palette.primary.main,
                                                0.12
                                            ),
                                    }}
                                >
                                    {restAnnouncements.map(announcement =>
                                        renderAnnouncementItem(
                                            announcement,
                                            false
                                        )
                                    )}

                                    {announcementPage + 1 <
                                        announcementTotalPages && (
                                        <Stack
                                            sx={{
                                                alignItems: 'center',
                                                py: 1,
                                                borderTop: '1px solid',
                                                borderColor: 'divider',
                                            }}
                                        >
                                            <Button
                                                size='small'
                                                onClick={
                                                    handleLoadMoreAnnouncements
                                                }
                                                disabled={
                                                    isLoadingMoreAnnouncements
                                                }
                                                startIcon={
                                                    isLoadingMoreAnnouncements ? (
                                                        <CircularProgress size='0.875rem' />
                                                    ) : undefined
                                                }
                                            >
                                                載入更多公告
                                            </Button>
                                        </Stack>
                                    )}
                                </Stack>
                            )}
                    </Stack>
                )}

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
                                        onClick={handleLoadMoreMessages}
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
                                const isTripPlan =
                                    message.chatType === 'TRIP_PLAN';
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
                                                            handleDeleteMessage(
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
                                                            borderColor:
                                                                'divider',
                                                            width: '100%',
                                                        }}
                                                    >
                                                        <CardContent
                                                            sx={{
                                                                '&:last-child':
                                                                    { pb: 2 },
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
                                                {formatDateTime(
                                                    message.createdAt
                                                )}
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
                        onChange={event => setInputMessage(event.target.value)}
                        onKeyDown={handleKeyDown}
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
                        onClick={handleSend}
                        disabled={!selectedStation || !inputMessage.trim()}
                        sx={{ flexShrink: 0 }}
                    >
                        送出訊息
                    </Button>
                </Stack>
            </Stack>

            {/* 公告管理 Dialog */}
            {selectedStation && (
                <CreateAnnouncementDialog
                    isOpen={isCreateAnnouncementOpen}
                    onClose={() => setIsCreateAnnouncementOpen(false)}
                    stationId={selectedStation.id}
                    onSuccess={() => fetchAnnouncements(selectedStation.id)}
                />
            )}
            <UpdateAnnouncementDialog
                isOpen={!!editingAnnouncement}
                onClose={() => setEditingAnnouncement(null)}
                announcement={editingAnnouncement}
                onSuccess={() =>
                    selectedStation
                        ? fetchAnnouncements(selectedStation.id)
                        : Promise.resolve()
                }
            />
            <DeleteDialog
                title='刪除公告'
                isOpen={!!deletingAnnouncement}
                isSubmitting={isDeletingAnnouncement}
                onClose={() => setDeletingAnnouncement(null)}
                onDeleteItem={handleDeleteAnnouncement}
            >
                <Typography variant='body2'>
                    確定要刪除這則公告嗎？此操作無法復原。
                </Typography>
            </DeleteDialog>
        </Stack>
    );
};

export default StationChatPage;
