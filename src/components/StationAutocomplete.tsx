import { useEffect, useMemo } from 'react';

import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';

import { useMetroMapStore } from '@/stores/metroMapStore';
import { useStationBookmarkStore } from '@/stores/stationBookmarkStore';

import { formatStationLabel } from '@/utils/station';
import { normalizeHexColor } from '@/utils/route';

import type { SxProps } from '@mui/material/styles';
import type { StationOption } from '@/services/metro/interface';

const BOOKMARK_GROUP = '車站書籤';
const ALL_STATION_GROUP = '所有車站';

/* 沒任何書籤時寫入的假選項，讓「車站書籤」組標題仍顯示。
 * stationCode 僅作為 React key 與型別佔位，定義雙底線避免與真實車站代碼發生同名衝突
 */
const EMPTY_BOOKMARK_OPTION = {
  stationCode: '__EMPTY_BOOKMARK__',
  nameZhTw: '尚無書籤車站',
  lineColor: '',
};

// 佔位選項是模組層級常數，直接以參考相等（===）來區別
const isEmptyBookmarkOption = (option: StationOption) =>
  option === EMPTY_BOOKMARK_OPTION;

interface StationAutocompleteProps {
  value: StationOption | null;
  onChange: (station: StationOption | null) => void;
  placeholder?: string;
  disabled?: boolean;
  disableClearable?: boolean;
  size?: 'small' | 'medium';
  sx?: SxProps;
}

export const StationAutocomplete = ({
  value,
  onChange,
  placeholder = '請輸入或選擇車站',
  disabled = false,
  disableClearable = false,
  size = 'small',
  sx,
}: StationAutocompleteProps) => {
  const stationOptions = useMetroMapStore((state) => state.stationOptions);
  const fetchAllStationOption = useMetroMapStore(
    (state) => state.fetchAllStationOption,
  );
  const bookmarks = useStationBookmarkStore((state) => state.bookmarks);
  const fetchAllBookmark = useStationBookmarkStore(
    (state) => state.fetchAllBookmark,
  );

  useEffect(() => {
    fetchAllStationOption();
    fetchAllBookmark();
  }, [fetchAllStationOption, fetchAllBookmark]);

  // StationBookmark 沒有 stationCode，需以車站中文名稱比對車站選項
  const bookmarkedSet = useMemo(
    () => new Set(bookmarks.map((bookmark) => bookmark.stationNameZhTw)),
    [bookmarks],
  );

  const options = useMemo(() => {
    const bookmarked = stationOptions.filter((option) =>
      bookmarkedSet.has(option.nameZhTw),
    );

    const rest = stationOptions.filter(
      (option) => !bookmarkedSet.has(option.nameZhTw),
    );

    const bookmarkedSection =
      bookmarked.length > 0 ? bookmarked : [EMPTY_BOOKMARK_OPTION];

    return [...bookmarkedSection, ...rest];
  }, [stationOptions, bookmarkedSet]);

  const getOptionLabel = (option: StationOption) =>
    isEmptyBookmarkOption(option)
      ? EMPTY_BOOKMARK_OPTION.nameZhTw
      : formatStationLabel(option);

  return (
    <Autocomplete
      value={value}
      onChange={(_event, newValue) => onChange(newValue)}
      disableClearable={disableClearable}
      options={options}
      groupBy={(option) =>
        isEmptyBookmarkOption(option) || bookmarkedSet.has(option.nameZhTw)
          ? BOOKMARK_GROUP
          : ALL_STATION_GROUP
      }
      getOptionLabel={getOptionLabel}
      getOptionDisabled={isEmptyBookmarkOption}
      isOptionEqualToValue={(option, value) =>
        option.stationCode === value.stationCode
      }
      renderOption={(props, option) => (
        <li {...props} key={option.stationCode}>
          <Stack direction='row' sx={{ alignItems: 'center', gap: 1 }}>
            {/*車站中文名稱*/}
            <Typography variant='body2'>{option.nameZhTw}</Typography>
            {/*車站代碼 */}
            {!isEmptyBookmarkOption(option) && (
              <Chip
                label={option.stationCode}
                size='small'
                sx={{
                  fontWeight: 700,
                  fontSize: 11,
                  bgcolor: normalizeHexColor(option.lineColor),
                  color: '#fff',
                }}
              />
            )}
          </Stack>
        </li>
      )}
      disabled={disabled}
      size={size}
      renderInput={(params) => (
        <TextField {...params} placeholder={placeholder} size={size} />
      )}
      sx={sx}
    />
  );
};
