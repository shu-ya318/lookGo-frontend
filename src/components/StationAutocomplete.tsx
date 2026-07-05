import { useEffect, useMemo } from 'react';

import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

import { useMetroMapStore } from '@/stores/metroMapStore';

import { formatStationLabel } from '@/utils/station';

import type { SxProps } from '@mui/material/styles';
import type { StationOption } from '@/services/metro/interface';

const BOOKMARK_GROUP = '車站書籤';
const ALL_STATION_GROUP = '所有車站';

// 尚無書籤車站時，用不可選取的佔位選項讓「車站書籤」分類仍然顯示
const EMPTY_BOOKMARK_OPTION: StationOption = {
    stationCode: '__EMPTY_BOOKMARK__',
    nameZhTw: '--',
};

interface StationAutocompleteProps {
    value: StationOption | null;
    onChange: (station: StationOption | null) => void;
    placeholder?: string;
    disabled?: boolean;
    size?: 'small' | 'medium';
    // 書籤資料由呼叫方傳入（書籤 store/API 尚未建立前可省略，預設無分組）
    bookmarkedStationCodes?: string[];
    sx?: SxProps;
}

export const StationAutocomplete = ({
    value,
    onChange,
    placeholder = '請輸入或選擇車站',
    disabled = false,
    size = 'small',
    bookmarkedStationCodes = [],
    sx,
}: StationAutocompleteProps) => {
    const stationOptions = useMetroMapStore(state => state.stationOptions);
    const fetchStationOptions = useMetroMapStore(
        state => state.fetchStationOptions
    );

    useEffect(() => {
        fetchStationOptions();
    }, [fetchStationOptions]);

    const bookmarkedSet = useMemo(
        () => new Set(bookmarkedStationCodes),
        [bookmarkedStationCodes]
    );

    // MUI 的 groupBy 要求陣列已依分組排序，故書籤車站需排在最前面
    const options = useMemo(() => {
        const bookmarked = stationOptions.filter(option =>
            bookmarkedSet.has(option.stationCode)
        );
        const rest = stationOptions.filter(
            option => !bookmarkedSet.has(option.stationCode)
        );
        const bookmarkedSection =
            bookmarked.length > 0 ? bookmarked : [EMPTY_BOOKMARK_OPTION];
        return [...bookmarkedSection, ...rest];
    }, [stationOptions, bookmarkedSet]);

    const getOptionLabel = (option: StationOption): string =>
        option.stationCode === EMPTY_BOOKMARK_OPTION.stationCode
            ? EMPTY_BOOKMARK_OPTION.nameZhTw
            : formatStationLabel(option);

    return (
        <Autocomplete
            value={value}
            onChange={(_event, newValue) => onChange(newValue)}
            options={options}
            groupBy={option =>
                option.stationCode === EMPTY_BOOKMARK_OPTION.stationCode ||
                bookmarkedSet.has(option.stationCode)
                    ? BOOKMARK_GROUP
                    : ALL_STATION_GROUP
            }
            getOptionLabel={getOptionLabel}
            getOptionDisabled={option =>
                option.stationCode === EMPTY_BOOKMARK_OPTION.stationCode
            }
            isOptionEqualToValue={(option, val) =>
                option.stationCode === val.stationCode
            }
            renderOption={(props, option) => (
                <li
                    {...props}
                    key={option.stationCode}
                    style={
                        option.stationCode === EMPTY_BOOKMARK_OPTION.stationCode
                            ? { pointerEvents: 'none', opacity: 0.5 }
                            : undefined
                    }
                >
                    {getOptionLabel(option)}
                </li>
            )}
            disabled={disabled}
            size={size}
            renderInput={params => (
                <TextField {...params} placeholder={placeholder} size={size} />
            )}
            sx={sx}
        />
    );
};
