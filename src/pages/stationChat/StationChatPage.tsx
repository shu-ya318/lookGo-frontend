import { useState } from 'react';
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
import { ShareTripPlanDialog } from '@/components/stationChat/ShareTripPlanDialog';
import { UpdateAnnouncementDialog } from '@/components/stationChat/UpdateAnnouncementDialog';

import { useUserStore } from '@/stores/userStore';

import { deleteAnnouncement } from '@/services/stationChat';
import { UserRole } from '@/services/user/types';

import { useAnnouncements } from './hooks/useAnnouncements';
import { useChatMessages } from './hooks/useChatMessages';
import { useExportChatExcel } from './hooks/useExportChatExcel';
import { useStationSelection } from './hooks/useStationSelection';

import type { StationChatAnnouncement } from '@/services/stationChat/interface';
import type { TripPlan } from '@/services/tripPlan/interface';

const StationChatPage = () => {
    const currentUser = useUserStore(state => state.userInfo);
    const isAdmin = currentUser?.role === UserRole.ADMIN;

    /*
     * 因各功能邏輯較複雜且有獨立狀態，拆出 custom hook 來個別管理
    */
    const { selectedStationOption, setSelectedStationOption, selectedStation } =
        useStationSelection();

    const {
        messages,
        isMessagesLoading,
        hasMore,
        isMoreMessagesLoading,
        isConnected,
        inputMessage,
        setInputMessage,
        messageListRef,
        handleLoadMoreMessages,
        handleSend,
        handleKeyDown,
        handleDeleteMessage,
        sendTripPlanMessage,
    } = useChatMessages(selectedStation);

    const {
        announcements,
        isAnnouncementExpanded,
        announcementPage,
        announcementTotalPages,
        isMoreAnnouncementsLoading,
        toggleAnnouncementExpanded,
        refetchAnnouncements,
        handleLoadMoreAnnouncements,
    } = useAnnouncements(selectedStation);

    const { isExportingExcel, handleExportExcel } =
        useExportChatExcel(selectedStation);

    const [isCreateAnnouncementOpen, setIsCreateAnnouncementOpen] =
        useState(false);
    const [editingAnnouncement, setEditingAnnouncement] =
        useState<StationChatAnnouncement | null>(null);
    const [deletingAnnouncement, setDeletingAnnouncement] =
        useState<StationChatAnnouncement | null>(null);
    const [isDeletingAnnouncement, setIsDeletingAnnouncement] = useState(false);

    const [shareTripPlanSessionId, setShareTripPlanSessionId] = useState(0);
    const [isShareTripPlanOpen, setIsShareTripPlanOpen] = useState(false);

    const handleOpenShareTripPlan = () => {
        setShareTripPlanSessionId(prev => prev + 1);
        setIsShareTripPlanOpen(true);
    };

    const handleShareTripPlan = (tripPlan: TripPlan) => {
        sendTripPlanMessage(tripPlan.id);
        setIsShareTripPlanOpen(false);
    };

    const handleDeleteAnnouncement = async () => {
        if (!deletingAnnouncement) return;

        setIsDeletingAnnouncement(true);

        try {
            const response = await deleteAnnouncement({
                announcementId: deletingAnnouncement.id,
            });
            enqueueSnackbar(response.message || '公告刪除成功', { variant: 'success' });
            setDeletingAnnouncement(null);
            await refetchAnnouncements();
        } catch (error) {
            enqueueSnackbar((error as string) || '公告刪除失敗', {
                variant: 'error',
            });
        } finally {
            setIsDeletingAnnouncement(false);
        }
    };

    return (
        <Stack
            sx={{
                width: '100%',
                maxWidth: '1280px',
                margin: { xs: '2rem auto', md: '3.75rem auto' },
                px: { xs: 2, md: 0 },
                gap: 2,
            }}
        >
            <Typography variant='h5' sx={{ fontWeight: 700 }}>
                車站聊天室
            </Typography>
            {/* 選擇車站聊天室 */}
            <Stack
                direction='row'
                sx={{ alignItems: 'center', justifyContent: 'space-between' }}
            >
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
                {/* 匯出當日聊天紀錄按鈕 */}
                {isAdmin && (
                    <Button
                        variant='contained'
                        color='primary'
                        size='medium'
                        startIcon={
                            isExportingExcel ? (
                                <CircularProgress
                                    size='0.875rem'
                                    color='inherit'
                                />
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
            {/* 公告與聊天訊息區域 */}
            <Stack
                sx={{
                    borderRadius: 3,
                    overflow: 'hidden',
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: '0 4px 24px rgba(95, 166, 240, 0.10)',
                    height: {
                        xs: 'calc(100dvh - 200px)',
                        md: 'calc(100dvh - 220px)',
                    },
                    minHeight: 400,
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                {/* 顯示公告列 */}
                {selectedStation && (announcements.length > 0 || isAdmin) && (
                    <AnnouncementSection
                        announcements={announcements}
                        isAdmin={isAdmin}
                        isAnnouncementExpanded={isAnnouncementExpanded}
                        announcementPage={announcementPage}
                        announcementTotalPages={announcementTotalPages}
                        isMoreAnnouncementsLoading={isMoreAnnouncementsLoading}
                        onToggleExpand={toggleAnnouncementExpanded}
                        onAdd={() => setIsCreateAnnouncementOpen(true)}
                        onEdit={setEditingAnnouncement}
                        onDelete={setDeletingAnnouncement}
                        onLoadMore={handleLoadMoreAnnouncements}
                    />
                )}
                {/* 聊天訊息區域 */}
                <MessageSection
                    selectedStation={selectedStation}
                    messages={messages}
                    isMessagesLoading={isMessagesLoading}
                    hasMore={hasMore}
                    isMoreMessagesLoading={isMoreMessagesLoading}
                    onLoadMoreMessages={handleLoadMoreMessages}
                    currentUser={currentUser}
                    onDeleteMessage={handleDeleteMessage}
                    messageListRef={messageListRef}
                    inputMessage={inputMessage}
                    onInputMessageChange={setInputMessage}
                    onKeyDown={handleKeyDown}
                    onSend={handleSend}
                    onOpenShareTripPlan={handleOpenShareTripPlan}
                />
            </Stack>
            {/* 分享旅程規劃對話框 */}
            <ShareTripPlanDialog
                key={shareTripPlanSessionId}
                isOpen={isShareTripPlanOpen}
                onClose={() => setIsShareTripPlanOpen(false)}
                onShare={handleShareTripPlan}
            />
            {/* 公告管理對話框 */}
            {selectedStation && (
                <CreateAnnouncementDialog
                    isOpen={isCreateAnnouncementOpen}
                    onClose={() => setIsCreateAnnouncementOpen(false)}
                    stationId={selectedStation.id}
                    onSuccess={refetchAnnouncements}
                />
            )}
            <UpdateAnnouncementDialog
                isOpen={!!editingAnnouncement}
                onClose={() => setEditingAnnouncement(null)}
                announcement={editingAnnouncement}
                onSuccess={refetchAnnouncements}
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
