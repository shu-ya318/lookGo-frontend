import { useState } from 'react';

import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
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
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SearchIcon from '@mui/icons-material/Search';

import type { SelectChangeEvent } from '@mui/material/Select';

const stationOptions = [
    '台北車站',
    '中山站',
    '西門站',
    '板橋站',
    '忠孝復興站',
    '大安站',
    '松山站',
    '南京復興站',
];

const filterOptions = ['無障礙設施', '哺乳室', 'ATM', '廁所', '置物櫃', '充電站'];

interface TripResult {
    startStation: string;
    endStation: string;
    fare: string;
    travelTime: string;
    facilities: string[];
}

const TripPlannerPage = () => {
    const [startStation, setStartStation] = useState<string | null>(null);
    const [endStation, setEndStation] = useState<string | null>(null);
    const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
    const [tripResult, setTripResult] = useState<TripResult | null>(null);
    const [note, setNote] = useState('');

    const handleFilterChange = (event: SelectChangeEvent<string[]>) => {
        setSelectedFilters(event.target.value as string[]);
    };

    const handleSearch = () => {
        if (!startStation || !endStation) return;
        setTripResult({
            startStation,
            endStation,
            fare: '',
            travelTime: '',
            facilities: [],
        });
    };

    return (
        <Stack
            sx={{
                width: '100%',
                maxWidth: '1280px',
                margin: '3.75rem auto',
                gap: '2rem',
            }}
        >
            <Typography variant='h5'>客製化旅程規劃</Typography>

            <Stack
                direction='row'
                sx={{
                    alignItems: 'center',
                    gap: 2,
                    flexWrap: 'wrap',
                }}
            >
                <Stack direction='row' sx={{ alignItems: 'center', gap: 1 }}>
                    <Typography variant='body2' sx={{ flexShrink: 0 }}>
                        起始車站
                    </Typography>
                    <Autocomplete
                        value={startStation}
                        onChange={(_event, newValue) =>
                            setStartStation(newValue)
                        }
                        options={stationOptions}
                        renderInput={params => (
                            <TextField
                                {...params}
                                placeholder='下拉單選'
                                size='small'
                            />
                        )}
                        sx={{ width: 200 }}
                    />
                </Stack>

                <Stack direction='row' sx={{ alignItems: 'center', gap: 1 }}>
                    <Typography variant='body2' sx={{ flexShrink: 0 }}>
                        終點車站
                    </Typography>
                    <Autocomplete
                        value={endStation}
                        onChange={(_event, newValue) => setEndStation(newValue)}
                        options={stationOptions}
                        renderInput={params => (
                            <TextField
                                {...params}
                                placeholder='下拉單選'
                                size='small'
                            />
                        )}
                        sx={{ width: 200 }}
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
                                        backgroundColor: 'background.paper',
                                    },
                                }}
                            />
                        </CardContent>
                    </Card>
                </Stack>
            )}
        </Stack>
    );
};

export default TripPlannerPage;
