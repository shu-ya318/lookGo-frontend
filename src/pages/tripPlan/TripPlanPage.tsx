import {
    useCallback,
    useEffect,
    useMemo,
    useState,
    type ChangeEvent,
} from 'react';
import { enqueueSnackbar } from 'notistack';
import { debounce } from 'lodash-es';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';

import { DeleteDialog } from '@/components/DeleteDialog';
import { SearchInput } from '@/components/SearchInput';
import { TripPlanCard } from '@/components/tripPlan/TripPlanCard';
import { TripPlanEditorDialog } from '@/components/tripPlan/TripPlanEditorDialog';

import {
    deleteTripPlan,
    getAllTripPlanPaginated,
    getTripPlan,
} from '@/services/tripPlan';

import type { TripPlan } from '@/services/tripPlan/interface';

const TRIP_PLAN_PAGE_SIZE = 8;

const TripPlanPage = () => {
    const [inputValue, setInputValue] = useState('');
    const [keyword, setKeyword] = useState('');
    const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC'>('DESC');
    const [allTripPlan, setAllTripPlan] = useState<TripPlan[]>([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [isTripPlansLoading, setIsTripPlansLoading] = useState(false);
    const [isMoreTripPlansLoading, setIsMoreTripPlansLoading] = useState(false);
    const [deletingTripPlan, setDeletingTripPlan] = useState<TripPlan | null>(
        null
    );
    const [isDeleting, setIsDeleting] = useState(false);

    const [formDialogSessionId, setFormDialogSessionId] = useState(0);
    const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
    const [editingTripPlan, setEditingTripPlan] = useState<TripPlan | null>(
        null
    );

    const hasMore = page + 1 < totalPages;

    const fetchAllTripPlan = useCallback(async () => {
        setIsTripPlansLoading(true);

        try {
            if (keyword) {
                const response = await getTripPlan({ keyword });
                setAllTripPlan(response ? [response] : []);
                setPage(0);
                setTotalPages(1);
            } else {
                const response = await getAllTripPlanPaginated({
                    page: 0,
                    size: TRIP_PLAN_PAGE_SIZE,
                    sortDirection,
                });
                setAllTripPlan(response.content);
                setPage(0);
                setTotalPages(response.totalPages);
            }
        } catch (error) {
            if (keyword) {
                setAllTripPlan([]);
                setPage(0);
                setTotalPages(0);
            } else {
                enqueueSnackbar((error as string) || '取得旅程規劃失敗', {
                    variant: 'error',
                });
            }
        } finally {
            setIsTripPlansLoading(false);
        }
    }, [keyword, sortDirection]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchAllTripPlan();
    }, [fetchAllTripPlan]);

    const debouncedSetKeyword = useMemo(
        () =>
            debounce((value: string) => {
                setPage(0);
                setKeyword(value);
            }, 500),
        []
    );

    const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setInputValue(value);
        debouncedSetKeyword(value);
    };

    const handleLoadMore = async () => {
        if (isMoreTripPlansLoading) return;

        const nextPage = page + 1;
        setIsMoreTripPlansLoading(true);
        try {
            const response = await getAllTripPlanPaginated({
                page: nextPage,
                size: TRIP_PLAN_PAGE_SIZE,
                sortDirection,
            });
            setAllTripPlan((prev) => [...prev, ...response.content]);
            setPage(nextPage);
            setTotalPages(response.totalPages);
        } catch (error) {
            enqueueSnackbar((error as string) || '載入更多旅程規劃失敗', {
                variant: 'error',
            });
        } finally {
            setIsMoreTripPlansLoading(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (!deletingTripPlan) return;

        setIsDeleting(true);

        try {
            const response = await deleteTripPlan({
                tripPlanId: deletingTripPlan.id,
            });
            enqueueSnackbar(response.message || '旅程刪除成功！', {
                variant: 'success',
            });
            setAllTripPlan((prev) =>
                prev.filter((plan) => plan.id !== deletingTripPlan.id)
            );
            setDeletingTripPlan(null);
        } catch (error) {
            enqueueSnackbar((error as string) || '旅程刪除失敗', {
                variant: 'error',
            });
        } finally {
            setIsDeleting(false);
        }
    };

    const handleOpenCreateDialog = () => {
        setEditingTripPlan(null);
        setFormDialogSessionId((prev) => prev + 1);
        setIsFormDialogOpen(true);
    };

    const handleOpenEditDialog = (tripPlan: TripPlan) => {
        setEditingTripPlan(tripPlan);
        setFormDialogSessionId((prev) => prev + 1);
        setIsFormDialogOpen(true);
    };

    const handleTripPlanSaved = (tripPlan: TripPlan, isNew: boolean) => {
        setAllTripPlan((prev) =>
            isNew
                ? [tripPlan, ...prev]
                : prev.map((plan) => (plan.id === tripPlan.id ? tripPlan : plan))
        );
        setIsFormDialogOpen(false);
    };

    const handleTripPlanUpdated = (tripPlan: TripPlan) => {
        setAllTripPlan((prev) =>
            prev.map((plan) => (plan.id === tripPlan.id ? tripPlan : plan))
        );
    };

    return (
        <Stack
            sx={{
                width: '100%',
                maxWidth: '1280px',
                margin: '3.75rem auto',
                gap: '2rem',
                justifyContent: 'center',
            }}
        >
            <Typography variant='h5'>旅程規劃</Typography>
            <Stack
                direction='row'
                sx={{
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 1,
                }}
            >
                {/* 搜尋欄與排序選單 */}
                <Stack
                    direction='row'
                    sx={{ alignItems: 'center', gap: 1, flexWrap: 'wrap' }}
                >
                    <SearchInput
                        searchTerm={inputValue}
                        onChange={handleSearch}
                        placeholder='請輸入旅程名稱搜尋'
                    />
                    {/* 有關鍵字時走單筆查詢 API，排序無意義故 disabled */}
                    <Select
                        size='small'
                        value={sortDirection}
                        disabled={!!keyword}
                        onChange={(event) => {
                            setPage(0);
                            setSortDirection(event.target.value as 'ASC' | 'DESC');
                        }}
                    >
                        <MenuItem value='DESC'>更新時間：新 → 舊</MenuItem>
                        <MenuItem value='ASC'>更新時間：舊 → 新</MenuItem>
                    </Select>
                </Stack>

                {/* 新增旅程按鈕 */}
                <Button
                    variant='contained'
                    startIcon={<AddIcon />}
                    onClick={handleOpenCreateDialog}
                >
                    新增旅程
                </Button>
            </Stack>
            {/* 顯示旅程結果畫面 */}
            {isTripPlansLoading && allTripPlan.length === 0 ? (
                <Stack sx={{ alignItems: 'center', py: 4 }}>
                    <CircularProgress size='1.5rem' />
                </Stack>
            ) : allTripPlan.length === 0 ? (
                <Typography
                    variant='body2'
                    color='text.secondary'
                    sx={{ textAlign: 'center', py: 4 }}
                >
                    尚無旅程規劃
                </Typography>
            ) : (
                <Stack sx={{ gap: 2 }}>
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                            gap: 2,
                        }}
                    >
                        {allTripPlan.map((tripPlan) => (
                            <TripPlanCard
                                key={tripPlan.id}
                                tripPlan={tripPlan}
                                onClick={handleOpenEditDialog}
                                onDelete={setDeletingTripPlan}
                                onUpdated={handleTripPlanUpdated}
                            />
                        ))}
                    </Box>
                    {/* 載入更多按鈕 */}
                    {hasMore && (
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
                                onClick={handleLoadMore}
                                disabled={isMoreTripPlansLoading}
                                startIcon={
                                    isMoreTripPlansLoading ? (
                                        <CircularProgress size='0.875rem' />
                                    ) : undefined
                                }
                                sx={{
                                    fontSize: '1rem',
                                    backgroundColor: 'transparent',
                                    color: 'primary.main',
                                    '&:hover': {
                                        backgroundColor: 'transparent',
                                        color: 'primary.light',
                                    },
                                }}
                            >
                                載入更多旅程規劃...
                            </Button>
                        </Stack>
                    )}
                </Stack>
            )}
            {/* 刪除旅程對話框 */}
            <DeleteDialog
                title={deletingTripPlan?.name ?? ''}
                isOpen={!!deletingTripPlan}
                isSubmitting={isDeleting}
                onClose={() => setDeletingTripPlan(null)}
                onDeleteItem={handleConfirmDelete}
            >
                <Typography variant='body2'>
                    確定要刪除這筆旅程規劃嗎？此操作無法復原。
                </Typography>
            </DeleteDialog>
            {/* 旅程新增與編輯對話框 */}
            <TripPlanEditorDialog
                key={formDialogSessionId}
                isOpen={isFormDialogOpen}
                onClose={() => setIsFormDialogOpen(false)}
                tripPlan={editingTripPlan}
                onSaved={handleTripPlanSaved}
            />
        </Stack>
    );
};

export default TripPlanPage;
