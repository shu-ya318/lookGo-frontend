import { useCallback, useEffect, useRef, useState } from 'react';
import dayjs from 'dayjs';
import { enqueueSnackbar } from 'notistack';

import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';

import { DeleteDialog } from '@/components/DeleteDialog';
import { StationAutocomplete } from '@/components/StationAutocomplete';
import { AnnouncementSection } from '@/components/stationChat/AnnouncementSection';
import { CreateAnnouncementDialog } from '@/components/stationChat/CreateAnnouncementDialog';
import { MessageSection } from '@/components/stationChat/MessageSection';
import { UpdateAnnouncementDialog } from '@/components/stationChat/UpdateAnnouncementDialog';

import { useUserStore } from '@/stores/userStore';

import { getStationByCode } from '@/services/metro';
import {
    deleteAnnouncement,
    getAnnouncementByStationId,
    getExcelByStationId,
    getMessageByStationId,
} from '@/services/stationChat';
import { connectStationChatSocket } from '@/services/stationChat/socket';

import type { StationDetails, StationOption } from '@/services/metro/interface';
import type {
    StationChatAnnouncement,
    StationChatMessage,
} from '@/services/stationChat/interface';
import type { StationChatSocket } from '@/services/stationChat/socket';

const MESSAGE_PAGE_SIZE = 16;
const ANNOUNCEMENT_PAGE_SIZE = 5;

const StationChatPage = () => {
    const currentUser = useUserStore(state => state.userInfo);

    const [selectedStationOption, setSelectedStationOption] =
        useState<StationOption | null>(null);
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
    const [isExportingExcel, setIsExportingExcel] = useState(false);

    const isAdmin = currentUser?.role === 'ADMIN';

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
        if (!selectedStationOption) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setSelectedStation(null);
            return;
        }

        let isCancelled = false;

        setSelectedStation(null);

        // StationAutocomplete 僅提供 stationCode，聊天室 API 需要的 stationId 需另行查詢
        const resolveStation = async () => {
            try {
                const details = await getStationByCode({
                    stationCode: selectedStationOption.stationCode,
                });
                if (!isCancelled) {
                    setSelectedStation(details);
                }
            } catch (error) {
                if (!isCancelled) {
                    enqueueSnackbar((error as string) || '取得車站資訊失敗', {
                        variant: 'error',
                    });
                    setSelectedStationOption(null);
                }
            }
        };

        resolveStation();

        return () => {
            isCancelled = true;
        };
    }, [selectedStationOption]);

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

    const handleExportExcel = async (): Promise<void> => {
        if (!selectedStation) return;

        setIsExportingExcel(true);
        try {
            const blob = await getExcelByStationId({
                stationId: selectedStation.id,
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');

            link.href = url;
            link.setAttribute(
                'download',
                `${selectedStation.nameZhTw}聊天紀錄_${dayjs().format('YYYYMMDD')}.xlsx`
            );
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            enqueueSnackbar('匯出成功', { variant: 'success' });
        } catch (error) {
            enqueueSnackbar((error as string) || '匯出失敗', {
                variant: 'error',
            });
        } finally {
            setIsExportingExcel(false);
        }
    };

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
            <Stack direction='row' sx={{ alignItems: 'center', justifyContent: 'space-between' }}>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant='body2' sx={{ flexShrink: 0 }}>
                        選擇進入的聊天室
                    </Typography>
                    <StationAutocomplete
                        value={selectedStationOption}
                        onChange={setSelectedStationOption}
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
                </Box>
                {isAdmin && (
                    <Button
                        variant='contained'
                        color='primary'
                        size='small'
                        startIcon={
                            isExportingExcel ? (
                                <CircularProgress size='0.875rem' color='inherit' />
                            ) : (
                                <FileDownloadOutlinedIcon />
                            )
                        }
                        disabled={!selectedStation || isExportingExcel}
                        onClick={handleExportExcel}
                        sx={{ flexShrink: 0 }}
                    >
                        匯出當日聊天紀錄
                    </Button>
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
                    <AnnouncementSection
                        announcements={announcements}
                        isAdmin={isAdmin}
                        isAnnouncementExpanded={isAnnouncementExpanded}
                        announcementPage={announcementPage}
                        announcementTotalPages={announcementTotalPages}
                        isLoadingMoreAnnouncements={
                            isLoadingMoreAnnouncements
                        }
                        onToggleExpand={() =>
                            setIsAnnouncementExpanded(expanded => !expanded)
                        }
                        onAdd={() => setIsCreateAnnouncementOpen(true)}
                        onEdit={setEditingAnnouncement}
                        onDelete={setDeletingAnnouncement}
                        onLoadMore={handleLoadMoreAnnouncements}
                    />
                )}

                <MessageSection
                    selectedStation={selectedStation}
                    messages={messages}
                    isLoadingMessages={isLoadingMessages}
                    hasMore={hasMore}
                    isLoadingMore={isLoadingMore}
                    onLoadMoreMessages={handleLoadMoreMessages}
                    currentUser={currentUser}
                    onDeleteMessage={handleDeleteMessage}
                    messageListRef={messageListRef}
                    inputMessage={inputMessage}
                    onInputMessageChange={setInputMessage}
                    onKeyDown={handleKeyDown}
                    onSend={handleSend}
                />
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
