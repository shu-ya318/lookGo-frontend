import { useEffect, useMemo } from 'react';

import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

import { useMetroMapStore } from '@/stores/metroMapStore';
import { useStationBookmarkStore } from '@/stores/stationBookmarkStore';

import { formatStationLabel } from '@/utils/station';

import type { SxProps } from '@mui/material/styles';
import type { StationOption } from '@/services/metro/interface';

const BOOKMARK_GROUP = '車站書籤';
const ALL_STATION_GROUP = '所有車站';

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
    sx?: SxProps;
}

export const StationAutocomplete = ({
    value,
    onChange,
    placeholder = '請輸入或選擇車站',
    disabled = false,
    size = 'small',
    sx,
}: StationAutocompleteProps) => {
    const stationOptions = useMetroMapStore(state => state.stationOptions);
    const fetchStationOptions = useMetroMapStore(
        state => state.fetchStationOptions
    );
    const bookmarks = useStationBookmarkStore(state => state.bookmarks);
    const fetchBookmarks = useStationBookmarkStore(
        state => state.fetchBookmarks
    );

    useEffect(() => {
        fetchStationOptions();
        fetchBookmarks();
    }, [fetchStationOptions, fetchBookmarks]);

    // StationBookmark 沒有 stationCode，需以車站中文名稱比對車站選項
    const bookmarkedSet = useMemo(
        () =>
            new Set(
                bookmarks.map(bookmark => bookmark.stationNameZhTw)
            ),
        [bookmarks]
    );

    // MUI 的 groupBy 要求陣列已依分組排序，故書籤車站需排在最前面
    const options = useMemo(() => {
        const bookmarked = stationOptions.filter(option =>
            bookmarkedSet.has(option.nameZhTw)
        );
        const rest = stationOptions.filter(
            option => !bookmarkedSet.has(option.nameZhTw)
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
                    bookmarkedSet.has(option.nameZhTw)
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
