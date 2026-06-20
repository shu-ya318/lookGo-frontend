import { useState } from 'react';

import Autocomplete from '@mui/material/Autocomplete';
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
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SearchIcon from '@mui/icons-material/Search';
import TuneIcon from '@mui/icons-material/Tune';

import trtcMap from '@/assets/trtc_map.jpg';

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
];

const stationOptions: StationOption[] = [
    ...bookmarkedStations,
    ...allStationList,
];

const equipmentFilterOptions = [
    '廁所',
    '電梯',
    '無障礙設施',
    '哺乳室',
    'ATM',
    '置物櫃',
    '充電站',
];

const fareTypeFilterOptions = ['普通票', '優待票', '敬老票', '愛心票'];

const travelTimeFilterOptions = [
    '最少轉乘次數',
    '最短車程時間'
];

interface StationFacility {
    name: string;
    exits: string[];
}

const tamsuiStationInfo = {
    nameZhTw: '民權西路',
    nameEn: 'Minquan West Road',
    facilities: [
        { name: '廁所', exits: ['出口 1', '出口 2'] },
        { name: '電梯', exits: ['出口 1', '出口 3'] },
    ] as StationFacility[],
};

const tripCardData = {
    startStation: '淡水',
    endStation: '民權西路',
    travelTime: '約 25 分鐘',
    fare: 'NT$ 35',
    startFacilities: [
        { name: '廁所', exits: ['出口 1', '出口 2'] },
        { name: '電梯', exits: ['出口 1', '出口 3'] },
    ] as StationFacility[],
    endFacilities: [
        { name: '廁所', exits: ['出口 5'] },
        { name: '電梯', exits: ['出口 3', '出口 10'] },
    ] as StationFacility[],
};

interface AdvancedFilters {
    equipment: string[];
    fare: string[];
    time: string[];
}

const NetworkMapPage = () => {
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

    const renderFacilities = (facilities: StationFacility[]): React.ReactNode =>
        facilities.map(facility => (
            <Typography
                key={facility.name}
                variant='caption'
                sx={{ display: 'block', pl: 1 }}
            >
                {facility.name}：{facility.exits.join('、')}
            </Typography>
        ));

    return (
        <Box
            sx={{
                position: 'relative',
                mx: { xs: -2, sm: -4, md: -6 },
                height: 'calc(100vh - 4.375rem)',
                overflow: 'hidden',
                backgroundColor: 'tertiary.light',
            }}
        >
            {/* 路網圖 */}
            <Box
                component='img'
                src={trtcMap}
                alt='台北捷運路網圖'
                sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                }}
            />

            {/* 搜尋欄 - 藍色背景 */}
            <Stack
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: 'primary.main',
                    px: 3,
                    py: 1.5,
                    gap: 1,
                    zIndex: 10,
                }}
            >
                {/* (1) Info 提示 */}
                <Stack
                    direction='row'
                    sx={{ alignItems: 'center', gap: 1 }}
                >
                    <InfoOutlinedIcon
                        sx={{ color: 'primary.contrastText', fontSize: 20 }}
                    />
                    <Typography
                        variant='caption'
                        sx={{ color: 'primary.contrastText' }}
                    >
                        可查詢單一車站或起始與終點車站，或直接在路網圖點擊指定車站
                    </Typography>
                </Stack>

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
                                <li
                                    {...props}
                                    key={`${option.group}-${option.label}`}
                                >
                                    {option.label}
                                </li>
                            )}
                            renderInput={params => (
                                <TextField
                                    {...params}
                                    placeholder='選擇或搜尋車站'
                                    size='small'
                                />
                            )}
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
                                <li
                                    {...props}
                                    key={`${option.group}-${option.label}`}
                                >
                                    {option.label}
                                </li>
                            )}
                            renderInput={params => (
                                <TextField
                                    {...params}
                                    placeholder='選擇或搜尋車站'
                                    size='small'
                                />
                            )}
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
                        onClick={e => setMenuAnchorEl(e.currentTarget)}
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
                        {/* 設備分組 - 始終可用 */}
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

            {/* 資訊卡片 */}
            <Card
                sx={{
                    position: 'absolute',
                    top: '22%',
                    left: '40%',
                    width: 220,
                    boxShadow: 3,
                    zIndex: 5,
                }}
            >
                <CardContent sx={{ '&:last-child': { pb: 2 } }}>
                    <Typography variant='body2' sx={{ fontWeight: 700 }}>
                        {tamsuiStationInfo.nameZhTw}
                    </Typography>
                    <Typography
                        variant='caption'
                        color='text.secondary'
                        sx={{ display: 'block' }}
                    >
                        {tamsuiStationInfo.nameEn}
                    </Typography>

                    <Divider sx={{ my: 1 }} />

                    <Typography
                        variant='caption'
                        sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}
                    >
                        設備
                    </Typography>
                    {renderFacilities(tamsuiStationInfo.facilities)}
                </CardContent>
            </Card>

            {/* 起訖車站資訊卡片 - 固定左下角 */}
            <Card
                sx={{
                    position: 'absolute',
                    bottom: 24,
                    left: 24,
                    width: 280,
                    maxHeight: 'calc(100% - 140px)',
                    overflowY: 'auto',
                    boxShadow: 3,
                    zIndex: 5,
                }}
            >
                <CardContent sx={{ '&:last-child': { pb: 2 } }}>
                    <Typography
                        variant='body2'
                        sx={{ fontWeight: 700, mb: 0.5 }}
                    >
                        起訖車站
                    </Typography>
                    <Typography variant='body2'>
                        {tripCardData.startStation} →{' '}
                        {tripCardData.endStation}
                    </Typography>

                    <Divider sx={{ my: 1 }} />

                    <Stack sx={{ gap: 0.5 }}>
                        <Stack
                            direction='row'
                            sx={{ justifyContent: 'space-between' }}
                        >
                            <Typography
                                variant='caption'
                                sx={{ fontWeight: 700 }}
                            >
                                乘車時間
                            </Typography>
                            <Typography variant='caption'>
                                {tripCardData.travelTime}
                            </Typography>
                        </Stack>

                        <Stack
                            direction='row'
                            sx={{ justifyContent: 'space-between' }}
                        >
                            <Typography
                                variant='caption'
                                sx={{ fontWeight: 700 }}
                            >
                                票價
                            </Typography>
                            <Typography variant='caption'>
                                {tripCardData.fare}
                            </Typography>
                        </Stack>
                    </Stack>

                    <Divider sx={{ my: 1 }} />

                    <Typography
                        variant='caption'
                        sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}
                    >
                        設備
                    </Typography>

                    {/* 起始車站設備 */}
                    <Typography
                        variant='caption'
                        sx={{
                            fontWeight: 600,
                            display: 'block',
                            mt: 0.5,
                        }}
                    >
                        {tripCardData.startStation}
                    </Typography>
                    {renderFacilities(tripCardData.startFacilities)}

                    {/* 終點車站設備 */}
                    <Typography
                        variant='caption'
                        sx={{
                            fontWeight: 600,
                            display: 'block',
                            mt: 1,
                        }}
                    >
                        {tripCardData.endStation}
                    </Typography>
                    {renderFacilities(tripCardData.endFacilities)}
                </CardContent>
            </Card>
        </Box>
    );
};

export default NetworkMapPage;
