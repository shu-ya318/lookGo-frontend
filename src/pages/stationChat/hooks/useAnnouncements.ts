import { useCallback, useEffect, useState } from 'react';
import { enqueueSnackbar } from 'notistack';

import { getAnnouncementByStationId } from '@/services/stationChat';

import type { StationDetail } from '@/services/metro/interface';
import type { StationChatAnnouncement } from '@/services/stationChat/interface';

const ANNOUNCEMENT_PAGE_SIZE = 5;

interface UseAnnouncementsResult {
    announcements: StationChatAnnouncement[];
    isAnnouncementExpanded: boolean;
    announcementPage: number;
    announcementTotalPages: number;
    isMoreAnnouncementsLoading: boolean;
    toggleAnnouncementExpanded: () => void;
    refetchAnnouncements: () => Promise<void>;
    handleLoadMoreAnnouncements: () => Promise<void>;
}

/* 管理車站公告。
* 處理載入／分頁／展開狀態，並提供公告異動後的自動重新載入。
*/
export const useAnnouncements = (
    selectedStation: StationDetail | null
): UseAnnouncementsResult => {
    const [announcements, setAnnouncements] = useState<
        StationChatAnnouncement[]
    >([]);
    const [isAnnouncementExpanded, setIsAnnouncementExpanded] = useState(false);
    const [announcementPage, setAnnouncementPage] = useState(0);
    const [announcementTotalPages, setAnnouncementTotalPages] = useState(0);
    const [isMoreAnnouncementsLoading, setIsMoreAnnouncementsLoading] =
        useState(false);

    useEffect(() => {
        // 切換車站時，收合公告列
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsAnnouncementExpanded(false);

        if (!selectedStation) {
            setAnnouncements([]);
            setAnnouncementPage(0);
            setAnnouncementTotalPages(0);
            return;
        }

        let isCancelled = false;

        const init = async () => {
            try {
                const response = await getAnnouncementByStationId({
                    stationId: selectedStation.id,
                    page: 0,
                    size: ANNOUNCEMENT_PAGE_SIZE,
                });

                if (isCancelled) return;

                setAnnouncements(
                    Array.isArray(response.content) ? response.content : []
                );
                setAnnouncementPage(0);
                setAnnouncementTotalPages(response.totalPages);
            } catch (error) {
                if (!isCancelled) {
                    enqueueSnackbar((error as string) || '取得公告失敗', {
                        variant: 'error',
                    });
                }
            }
        };

        init();

        return () => {
            isCancelled = true;
        };
    }, [selectedStation]);

    // 當新增／編輯／刪除公告成功後，重新載入第一頁
    const refetchAnnouncements = useCallback(async () => {
        if (!selectedStation) return;

        try {
            const response = await getAnnouncementByStationId({
                stationId: selectedStation.id,
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
    }, [selectedStation]);

    const handleLoadMoreAnnouncements = async () => {
        if (!selectedStation || isMoreAnnouncementsLoading) return;

        const nextPage = announcementPage + 1;

        setIsMoreAnnouncementsLoading(true);

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
            setIsMoreAnnouncementsLoading(false);
        }
    };

    const toggleAnnouncementExpanded = () => {
        setIsAnnouncementExpanded(expanded => !expanded);
    };

    return {
        announcements,
        isAnnouncementExpanded,
        announcementPage,
        announcementTotalPages,
        isMoreAnnouncementsLoading,
        toggleAnnouncementExpanded,
        refetchAnnouncements,
        handleLoadMoreAnnouncements,
    };
};
