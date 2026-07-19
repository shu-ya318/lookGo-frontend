import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';

import { RequiredFieldLabel } from '@/components/tripPlan/RequiredFieldLabel';

import {
  FARE_TYPE_LABELS,
  FARE_TYPE_OPTIONS,
  ROUTING_STRATEGY_LABELS,
  ROUTING_STRATEGY_OPTIONS,
  type FareType,
  type RoutingStrategy,
} from '@/services/metro/types';
import type { TripResult } from '@/components/tripPlan/hooks/useTripRouteQuery';

export interface TripRouteFilters {
  fare: FareType | null;
  routingStrategy: RoutingStrategy | null;
}

interface ToggleFieldProps<T extends number> {
  label: string;
  value: T | null;
  options: readonly { value: T; label: string }[];
  disabled: boolean;
  onChange: (value: T | null) => void;
}

// 票價種類與車程時間共用的單選欄位，搭配泛型
const ToggleField = <T extends number>({
  label,
  value,
  options,
  disabled,
  onChange,
}: ToggleFieldProps<T>) => {
  return (
    <Stack sx={{ gap: 0.5 }}>
      <RequiredFieldLabel label={label} disabled={disabled} />
      <ToggleButtonGroup
        value={value}
        onChange={(_event, selected: T | null) => onChange(selected)}
        exclusive
        size='small'
        disabled={disabled}
        sx={{ flexWrap: 'wrap' }}
      >
        {options.map(({ value: optionValue, label: optionLabel }) => (
          <ToggleButton key={optionValue} value={optionValue}>
            {optionLabel}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Stack>
  );
};

interface TripRouteFilterSectionProps {
  filters: TripRouteFilters;
  disabled: boolean;
  isSearching: boolean;
  tripResult: TripResult | null;
  onFareChange: (value: FareType | null) => void;
  onRoutingStrategyChange: (value: RoutingStrategy | null) => void;
}

export const TripRouteFilterSection = ({
  filters,
  disabled,
  isSearching,
  tripResult,
  onFareChange,
  onRoutingStrategyChange,
}: TripRouteFilterSectionProps) => {
  return (
    <>
      {/* 票價種類 */}
      <ToggleField
        label='票價種類'
        value={filters.fare}
        options={FARE_TYPE_OPTIONS}
        disabled={disabled}
        onChange={onFareChange}
      />
      {/* 車程時間 */}
      <ToggleField
        label='車程時間'
        value={filters.routingStrategy}
        options={ROUTING_STRATEGY_OPTIONS}
        disabled={disabled}
        onChange={onRoutingStrategyChange}
      />
      {/* 查詢中 */}
      {isSearching && (
        <Stack sx={{ alignItems: 'center', py: 1 }}>
          <CircularProgress size='1.5rem' />
        </Stack>
      )}
      {/* 查詢結果摘要 */}
      {tripResult && (
        <Stack sx={{ gap: 2 }}>
          <Stack direction='row' sx={{ justifyContent: 'space-between' }}>
            <Typography variant='body2' color='text.secondary'>
              {FARE_TYPE_LABELS[tripResult.fareType] ?? '全票'}
            </Typography>
            <Typography variant='body2' sx={{ fontWeight: 700 }}>
              {tripResult.farePrice !== null && tripResult.farePrice !== undefined
                ? `NT$${tripResult.farePrice}`
                : '--'}
            </Typography>
          </Stack>
          <Stack direction='row' sx={{ justifyContent: 'space-between' }}>
            <Typography variant='body2' color='text.secondary'>
              車程（
              {ROUTING_STRATEGY_LABELS[tripResult.routingStrategy] ??
                '最少轉乘次數'}
              ）
            </Typography>
            <Typography variant='body2' sx={{ fontWeight: 700 }}>
              {Math.ceil(tripResult.totalTravelTimeSeconds / 60)} 分鐘
            </Typography>
          </Stack>
        </Stack>
      )}
    </>
  );
};
