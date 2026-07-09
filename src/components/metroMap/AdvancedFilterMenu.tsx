import { useState } from 'react';

import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Radio from '@mui/material/Radio';
import TuneIcon from '@mui/icons-material/Tune';

import {
  FareType,
  RoutingStrategy,
  FARE_TYPE_OPTIONS,
  ROUTING_STRATEGY_OPTIONS,
  STATION_FACILITY_OPTIONS,
  type StationFacility,
} from '@/services/metro/types';

export interface AdvancedFilters {
  equipment: StationFacility[];
  fare: FareType | null;
  routingStrategy: RoutingStrategy | null;
}

interface AdvancedFilterMenuProps {
  filters: AdvancedFilters;
  isSingleStationMode: boolean;
  isRouteMode: boolean;
  disabled: boolean;
  controlHeight: string;
  onToggleEquipment: (value: StationFacility) => void;
  onSelectFare: (value: FareType) => void;
  onSelectTime: (value: RoutingStrategy) => void;
}

export const AdvancedFilterMenu = ({
  filters,
  isSingleStationMode,
  isRouteMode,
  disabled,
  controlHeight,
  onToggleEquipment,
  onSelectFare,
  onSelectTime,
}: AdvancedFilterMenuProps) => {
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);

  const isMenuOpen = Boolean(menuAnchorEl);
  const totalFilterCount =
    filters.equipment.length + (filters.fare ? 1 : 0) + (filters.routingStrategy ? 1 : 0);

  return (
    <>
      {/* 進階查詢按鈕 */}
      <Button
        startIcon={<TuneIcon />}
        onClick={(event) => setMenuAnchorEl(event.currentTarget)}
        variant='outlined'
        size='small'
        disabled={disabled}
        sx={{
          height: controlHeight,
          minWidth: 140,
          color: 'primary.contrastText',
          borderColor: 'rgba(255,255,255,0.5)',
          '&:hover': {
            borderColor: 'white',
            backgroundColor: 'rgba(255,255,255,0.1)',
          },
        }}
      >
        進階查詢{totalFilterCount > 0 && ` (${totalFilterCount})`}
      </Button>
      {/* 進階查詢選單 */}
      <Menu
        anchorEl={menuAnchorEl}
        open={isMenuOpen}
        onClose={() => setMenuAnchorEl(null)}
      >
        {isSingleStationMode && (
          <>
            <ListSubheader sx={{ fontWeight: 700 }}>設備</ListSubheader>
            {STATION_FACILITY_OPTIONS.map(({ value, label }) => (
              <MenuItem key={value} onClick={() => onToggleEquipment(value)}>
                <Checkbox
                  checked={filters.equipment.includes(value)}
                  size='small'
                />
                <ListItemText primary={label} />
              </MenuItem>
            ))}
          </>
        )}

        {isRouteMode && (
          <>
            <ListSubheader sx={{ fontWeight: 700 }}>票價種類</ListSubheader>
            {FARE_TYPE_OPTIONS.map(({ value, label }) => (
              <MenuItem key={value} onClick={() => onSelectFare(value)}>
                <Radio checked={filters.fare === value} size='small' />
                <ListItemText primary={label} />
              </MenuItem>
            ))}
            <Divider />
            <ListSubheader sx={{ fontWeight: 700 }}>乘車時間</ListSubheader>
            {ROUTING_STRATEGY_OPTIONS.map(({ value, label }) => (
              <MenuItem key={value} onClick={() => onSelectTime(value)}>
                <Radio checked={filters.routingStrategy === value} size='small' />
                <ListItemText primary={label} />
              </MenuItem>
            ))}
          </>
        )}
      </Menu>
    </>
  );
};
