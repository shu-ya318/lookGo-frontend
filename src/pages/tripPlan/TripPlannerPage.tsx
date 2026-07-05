import { useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Checkbox from '@mui/material/Checkbox';
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
import SearchIcon from '@mui/icons-material/Search';
import TuneIcon from '@mui/icons-material/Tune';
import EditIcon from '@mui/icons-material/Edit';

import { StationAutocomplete } from '@/components/StationAutocomplete';

import { useMetroMapStore } from '@/stores/metroMapStore';

import type { StationOption } from '@/services/metro/interface';

const equipmentFilterOptions = [
    '廁所',
    '電梯',
    '無障礙設施',
    '哺乳室',
    'ATM',
    '置物櫃',
    '充電站',
];

const fareTypeFilterOptions = ['全票', '優惠票'];

const travelTimeFilterOptions = [
    '最少轉乘次數',
    '最短車程時間'
];

interface TripHistory {
    id: number;
    title: string;
    startStation: string;
    endStation: string;
    filters: string[];
    note: string;
}

interface TripResult {
    startStation: string;
    endStation: string;
    fare: string;
    travelTime: string;
    facilities: string[];
}

const mockTripHistory: TripHistory[] = [
    {
        id: 1,
        title: '台北通勤',
        startStation: '淡水',
        endStation: '民權西路',
        filters: ['廁所'],
        note: '記得帶員工識別證',
    },
    {
        id: 2,
        title: '松山一日遊',
        startStation: '淡水',
        endStation: '松山',
        filters: ['廁所', 'ATM'],
        note: '記得帶水壺',
    },
];

const getMockTripResult = (start: string, end: string): { fare: string; travelTime: string; facilities: string[] } => {
    if (start === '淡水' && end === '民權西路') {
        return {
            fare: '全票: 50 元',
            travelTime: '最短車程時間: 35 分鐘',
            facilities: ['無障礙設施', '廁所', 'ATM', '充電站'],
        };
    }

    if (start === '淡水' && end === '松山') {
        return {
            fare: '全票: 65 元',
            travelTime: '最少轉乘次數: 48 分鐘',
            facilities: ['無障礙設施', '廁所', 'ATM', '置物櫃'],
        };
    }

    return {
        fare: '全票: 55 元',
        travelTime: '最短車程時間: 45 分鐘',
        facilities: ['無障礙設施', '廁所', '充電站'],
    };
};

interface AdvancedFilters {
    equipment: string[];
    fare: string[];
    time: string[];
}

const TripPlannerPage = () => {
    const stationOptions = useMetroMapStore(state => state.stationOptions);

    const [startStation, setStartStation] = useState<StationOption | null>(
        null
    );
    const [endStation, setEndStation] = useState<StationOption | null>(null);
    const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({
        equipment: [],
        fare: [],
        time: [],
    });
    const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);
    const [tripResult, setTripResult] = useState<TripResult | null>(null);
    const [note, setNote] = useState('');
    const [selectedHistoryId, setSelectedHistoryId] = useState<number | null>(
        null
    );
    const [tripTitle, setTripTitle] = useState('新旅程');
    const [isEditingTitle, setIsEditingTitle] = useState(false);

    const isHistoryMode = selectedHistoryId !== null;
    const hasEndStation = endStation !== null;
    const isMenuOpen = Boolean(menuAnchorEl);

    const toggleFilter = (
        category: keyof AdvancedFilters,
        value: string
    ): void => {
        setAdvancedFilters(prev => {
            const current = prev[category];
            const updated = current.includes(value)
                ? current.filter(v => v !== value)
                : [...current, value];
            return { ...prev, [category]: updated };
        });
    };

    const totalFilterCount =
        advancedFilters.equipment.length +
        advancedFilters.fare.length +
        advancedFilters.time.length;

    const handleSearch = (): void => {
        if (!startStation || !endStation) return;
        const mockData = getMockTripResult(
            startStation.nameZhTw,
            endStation.nameZhTw
        );
        setTripResult({
            startStation: startStation.nameZhTw,
            endStation: endStation.nameZhTw,
            fare: mockData.fare,
            travelTime: mockData.travelTime,
            facilities: mockData.facilities,
        });
    };

    const handleSelectHistory = (trip: TripHistory): void => {
        if (selectedHistoryId === trip.id) {
            handleNewTrip();
            return;
        }
        setSelectedHistoryId(trip.id);
        const start =
            stationOptions.find(
                station => station.nameZhTw === trip.startStation
            ) ?? null;
        const end =
            stationOptions.find(
                station => station.nameZhTw === trip.endStation
            ) ?? null;
        setStartStation(start);
        setEndStation(end);
        setAdvancedFilters({
            equipment: trip.filters,
            fare: [],
            time: [],
        });
        setNote(trip.note);
        setTripTitle(trip.title);
        const mockData = getMockTripResult(trip.startStation, trip.endStation);
        setTripResult({
            startStation: trip.startStation,
            endStation: trip.endStation,
            fare: mockData.fare,
            travelTime: mockData.travelTime,
            facilities: mockData.facilities,
        });
    };

    const handleNewTrip = (): void => {
        setSelectedHistoryId(null);
        setStartStation(null);
        setEndStation(null);
        setAdvancedFilters({
            equipment: [],
            fare: [],
            time: [],
        });
        setNote('');
        setTripTitle('新旅程');
        setTripResult(null);
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

                <Stack sx={{ gap: 1.5 }}>
                    {mockTripHistory.map(trip => (
                        <Card
                            key={trip.id}
                            onClick={() => handleSelectHistory(trip)}
                            sx={{
                                backgroundColor:
                                    selectedHistoryId === trip.id
                                        ? 'primary.light'
                                        : 'tertiary.dark',
                                boxShadow: 'none',
                                cursor: 'pointer',
                                border: '2px solid',
                                borderColor:
                                    selectedHistoryId === trip.id
                                        ? 'primary.main'
                                        : 'transparent',
                                '&:hover': {
                                    backgroundColor:
                                        selectedHistoryId === trip.id
                                            ? 'primary.main'
                                            : 'action.hover',
                                },
                                transition: 'all 0.2s',
                            }}
                        >
                            <CardContent sx={{ '&:last-child': { pb: 2 } }}>
                                <Typography
                                    variant='body2'
                                    sx={{ fontWeight: 700 }}
                                >
                                    {trip.title}
                                </Typography>
                                <Typography
                                    variant='caption'
                                    color='text.secondary'
                                >
                                    {trip.startStation} → {trip.endStation}
                                </Typography>
                            </CardContent>
                        </Card>
                    ))}
                </Stack>
            </Stack>
            <Divider orientation='vertical' flexItem sx={{ backgroundColor: 'tertiary.main' }} />
            {/* 右側面板 - 客製化旅程規劃 (75%) */}
            <Stack sx={{ flex: 1, gap: 2 }}>
                <Stack direction='row' spacing={1.5} sx={{ alignItems: 'center' }}>
                    {isEditingTitle ? (
                        <TextField
                            value={tripTitle}
                            onChange={event => setTripTitle(event.target.value)}
                            onBlur={() => setIsEditingTitle(false)}
                            onKeyDown={event => {
                                if (event.key === 'Enter') setIsEditingTitle(false);
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
                                    onClick={() =>
                                        toggleFilter('equipment', option)
                                    }
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
                                    onClick={() => toggleFilter('fare', option)}
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
                                        checked={advancedFilters.fare.includes(
                                            option
                                        )}
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
                                    onClick={() => toggleFilter('time', option)}
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
                                        checked={advancedFilters.time.includes(
                                            option
                                        )}
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
                                    <Typography variant='body1'>
                                        {tripResult.startStation}
                                    </Typography>
                                    <ArrowForwardIcon />
                                    <Typography variant='body1'>
                                        {tripResult.endStation}
                                    </Typography>
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
                                        {tripResult.fare || '-'}
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
                                        {tripResult.travelTime || '-'}
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
                                    {tripResult.facilities.length > 0
                                        ? tripResult.facilities.join('、')
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
        </Stack>
    );
};

export default TripPlannerPage;
