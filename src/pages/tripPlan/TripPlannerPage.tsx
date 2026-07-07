import { useCallback, useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { enqueueSnackbar } from 'notistack';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import SearchIcon from '@mui/icons-material/Search';
import TuneIcon from '@mui/icons-material/Tune';
import EditIcon from '@mui/icons-material/Edit';

import { DeleteDialog } from '@/components/DeleteDialog';
import { StationAutocomplete } from '@/components/StationAutocomplete';

import { useMetroMapStore } from '@/stores/metroMapStore';
import { useStationBookmarkStore } from '@/stores/stationBookmarkStore';

import { getOriginDestinationDetail, getStationByCode } from '@/services/metro';
import { FareType, RoutingStrategy } from '@/services/metro/types';
import {
    createTripPlan,
    deleteTripPlan,
    getAllTripPlanPaginated,
    getTripPlanExcel,
    updateTripPlan,
    updateTripPlanName,
} from '@/services/tripPlan';

import type { StationOption } from '@/services/metro/interface';
import type { TripPlan } from '@/services/tripPlan/interface';

const equipmentFilterOptions = [
    '廁所',
    '電梯',
    '無障礙設施',
    '哺乳室',
    'ATM',
    '置物櫃',
    '充電站',
];

const fareTypeFilterOptions = ['全票', '學生票', '兒童票', '愛心票'] as const;
type FareLabel = (typeof fareTypeFilterOptions)[number];
const fareLabelToType: Record<FareLabel, number> = {
    全票: FareType.FULL,
    學生票: FareType.STUDENT,
    兒童票: FareType.CHILD,
    愛心票: FareType.LOVE,
};
const fareTypeToLabel: Record<number, FareLabel> = {
    [FareType.FULL]: '全票',
    [FareType.STUDENT]: '學生票',
    [FareType.CHILD]: '兒童票',
    [FareType.LOVE]: '愛心票',
};

const travelTimeFilterOptions = ['最少轉乘次數', '最短車程時間'] as const;
type TimeLabel = (typeof travelTimeFilterOptions)[number];
const timeLabelToStrategy: Record<TimeLabel, number> = {
    最少轉乘次數: RoutingStrategy.MIN_TRANSFER,
    最短車程時間: RoutingStrategy.MIN_TIME,
};
const routingStrategyToLabel: Record<number, TimeLabel> = {
    [RoutingStrategy.MIN_TRANSFER]: '最少轉乘次數',
    [RoutingStrategy.MIN_TIME]: '最短車程時間',
};

const TRIP_PLAN_PAGE_SIZE = 50;

interface TripResult {
    startStation: string;
    startStationId: number | null;
    endStation: string;
    endStationId: number | null;
    fareLabel: string;
    travelTimeLabel: string;
    farePrice: number;
    transferCount: number;
}

interface AdvancedFilters {
    equipment: string[];
    fare: FareLabel | null;
    time: TimeLabel | null;
}

const defaultAdvancedFilters: AdvancedFilters = {
    equipment: [],
    fare: null,
    time: null,
};

// StationOption 僅提供 stationCode，新增旅程與書籤功能需要的 stationId 需另行查詢
const resolveStationId = async (
    station: StationOption
): Promise<number | null> => {
    try {
        const details = await getStationByCode({
            stationCode: station.stationCode,
        });
        return details.id;
    } catch (error) {
        enqueueSnackbar((error as string) || '取得車站資訊失敗', {
            variant: 'error',
        });
        return null;
    }
};

const TripPlannerPage = () => {
    const stationOptions = useMetroMapStore(state => state.stationOptions);
    const bookmarks = useStationBookmarkStore(state => state.bookmarks);
    const fetchBookmarks = useStationBookmarkStore(
        state => state.fetchBookmarks
    );
    const toggleBookmark = useStationBookmarkStore(
        state => state.toggleBookmark
    );

    useEffect(() => {
        fetchBookmarks();
    }, [fetchBookmarks]);

    const isStationBookmarked = (stationId: number | null): boolean =>
        stationId !== null &&
        bookmarks.some(bookmark => bookmark.stationId === stationId);

    const [tripPlans, setTripPlans] = useState<TripPlan[]>([]);
    const [isLoadingTripPlans, setIsLoadingTripPlans] = useState(false);
    const [deletingTripPlan, setDeletingTripPlan] = useState<TripPlan | null>(
        null
    );
    const [isDeleting, setIsDeleting] = useState(false);

    const [startStation, setStartStation] = useState<StationOption | null>(
        null
    );
    const [endStation, setEndStation] = useState<StationOption | null>(null);
    const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>(
        defaultAdvancedFilters
    );
    const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);
    const [tripResult, setTripResult] = useState<TripResult | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [note, setNote] = useState('');
    const [selectedTripPlanId, setSelectedTripPlanId] = useState<
        number | null
    >(null);
    const [tripTitle, setTripTitle] = useState('新旅程');
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isExportingExcel, setIsExportingExcel] = useState(false);

    const isHistoryMode = selectedTripPlanId !== null;
    const hasEndStation = endStation !== null;
    const isMenuOpen = Boolean(menuAnchorEl);

    const fetchTripPlans = useCallback(async (): Promise<void> => {
        setIsLoadingTripPlans(true);
        try {
            const { content } = await getAllTripPlanPaginated({
                page: 0,
                size: TRIP_PLAN_PAGE_SIZE,
            });
            setTripPlans(content);
        } catch (error) {
            enqueueSnackbar((error as string) || '取得歷史旅程失敗', {
                variant: 'error',
            });
        } finally {
            setIsLoadingTripPlans(false);
        }
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchTripPlans();
    }, [fetchTripPlans]);

    const toggleEquipmentFilter = (value: string): void => {
        setAdvancedFilters(prev => {
            const current = prev.equipment;
            const updated = current.includes(value)
                ? current.filter(v => v !== value)
                : [...current, value];
            return { ...prev, equipment: updated };
        });
    };

    const selectFareFilter = (value: FareLabel): void => {
        setAdvancedFilters(prev => ({
            ...prev,
            fare: prev.fare === value ? null : value,
        }));
    };

    const selectTimeFilter = (value: TimeLabel): void => {
        setAdvancedFilters(prev => ({
            ...prev,
            time: prev.time === value ? null : value,
        }));
    };

    const totalFilterCount =
        advancedFilters.equipment.length +
        (advancedFilters.fare ? 1 : 0) +
        (advancedFilters.time ? 1 : 0);

    const buildTripResult = (
        start: StationOption,
        end: StationOption,
        startStationId: number | null,
        endStationId: number | null,
        fareType: number,
        routingStrategy: number,
        farePrice: number,
        totalTravelTimeSeconds: number,
        transferCount: number
    ): TripResult => ({
        startStation: start.nameZhTw,
        startStationId,
        endStation: end.nameZhTw,
        endStationId,
        fareLabel: `${fareTypeToLabel[fareType] ?? '全票'}：${farePrice} 元`,
        travelTimeLabel: `${
            routingStrategyToLabel[routingStrategy] ?? '最少轉乘次數'
        }：${Math.ceil(totalTravelTimeSeconds / 60)} 分鐘`,
        farePrice,
        transferCount,
    });

    const handleSearch = async (): Promise<void> => {
        if (!startStation || !endStation) return;

        const fareType = advancedFilters.fare
            ? fareLabelToType[advancedFilters.fare]
            : FareType.FULL;
        const routingStrategy = advancedFilters.time
            ? timeLabelToStrategy[advancedFilters.time]
            : RoutingStrategy.MIN_TRANSFER;

        setIsSearching(true);
        try {
            const [detail, startStationId, endStationId] = await Promise.all([
                getOriginDestinationDetail({
                    fromStationCode: startStation.stationCode,
                    toStationCode: endStation.stationCode,
                    fareType,
                    routingStrategy,
                }),
                resolveStationId(startStation),
                resolveStationId(endStation),
            ]);
            setTripResult(
                buildTripResult(
                    startStation,
                    endStation,
                    startStationId,
                    endStationId,
                    detail.fareType,
                    detail.routingStrategy,
                    detail.farePrice,
                    detail.totalTravelTimeSeconds,
                    detail.transferCount
                )
            );
        } catch (error) {
            enqueueSnackbar((error as string) || '路線查詢失敗', {
                variant: 'error',
            });
        } finally {
            setIsSearching(false);
        }
    };

    const handleSelectHistory = async (trip: TripPlan): Promise<void> => {
        if (selectedTripPlanId === trip.id) {
            handleNewTrip();
            return;
        }

        const start =
            stationOptions.find(
                station => station.nameZhTw === trip.fromStationNameZhTw
            ) ?? null;
        const end =
            stationOptions.find(
                station => station.nameZhTw === trip.toStationNameZhTw
            ) ?? null;

        setSelectedTripPlanId(trip.id);
        setStartStation(start);
        setEndStation(end);
        setAdvancedFilters({
            equipment: [],
            fare: fareTypeToLabel[trip.fareType] ?? null,
            time: routingStrategyToLabel[trip.routingStrategy] ?? null,
        });
        setNote(trip.notes || '');
        setTripTitle(trip.name);
        setTripResult(null);

        if (!start || !end) return;

        setIsSearching(true);
        try {
            const detail = await getOriginDestinationDetail({
                fromStationCode: start.stationCode,
                toStationCode: end.stationCode,
                fareType: trip.fareType,
                routingStrategy: trip.routingStrategy,
            });
            setTripResult(
                buildTripResult(
                    start,
                    end,
                    trip.fromStationId,
                    trip.toStationId,
                    detail.fareType,
                    detail.routingStrategy,
                    detail.farePrice,
                    detail.totalTravelTimeSeconds,
                    detail.transferCount
                )
            );
        } catch (error) {
            enqueueSnackbar((error as string) || '路線查詢失敗', {
                variant: 'error',
            });
        } finally {
            setIsSearching(false);
        }
    };

    const handleNewTrip = (): void => {
        setSelectedTripPlanId(null);
        setStartStation(null);
        setEndStation(null);
        setAdvancedFilters(defaultAdvancedFilters);
        setNote('');
        setTripTitle('新旅程');
        setTripResult(null);
    };

    const handleTitleBlur = async (): Promise<void> => {
        setIsEditingTitle(false);

        if (!selectedTripPlanId || !tripTitle.trim()) return;

        try {
            const updated = await updateTripPlanName({
                tripPlanId: selectedTripPlanId,
                name: tripTitle,
            });
            setTripPlans(prev =>
                prev.map(plan => (plan.id === updated.id ? updated : plan))
            );
        } catch (error) {
            enqueueSnackbar((error as string) || '旅程名稱更新失敗', {
                variant: 'error',
            });
        }
    };

    const handleSaveTrip = async (): Promise<void> => {
        if (!tripResult) return;

        if (
            tripResult.startStationId === null ||
            tripResult.endStationId === null
        ) {
            enqueueSnackbar('車站資訊取得失敗，請重新查詢', {
                variant: 'error',
            });
            return;
        }

        const fareType = advancedFilters.fare
            ? fareLabelToType[advancedFilters.fare]
            : FareType.FULL;
        const routingStrategy = advancedFilters.time
            ? timeLabelToStrategy[advancedFilters.time]
            : RoutingStrategy.MIN_TRANSFER;

        setIsSaving(true);
        try {
            if (selectedTripPlanId) {
                const updated = await updateTripPlan({
                    tripPlanId: selectedTripPlanId,
                    fareType,
                    farePrice: tripResult.farePrice,
                    transferCount: tripResult.transferCount,
                    routingStrategy,
                    notes: note || undefined,
                });
                setTripPlans(prev =>
                    prev.map(plan => (plan.id === updated.id ? updated : plan))
                );
                enqueueSnackbar('旅程更新成功！', { variant: 'success' });
            } else {
                const created = await createTripPlan({
                    name: tripTitle,
                    fromStationId: tripResult.startStationId,
                    toStationId: tripResult.endStationId,
                    fareType,
                    farePrice: tripResult.farePrice,
                    transferCount: tripResult.transferCount,
                    routingStrategy,
                    notes: note || undefined,
                });
                setSelectedTripPlanId(created.id);
                setTripPlans(prev => [created, ...prev]);
                enqueueSnackbar('旅程新增成功！', { variant: 'success' });
            }
        } catch (error) {
            enqueueSnackbar((error as string) || '旅程儲存失敗', {
                variant: 'error',
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleConfirmDelete = async (): Promise<void> => {
        if (!deletingTripPlan) return;

        setIsDeleting(true);
        try {
            const { message } = await deleteTripPlan({
                tripPlanId: deletingTripPlan.id,
            });
            enqueueSnackbar(message || '旅程刪除成功！', {
                variant: 'success',
            });
            setTripPlans(prev =>
                prev.filter(plan => plan.id !== deletingTripPlan.id)
            );
            if (selectedTripPlanId === deletingTripPlan.id) handleNewTrip();
            setDeletingTripPlan(null);
        } catch (error) {
            enqueueSnackbar((error as string) || '旅程刪除失敗', {
                variant: 'error',
            });
        } finally {
            setIsDeleting(false);
        }
    };

    const handleExportExcel = async (): Promise<void> => {
        if (!selectedTripPlanId) return;

        setIsExportingExcel(true);
        try {
            const blob = await getTripPlanExcel({
                tripPlanId: selectedTripPlanId,
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');

            link.href = url;
            link.setAttribute(
                'download',
                `${tripTitle}_${dayjs().format('YYYYMMDD')}.xlsx`
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
            direction='row'
            sx={{
                width: '100%',
                maxWidth: '1280px',
                margin: '3.75rem auto',
                gap: '1.5rem',
            }}
        >
            {/* 左側面板 - 歷史旅程紀錄 (25%) */}
            <Stack sx={{ width: '25%', flexShrink: 0, gap: 2 }}>
                <Typography variant='h6'>歷史旅程紀錄</Typography>

                <Button
                    variant='outlined'
                    color='neutral'
                    startIcon={<AddIcon />}
                    onClick={handleNewTrip}
                    fullWidth
                >
                    新增旅程
                </Button>

                {isLoadingTripPlans ? (
                    <Stack sx={{ alignItems: 'center', py: 4 }}>
                        <CircularProgress size='1.5rem' />
                    </Stack>
                ) : (
                    <Stack sx={{ gap: 1.5 }}>
                        {tripPlans.map(trip => (
                            <Card
                                key={trip.id}
                                onClick={() => handleSelectHistory(trip)}
                                sx={{
                                    backgroundColor:
                                        selectedTripPlanId === trip.id
                                            ? 'primary.light'
                                            : 'tertiary.dark',
                                    boxShadow: 'none',
                                    cursor: 'pointer',
                                    border: '2px solid',
                                    borderColor:
                                        selectedTripPlanId === trip.id
                                            ? 'primary.main'
                                            : 'transparent',
                                    '&:hover': {
                                        backgroundColor:
                                            selectedTripPlanId === trip.id
                                                ? 'primary.main'
                                                : 'action.hover',
                                    },
                                    transition: 'all 0.2s',
                                }}
                            >
                                <CardContent sx={{ '&:last-child': { pb: 2 } }}>
                                    <Stack
                                        direction='row'
                                        sx={{
                                            alignItems: 'flex-start',
                                            justifyContent: 'space-between',
                                        }}
                                    >
                                        <Stack sx={{ gap: 0.25 }}>
                                            <Typography
                                                variant='body2'
                                                sx={{ fontWeight: 700 }}
                                            >
                                                {trip.name}
                                            </Typography>
                                            <Typography
                                                variant='caption'
                                                color='text.secondary'
                                            >
                                                {trip.fromStationNameZhTw} →{' '}
                                                {trip.toStationNameZhTw}
                                            </Typography>
                                        </Stack>
                                        <IconButton
                                            size='small'
                                            onClick={event => {
                                                event.stopPropagation();
                                                setDeletingTripPlan(trip);
                                            }}
                                        >
                                            <DeleteOutlinedIcon fontSize='small' />
                                        </IconButton>
                                    </Stack>
                                </CardContent>
                            </Card>
                        ))}
                    </Stack>
                )}
            </Stack>
            <Divider orientation='vertical' flexItem sx={{ backgroundColor: 'tertiary.main' }} />
            {/* 右側面板 - 客製化旅程規劃 (75%) */}
            <Stack sx={{ flex: 1, gap: 2 }}>
                <Stack
                    direction='row'
                    sx={{ alignItems: 'center', justifyContent: 'space-between' }}
                >
                    <Stack direction='row' spacing={1.5} sx={{ alignItems: 'center' }}>
                        {isEditingTitle ? (
                            <TextField
                                value={tripTitle}
                                onChange={event => setTripTitle(event.target.value)}
                                onBlur={handleTitleBlur}
                                onKeyDown={event => {
                                    if (event.key === 'Enter') event.currentTarget.blur();
                                }}
                                size='small'
                                autoFocus
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        backgroundColor: 'background.paper',
                                    },
                                }}
                            />
                        ) : (
                            <Typography variant='h5' sx={{ fontWeight: 700 }}>
                                {tripTitle}
                            </Typography>
                        )}
                        <IconButton
                            size='small'
                            onClick={() => setIsEditingTitle(!isEditingTitle)}
                            color='primary'
                        >
                            <EditIcon fontSize='small' />
                        </IconButton>
                    </Stack>

                    {tripResult && (
                        <Stack direction='row' sx={{ gap: 1 }}>
                            {selectedTripPlanId && (
                                <Button
                                    variant='outlined'
                                    size='small'
                                    startIcon={<FileDownloadOutlinedIcon />}
                                    loading={isExportingExcel}
                                    onClick={handleExportExcel}
                                >
                                    匯出 Excel
                                </Button>
                            )}
                            <Button
                                variant='contained'
                                size='small'
                                loading={isSaving}
                                onClick={handleSaveTrip}
                            >
                                {selectedTripPlanId ? '更新旅程' : '儲存旅程'}
                            </Button>
                        </Stack>
                    )}
                </Stack>

                {/* 搜尋欄 - 藍色背景 */}
                <Stack
                    sx={{
                        backgroundColor: 'primary.main',
                        px: 3,
                        py: 1.5,
                        gap: 1,
                        borderRadius: 1,
                        zIndex: 10,
                    }}
                >
                    {/* (1) Info 提示 */}


                    {/* (2) 起始、終點車站 + 進階查詢 */}
                    <Stack
                        direction='row'
                        sx={{ alignItems: 'center', gap: 2, flexWrap: 'wrap' }}
                    >
                        <Stack
                            direction='row'
                            sx={{ alignItems: 'center', gap: 1 }}
                        >
                            <Typography
                                variant='body2'
                                sx={{
                                    color: 'primary.contrastText',
                                    flexShrink: 0,
                                }}
                            >
                                起始車站
                            </Typography>
                            <StationAutocomplete
                                value={startStation}
                                onChange={setStartStation}
                                disabled={isHistoryMode}
                                sx={{
                                    width: 200,
                                    '& .MuiOutlinedInput-root': {
                                        backgroundColor: 'white',
                                    },
                                }}
                            />
                        </Stack>

                        <Stack
                            direction='row'
                            sx={{ alignItems: 'center', gap: 1 }}
                        >
                            <Typography
                                variant='body2'
                                sx={{
                                    color: 'primary.contrastText',
                                    flexShrink: 0,
                                }}
                            >
                                終點車站
                            </Typography>
                            <StationAutocomplete
                                value={endStation}
                                onChange={setEndStation}
                                disabled={isHistoryMode}
                                sx={{
                                    width: 200,
                                    '& .MuiOutlinedInput-root': {
                                        backgroundColor: 'white',
                                    },
                                }}
                            />
                        </Stack>

                        {/* 進階查詢按鈕 */}
                        <Button
                            startIcon={<TuneIcon />}
                            onClick={event => setMenuAnchorEl(event.currentTarget)}
                            variant='outlined'
                            size='small'
                            sx={{
                                color: 'primary.contrastText',
                                borderColor: 'rgba(255, 255, 255, 0.5)',
                                '&:hover': {
                                    borderColor: 'white',
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                },
                            }}
                        >
                            進階查詢
                            {totalFilterCount > 0 && ` (${totalFilterCount})`}
                        </Button>

                        {/* 開始查詢按鈕 */}
                        <Button
                            startIcon={<SearchIcon />}
                            onClick={handleSearch}
                            variant='contained'
                            size='small'
                            loading={isSearching}
                            sx={{
                                backgroundColor: 'primary.contrastText',
                                color: 'primary.main',
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.85)',
                                },
                            }}
                        >
                            開始查詢
                        </Button>

                        {/* 進階查詢下拉選單 */}
                        <Menu
                            anchorEl={menuAnchorEl}
                            open={isMenuOpen}
                            onClose={() => setMenuAnchorEl(null)}
                        >
                            {/* 設備分組 */}
                            <ListSubheader sx={{ fontWeight: 700 }}>
                                設備
                            </ListSubheader>
                            {equipmentFilterOptions.map(option => (
                                <MenuItem
                                    key={option}
                                    onClick={() => toggleEquipmentFilter(option)}
                                >
                                    <Checkbox
                                        checked={advancedFilters.equipment.includes(
                                            option
                                        )}
                                        size='small'
                                    />
                                    <ListItemText primary={option} />
                                </MenuItem>
                            ))}

                            <Divider />

                            {/* 票價種類分組 - 無終點站時禁用 */}
                            <ListSubheader
                                sx={{
                                    fontWeight: 700,
                                    color: hasEndStation
                                        ? 'text.primary'
                                        : 'text.disabled',
                                    backgroundColor: hasEndStation
                                        ? 'inherit'
                                        : 'tertiary.dark',
                                }}
                            >
                                票價種類
                            </ListSubheader>
                            {fareTypeFilterOptions.map(option => (
                                <MenuItem
                                    key={option}
                                    disabled={!hasEndStation}
                                    onClick={() => selectFareFilter(option)}
                                    sx={{
                                        ...(!hasEndStation && {
                                            backgroundColor: 'tertiary.dark',
                                            '&.Mui-disabled': {
                                                backgroundColor: 'tertiary.dark',
                                                opacity: 1,
                                            },
                                        }),
                                    }}
                                >
                                    <Checkbox
                                        checked={advancedFilters.fare === option}
                                        size='small'
                                        disabled={!hasEndStation}
                                    />
                                    <ListItemText
                                        primary={option}
                                        sx={{
                                            color: hasEndStation
                                                ? 'text.primary'
                                                : 'text.disabled',
                                        }}
                                    />
                                </MenuItem>
                            ))}

                            <Divider />

                            {/* 乘車時間分組 - 無終點站時禁用 */}
                            <ListSubheader
                                sx={{
                                    fontWeight: 700,
                                    color: hasEndStation
                                        ? 'text.primary'
                                        : 'text.disabled',
                                    backgroundColor: hasEndStation
                                        ? 'inherit'
                                        : 'tertiary.dark',
                                }}
                            >
                                乘車時間
                            </ListSubheader>
                            {travelTimeFilterOptions.map(option => (
                                <MenuItem
                                    key={option}
                                    disabled={!hasEndStation}
                                    onClick={() => selectTimeFilter(option)}
                                    sx={{
                                        ...(!hasEndStation && {
                                            backgroundColor: 'tertiary.dark',
                                            '&.Mui-disabled': {
                                                backgroundColor: 'tertiary.dark',
                                                opacity: 1,
                                            },
                                        }),
                                    }}
                                >
                                    <Checkbox
                                        checked={advancedFilters.time === option}
                                        size='small'
                                        disabled={!hasEndStation}
                                    />
                                    <ListItemText
                                        primary={option}
                                        sx={{
                                            color: hasEndStation
                                                ? 'text.primary'
                                                : 'text.disabled',
                                        }}
                                    />
                                </MenuItem>
                            ))}
                        </Menu>
                    </Stack>
                </Stack>

                {!tripResult ? (
                    <Box
                        sx={{
                            backgroundColor: 'tertiary.dark',
                            borderRadius: 2,
                            py: 10,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <Typography variant='body1' color='text.secondary'>
                            請選擇車站來開始規劃您的專屬旅程
                        </Typography>
                    </Box>
                ) : (
                    <Stack sx={{ gap: 2 }}>
                        <Card
                            sx={{
                                backgroundColor: 'tertiary.dark',
                                boxShadow: 'none',
                            }}
                        >
                            <CardContent>
                                <Stack
                                    direction='row'
                                    sx={{
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 4,
                                        py: 2,
                                    }}
                                >
                                    <Stack
                                        direction='row'
                                        sx={{ alignItems: 'center', gap: 0.5 }}
                                    >
                                        <Typography variant='body1'>
                                            {tripResult.startStation}
                                        </Typography>
                                        <IconButton
                                            size='small'
                                            disabled={
                                                tripResult.startStationId === null
                                            }
                                            onClick={() =>
                                                toggleBookmark(
                                                    tripResult.startStationId!
                                                )
                                            }
                                        >
                                            {isStationBookmarked(
                                                tripResult.startStationId
                                            ) ? (
                                                <BookmarkIcon
                                                    fontSize='small'
                                                    color='primary'
                                                />
                                            ) : (
                                                <BookmarkBorderIcon fontSize='small' />
                                            )}
                                        </IconButton>
                                    </Stack>
                                    <ArrowForwardIcon />
                                    <Stack
                                        direction='row'
                                        sx={{ alignItems: 'center', gap: 0.5 }}
                                    >
                                        <Typography variant='body1'>
                                            {tripResult.endStation}
                                        </Typography>
                                        <IconButton
                                            size='small'
                                            disabled={
                                                tripResult.endStationId === null
                                            }
                                            onClick={() =>
                                                toggleBookmark(
                                                    tripResult.endStationId!
                                                )
                                            }
                                        >
                                            {isStationBookmarked(
                                                tripResult.endStationId
                                            ) ? (
                                                <BookmarkIcon
                                                    fontSize='small'
                                                    color='primary'
                                                />
                                            ) : (
                                                <BookmarkBorderIcon fontSize='small' />
                                            )}
                                        </IconButton>
                                    </Stack>
                                </Stack>
                            </CardContent>
                        </Card>

                        <Stack direction='row' sx={{ gap: 2 }}>
                            <Card
                                sx={{
                                    flex: 1,
                                    backgroundColor: 'tertiary.dark',
                                    boxShadow: 'none',
                                }}
                            >
                                <CardContent>
                                    <Typography
                                        variant='body2'
                                        sx={{ fontWeight: 700 }}
                                    >
                                        票價
                                    </Typography>
                                    <Typography variant='body2' sx={{ mt: 1 }}>
                                        {tripResult.fareLabel || '-'}
                                    </Typography>
                                </CardContent>
                            </Card>
                            <Card
                                sx={{
                                    flex: 1,
                                    backgroundColor: 'tertiary.dark',
                                    boxShadow: 'none',
                                }}
                            >
                                <CardContent>
                                    <Typography
                                        variant='body2'
                                        sx={{ fontWeight: 700 }}
                                    >
                                        搭乘時間
                                    </Typography>
                                    <Typography variant='body2' sx={{ mt: 1 }}>
                                        {tripResult.travelTimeLabel || '-'}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Stack>

                        <Card
                            sx={{
                                backgroundColor: 'tertiary.dark',
                                boxShadow: 'none',
                            }}
                        >
                            <CardContent>
                                <Typography
                                    variant='body2'
                                    sx={{ fontWeight: 700 }}
                                >
                                    設備
                                </Typography>
                                <Typography variant='body2' sx={{ mt: 1 }}>
                                    {advancedFilters.equipment.length > 0
                                        ? advancedFilters.equipment.join('、')
                                        : '-'}
                                </Typography>
                            </CardContent>
                        </Card>

                        <Card
                            sx={{
                                backgroundColor: 'tertiary.dark',
                                boxShadow: 'none',
                            }}
                        >
                            <CardContent>
                                <Typography
                                    variant='body2'
                                    sx={{ fontWeight: 700, mb: 1 }}
                                >
                                    筆記
                                </Typography>
                                <TextField
                                    value={note}
                                    onChange={event => setNote(event.target.value)}
                                    multiline
                                    rows={4}
                                    fullWidth
                                    placeholder='輸入您的旅程筆記...'
                                    variant='outlined'
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            height: 'auto',
                                            backgroundColor:
                                                'background.paper',
                                        },
                                    }}
                                />
                            </CardContent>
                        </Card>
                    </Stack>
                )}
            </Stack>

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
        </Stack>
    );
};

export default TripPlannerPage;
