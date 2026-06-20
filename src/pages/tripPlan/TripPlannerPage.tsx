import { useState } from 'react';

import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SearchIcon from '@mui/icons-material/Search';

import type { SelectChangeEvent } from '@mui/material/Select';
import { Divider } from '@mui/material';

interface StationOption {
    label: string;
    group: string;
}

const bookmarkedStations: StationOption[] = [
    { label: '淡水站', group: '車站書籤' },
    { label: '民權西路站', group: '車站書籤' },
];

const allStationList: StationOption[] = [
    { label: '台北車站', group: '所有車站' },
    { label: '板橋站', group: '所有車站' },
    { label: '中山站', group: '所有車站' },
    { label: '西門站', group: '所有車站' },
    { label: '忠孝復興站', group: '所有車站' },
    { label: '大安站', group: '所有車站' },
    { label: '松山站', group: '所有車站' },
    { label: '南京復興站', group: '所有車站' },
];

const stationOptions: StationOption[] = [
    ...bookmarkedStations,
    ...allStationList,
];

const filterOptions = [
    '無障礙設施',
    '哺乳室',
    'ATM',
    '廁所',
    '置物櫃',
    '充電站',
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
        startStation: '淡水站',
        endStation: '民權西路站',
        filters: ['廁所'],
        note: '記得帶員工識別證',
    },
    {
        id: 2,
        title: '松山一日遊',
        startStation: '淡水站',
        endStation: '松山站',
        filters: ['廁所', 'ATM'],
        note: '記得帶水壺',
    },
];

const TripPlannerPage = () => {
    const [startStation, setStartStation] = useState<StationOption | null>(
        null
    );
    const [endStation, setEndStation] = useState<StationOption | null>(null);
    const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
    const [tripResult, setTripResult] = useState<TripResult | null>(null);
    const [note, setNote] = useState('');
    const [selectedHistoryId, setSelectedHistoryId] = useState<number | null>(
        null
    );

    const isHistoryMode = selectedHistoryId !== null;

    const handleFilterChange = (event: SelectChangeEvent<string[]>): void => {
        setSelectedFilters(event.target.value as string[]);
    };

    const handleSearch = (): void => {
        if (!startStation || !endStation) return;
        setTripResult({
            startStation: startStation.label,
            endStation: endStation.label,
            fare: '',
            travelTime: '',
            facilities: [],
        });
    };

    const handleSelectHistory = (trip: TripHistory): void => {
        if (selectedHistoryId === trip.id) {
            handleNewTrip();
            return;
        }
        setSelectedHistoryId(trip.id);
        const start =
            stationOptions.find(s => s.label === trip.startStation) ?? null;
        const end =
            stationOptions.find(s => s.label === trip.endStation) ?? null;
        setStartStation(start);
        setEndStation(end);
        setSelectedFilters(trip.filters);
        setNote(trip.note);
        setTripResult({
            startStation: trip.startStation,
            endStation: trip.endStation,
            fare: '',
            travelTime: '',
            facilities: [],
        });
    };

    const handleNewTrip = (): void => {
        setSelectedHistoryId(null);
        setStartStation(null);
        setEndStation(null);
        setSelectedFilters([]);
        setNote('');
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
                <Typography variant='h5'>客製化旅程規劃</Typography>

                <Stack
                    direction='row'
                    sx={{ alignItems: 'center', gap: 2, flexWrap: 'wrap' }}
                >
                    <Stack
                        direction='row'
                        sx={{ alignItems: 'center', gap: 1 }}
                    >
                        <Typography variant='body2' sx={{ flexShrink: 0 }}>
                            起始車站
                        </Typography>
                        <Autocomplete
                            value={startStation}
                            onChange={(_event, newValue) =>
                                setStartStation(newValue)
                            }
                            options={stationOptions}
                            groupBy={option => option.group}
                            getOptionLabel={option => option.label}
                            isOptionEqualToValue={(option, value) =>
                                option.label === value.label
                            }
                            renderOption={(props, option) => (
                                <li {...props} key={`${option.group}-${option.label}`}>
                                    {option.group === '車站書籤'
                                        ? `${option.label}`
                                        : option.label}
                                </li>
                            )}
                            disabled={isHistoryMode}
                            renderInput={params => (
                                <TextField
                                    {...params}
                                    placeholder='選擇或搜尋車站'
                                    size='small'
                                />
                            )}
                            sx={{ width: 220 }}
                        />
                    </Stack>

                    <Stack
                        direction='row'
                        sx={{ alignItems: 'center', gap: 1 }}
                    >
                        <Typography variant='body2' sx={{ flexShrink: 0 }}>
                            終點車站
                        </Typography>
                        <Autocomplete
                            value={endStation}
                            onChange={(_event, newValue) =>
                                setEndStation(newValue)
                            }
                            options={stationOptions}
                            groupBy={option => option.group}
                            getOptionLabel={option => option.label}
                            isOptionEqualToValue={(option, value) =>
                                option.label === value.label
                            }
                            renderOption={(props, option) => (
                                <li {...props} key={`${option.group}-${option.label}`}>
                                    {option.group === '車站書籤'
                                        ? `${option.label}`
                                        : option.label}
                                </li>
                            )}
                            disabled={isHistoryMode}
                            renderInput={params => (
                                <TextField
                                    {...params}
                                    placeholder='選擇或搜尋車站'
                                    size='small'
                                />
                            )}
                            sx={{ width: 220 }}
                        />
                    </Stack>

                    <Select
                        multiple
                        value={selectedFilters}
                        onChange={handleFilterChange}
                        displayEmpty
                        renderValue={selected =>
                            selected.length === 0
                                ? '進階篩選'
                                : (selected as string[]).join('、')
                        }
                        size='small'
                        sx={{ minWidth: 150 }}
                    >
                        {filterOptions.map(option => (
                            <MenuItem key={option} value={option}>
                                <Checkbox
                                    checked={selectedFilters.includes(option)}
                                    size='small'
                                />
                                <ListItemText primary={option} />
                            </MenuItem>
                        ))}
                    </Select>

                    <IconButton onClick={handleSearch} color='default'>
                        <SearchIcon />
                    </IconButton>
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
                                    onChange={e => setNote(e.target.value)}
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
