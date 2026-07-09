import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

import { formatDateTime } from '@/utils/date';

import type { StationChatAnnouncement } from '@/services/stationChat/interface';

interface AnnouncementSectionProps {
    announcements: StationChatAnnouncement[];
    isAdmin: boolean;
    isAnnouncementExpanded: boolean;
    announcementPage: number;
    announcementTotalPages: number;
    isLoadingMoreAnnouncements: boolean;
    onToggleExpand: () => void;
    onAdd: () => void;
    onEdit: (announcement: StationChatAnnouncement) => void;
    onDelete: (announcement: StationChatAnnouncement) => void;
    onLoadMore: () => void;
}

export const AnnouncementSection = ({
    announcements,
    isAdmin,
    isAnnouncementExpanded,
    announcementPage,
    announcementTotalPages,
    isLoadingMoreAnnouncements,
    onToggleExpand,
    onAdd,
    onEdit,
    onDelete,
    onLoadMore,
}: AnnouncementSectionProps) => {
    const sortedAnnouncements = [...announcements].sort(
        (announcementA, announcementB) =>
            new Date(announcementB.updatedAt).getTime() - new Date(announcementA.updatedAt).getTime()
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
            {/* 公告內容 */}
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
            {/* 管理員功能：編輯、刪除按鈕；一般使用者：展開收合按鈕 */}
            <Stack direction='row' sx={{ flexShrink: 0, alignItems: 'center' }}>
                {isAdmin && (
                    <>
                        <IconButton
                            size='small'
                            onClick={() => onEdit(announcement)}
                        >
                            <EditOutlinedIcon fontSize='small' />
                        </IconButton>
                        <IconButton
                            size='small'
                            onClick={() => onDelete(announcement)}
                        >
                            <DeleteOutlinedIcon fontSize='small' />
                        </IconButton>
                    </>
                )}
                {/* 展開收合按鈕 */}
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
                            <IconButton size='small' onClick={onToggleExpand}>
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

    return (
        <Stack sx={{ position: 'relative' }}>
            {/* 最新公告與管理員功能 */}
            <Stack
                sx={{
                    backgroundColor: 'info.light',
                }}
            >
                {/* 管理員新增公告按鈕 */}
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
                            onClick={onAdd}
                        >
                            新增公告
                        </Button>
                    </Stack>
                )}
                {/* 最新公告 */}
                {latestAnnouncement &&
                    renderAnnouncementItem(latestAnnouncement, true)}
            </Stack>
            {/* 展開公告 */}
            {isAnnouncementExpanded &&
                (restAnnouncements.length > 0 ||
                    announcementPage + 1 < announcementTotalPages) && (
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
                            backgroundColor: 'info.light',
                        }}
                    >
                        {restAnnouncements.map(announcement =>
                            renderAnnouncementItem(announcement, false)
                        )}

                        {announcementPage + 1 < announcementTotalPages && (
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
                                    onClick={onLoadMore}
                                    disabled={isLoadingMoreAnnouncements}
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
    );
};
