import { useMemo, useState } from 'react';

import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
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

import { MetroMapContainer } from '@/components/metroMap/MetroMapContainer';
import { useMetroMapStore } from '@/stores/metroMapStore';
import { useStationStore } from '@/stores/useStationStore';

interface StationOption {
  label: string;
  stationCode: string;
  group: string;
}

const equipmentFilterOptions = ['廁所', '電梯', '無障礙設施', '哺乳室', 'ATM', '置物櫃', '充電站'];
const fareTypeFilterOptions = ['全票', '優惠票'];
const travelTimeFilterOptions = ['最少轉乘次數', '最短車程時間'];

interface AdvancedFilters {
  equipment: string[];
  fare: string[];
  time: string[];
}

const SEARCH_BAR_HEIGHT = '5.5rem';

const MetroMapPage = (): React.ReactElement => {
  const { allStations, fetchRoute, isRouteLoading } = useMetroMapStore();
  const clearSelection = useStationStore((state) => state.clearSelection);

  const stationOptions = useMemo<StationOption[]>(
    () =>
      allStations.map((s) => ({
        label: `${s.nameZhTw}（${s.stationCode}）`,
        stationCode: s.stationCode,
        group: '所有車站',
      })),
    [allStations]
  );

  const [startStation, setStartStation] = useState<StationOption | null>(null);
  const [endStation, setEndStation] = useState<StationOption | null>(null);
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({
    equipment: [],
    fare: [],
    time: [],
  });
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);

  const hasEndStation = endStation !== null;
  const isMenuOpen = Boolean(menuAnchorEl);
  const totalFilterCount =
    advancedFilters.equipment.length + advancedFilters.fare.length + advancedFilters.time.length;

  const toggleFilter = (category: keyof AdvancedFilters, value: string): void => {
    setAdvancedFilters((prev) => {
      const current = prev[category];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [category]: updated };
    });
  };

  const handleSearch = async (): Promise<void> => {
    if (!startStation || !endStation) return;
    clearSelection();
    const fareType = advancedFilters.fare.includes('優惠票') ? 2 : 1;
    const routingStrategy = advancedFilters.time.includes('最短車程時間') ? 2 : 1;
    await fetchRoute({
      fromStationCode: startStation.stationCode,
      toStationCode: endStation.stationCode,
      fareType,
      routingStrategy,
    });
  };

  return (
    <Box
      sx={{
        position: 'relative',
        height: 'calc(100vh - 4.375rem)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'tertiary.light',
      }}
    >
      {/* 搜尋列*/}
      <Stack
        sx={{
          flexShrink: 0,
          backgroundColor: 'primary.main',
          px: 3,
          py: 1.5,
          gap: 1,
          height: SEARCH_BAR_HEIGHT,
          zIndex: 10,
        }}
      >
        <Stack direction='row' sx={{ alignItems: 'center', gap: 1 }}>
          <InfoOutlinedIcon sx={{ color: 'primary.contrastText', fontSize: 20 }} />
          <Typography variant='caption' sx={{ color: 'primary.contrastText' }}>
            點擊站點查看資訊，或選擇起訖車站後查詢路徑
          </Typography>
        </Stack>

        <Stack direction='row' sx={{ alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          {/* 起始車站 */}
          <Stack direction='row' sx={{ alignItems: 'center', gap: 1 }}>
            <Typography variant='body2' sx={{ color: 'primary.contrastText', flexShrink: 0 }}>
              起始車站
            </Typography>
            <Autocomplete
              value={startStation}
              onChange={(_e, v) => setStartStation(v)}
              options={stationOptions}
              groupBy={(o) => o.group}
              getOptionLabel={(o) => o.label}
              isOptionEqualToValue={(o, v) => o.stationCode === v.stationCode}
              renderOption={(props, option) => (
                <li {...props} key={`${option.group}-${option.label}`}>
                  {option.label}
                </li>
              )}
              renderInput={(params) => (
                <TextField {...params} placeholder='選擇或搜尋車站' size='small' />
              )}
              sx={{ width: 180, '& .MuiOutlinedInput-root': { backgroundColor: 'white' } }}
            />
          </Stack>

          {/* 終點車站 */}
          <Stack direction='row' sx={{ alignItems: 'center', gap: 1 }}>
            <Typography variant='body2' sx={{ color: 'primary.contrastText', flexShrink: 0 }}>
              終點車站
            </Typography>
            <Autocomplete
              value={endStation}
              onChange={(_e, v) => setEndStation(v)}
              options={stationOptions}
              groupBy={(o) => o.group}
              getOptionLabel={(o) => o.label}
              isOptionEqualToValue={(o, v) => o.stationCode === v.stationCode}
              renderOption={(props, option) => (
                <li {...props} key={`${option.group}-${option.label}`}>
                  {option.label}
                </li>
              )}
              renderInput={(params) => (
                <TextField {...params} placeholder='選擇或搜尋車站' size='small' />
              )}
              sx={{ width: 180, '& .MuiOutlinedInput-root': { backgroundColor: 'white' } }}
            />
          </Stack>

          {/* 進階查詢 */}
          <Button
            startIcon={<TuneIcon />}
            onClick={(e) => setMenuAnchorEl(e.currentTarget)}
            variant='outlined'
            size='small'
            sx={{
              color: 'primary.contrastText',
              borderColor: 'rgba(255,255,255,0.5)',
              '&:hover': { borderColor: 'white', backgroundColor: 'rgba(255,255,255,0.1)' },
            }}
          >
            進階查詢{totalFilterCount > 0 && ` (${totalFilterCount})`}
          </Button>

          <Button
            startIcon={<SearchIcon />}
            variant='contained'
            size='small'
            disabled={!startStation || !endStation || isRouteLoading}
            onClick={handleSearch}
            sx={{
              backgroundColor: 'primary.contrastText',
              color: 'primary.main',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.85)' },
            }}
          >
            {isRouteLoading ? '查詢中…' : '開始查詢'}
          </Button>

          {/* 進階查詢下拉 */}
          <Menu
            anchorEl={menuAnchorEl}
            open={isMenuOpen}
            onClose={() => setMenuAnchorEl(null)}
          >
            <ListSubheader sx={{ fontWeight: 700 }}>設備</ListSubheader>
            {equipmentFilterOptions.map((o) => (
              <MenuItem key={o} onClick={() => toggleFilter('equipment', o)}>
                <Checkbox checked={advancedFilters.equipment.includes(o)} size='small' />
                <ListItemText primary={o} />
              </MenuItem>
            ))}

            <Divider />

            <ListSubheader
              sx={{
                fontWeight: 700,
                color: hasEndStation ? 'text.primary' : 'text.disabled',
                backgroundColor: hasEndStation ? 'inherit' : 'tertiary.dark',
              }}
            >
              票價種類
            </ListSubheader>
            {fareTypeFilterOptions.map((o) => (
              <MenuItem
                key={o}
                disabled={!hasEndStation}
                onClick={() => toggleFilter('fare', o)}
                sx={!hasEndStation ? { backgroundColor: 'tertiary.dark', '&.Mui-disabled': { backgroundColor: 'tertiary.dark', opacity: 1 } } : {}}
              >
                <Checkbox checked={advancedFilters.fare.includes(o)} size='small' disabled={!hasEndStation} />
                <ListItemText primary={o} sx={{ color: hasEndStation ? 'text.primary' : 'text.disabled' }} />
              </MenuItem>
            ))}

            <Divider />

            <ListSubheader
              sx={{
                fontWeight: 700,
                color: hasEndStation ? 'text.primary' : 'text.disabled',
                backgroundColor: hasEndStation ? 'inherit' : 'tertiary.dark',
              }}
            >
              乘車時間
            </ListSubheader>
            {travelTimeFilterOptions.map((o) => (
              <MenuItem
                key={o}
                disabled={!hasEndStation}
                onClick={() => toggleFilter('time', o)}
                sx={!hasEndStation ? { backgroundColor: 'tertiary.dark', '&.Mui-disabled': { backgroundColor: 'tertiary.dark', opacity: 1 } } : {}}
              >
                <Checkbox checked={advancedFilters.time.includes(o)} size='small' disabled={!hasEndStation} />
                <ListItemText primary={o} sx={{ color: hasEndStation ? 'text.primary' : 'text.disabled' }} />
              </MenuItem>
            ))}
          </Menu>
        </Stack>
      </Stack>
      {/* D3 路網圖核心容器 */}
      <Box sx={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <MetroMapContainer />
      </Box>
    </Box>
  );
};

export default MetroMapPage;
