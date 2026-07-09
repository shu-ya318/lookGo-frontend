import { useCallback, useEffect, useRef, useState } from 'react';
import { enqueueSnackbar } from 'notistack';

import { getMessageByStationId } from '@/services/stationChat';
import { connectStationChatSocket } from '@/services/stationChat/socket';

import type { KeyboardEvent, RefObject } from 'react';
import type { StationDetails } from '@/services/metro/interface';
import type { StationChatMessage } from '@/services/stationChat/interface';
import type { StationChatSocket } from '@/services/stationChat/socket';

const MESSAGE_PAGE_SIZE = 16;

interface UseChatMessagesResult {
    messages: StationChatMessage[];
    isLoadingMessages: boolean;
    hasMore: boolean;
    isLoadingMore: boolean;
    isConnected: boolean;
    inputMessage: string;
    setInputMessage: (value: string) => void;
    messageListRef: RefObject<HTMLDivElement | null>;
    handleLoadMoreMessages: () => Promise<void>;
    handleSend: () => void;
    handleKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void;
    handleDeleteMessage: (messageId: number) => void;
    sendTripPlanMessage: (tripPlanId: number) => void;
}

// 管理聊天訊息與 WebSocket 連線：訊息載入／分頁、即時事件、發送與刪除訊息
export const useChatMessages = (
    selectedStation: StationDetails | null
): UseChatMessagesResult => {
    const [messages, setMessages] = useState<StationChatMessage[]>([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [inputMessage, setInputMessage] = useState('');

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

    useEffect(() => {
        if (!selectedStation) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setMessages([]);
            setHasMore(false);
            setPage(0);
            return;
        }

        let isCancelled = false;

        const init = async () => {
            setIsLoadingMessages(true);
            try {
                const response = await getMessageByStationId({
                    stationId: selectedStation.id,
                    page: 0,
                    size: MESSAGE_PAGE_SIZE,
                });

                if (isCancelled) return;

                // API 依建立時間新到舊排序，畫面需舊到新（新訊息在下方）
                setMessages([...response.content].reverse());
                setHasMore(response.totalPages > 1);
                setPage(0);
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

    const handleLoadMoreMessages = async () => {
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

            // 維持載入前的閱讀位置，避免畫面跳動
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

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSend();
        }
    };

    const handleDeleteMessage = (messageId: number): void => {
        socketRef.current?.deleteMessage(messageId);
    };

    const sendTripPlanMessage = (tripPlanId: number): void => {
        if (!socketRef.current) return;

        socketRef.current.sendMessage({
            chatType: 'TRIP_PLAN',
            content: null,
            tripPlanId,
        });
    };

    return {
        messages,
        isLoadingMessages,
        hasMore,
        isLoadingMore,
        isConnected,
        inputMessage,
        setInputMessage,
        messageListRef,
        handleLoadMoreMessages,
        handleSend,
        handleKeyDown,
        handleDeleteMessage,
        sendTripPlanMessage,
    };
};
