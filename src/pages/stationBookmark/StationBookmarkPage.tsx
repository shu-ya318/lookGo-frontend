import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
} from 'react';
import dayjs from 'dayjs';
import { enqueueSnackbar } from 'notistack';
import { debounce } from 'lodash-es';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { BookmarkStationCard } from '@/components/stationBookmark/StationBookmarkCard';
import { DeleteDialog } from '@/components/DeleteDialog';
import { SearchInput } from '@/components/SearchInput';

import {
  deleteStationBookmark,
  getAllStationBookmarkPaginated,
  getStationBookmarkByStationName,
  getStationBookmarkExcel,
} from '@/services/stationBookmark';

import type { StationBookmark } from '@/services/stationBookmark/interface';

const STATION_BOOKMARK_PAGE_SIZE = 8;

const StationBookmarkPage = () => {
  const [inputValue, setInputValue] = useState('');
  const [keyword, setKeyword] = useState('');
  const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC'>('DESC');
  const [allStationBookmark, setAllStationBookmark] = useState<
    StationBookmark[]
  >([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [isBookmarksLoading, setIsBookmarksLoading] = useState(false);
  const [isMoreBookmarksLoading, setIsMoreBookmarksLoading] = useState(false);

  const [deletingBookmark, setDeletingBookmark] =
    useState<StationBookmark | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isExportingExcel, setIsExportingExcel] = useState(false);

  const hasMore = page + 1 < totalPages;

  const fetchAllStationBookmark = useCallback(async () => {
    setIsBookmarksLoading(true);

    try {
      if (keyword) {
        const response = await getStationBookmarkByStationName({
          stationName: keyword,
        });
        setAllStationBookmark(response ? [response] : []);
        setPage(0);
        setTotalPages(1);
      } else {
        const response = await getAllStationBookmarkPaginated({
          page: 0,
          size: STATION_BOOKMARK_PAGE_SIZE,
          sortDirection,
        });
        setAllStationBookmark(response.content);
        setPage(0);
        setTotalPages(response.totalPages);
      }
    } catch (error) {
      if (keyword) {
        setAllStationBookmark([]);
        setPage(0);
        setTotalPages(0);
      } else {
        enqueueSnackbar((error as string) || '取得車站書籤失敗', {
          variant: 'error',
        });
      }
    } finally {
      setIsBookmarksLoading(false);
    }
  }, [keyword, sortDirection]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAllStationBookmark();
  }, [fetchAllStationBookmark]);

  const debouncedSetKeyword = useMemo(
    () =>
      debounce((value: string) => {
        setPage(0);
        setKeyword(value);
      }, 500),
    [],
  );

  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setInputValue(value);
    debouncedSetKeyword(value);
  };

  const handleLoadMore = async () => {
    if (isMoreBookmarksLoading) return;

    const nextPage = page + 1;
    setIsMoreBookmarksLoading(true);

    try {
      const response = await getAllStationBookmarkPaginated({
        page: nextPage,
        size: STATION_BOOKMARK_PAGE_SIZE,
        sortDirection,
      });
      setAllStationBookmark((prev) => [...prev, ...response.content]);
      setPage(nextPage);
      setTotalPages(response.totalPages);
    } catch (error) {
      enqueueSnackbar((error as string) || '載入更多車站書籤失敗', {
        variant: 'error',
      });
    } finally {
      setIsMoreBookmarksLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingBookmark) return;

    setIsDeleting(true);

    try {
      const response = await deleteStationBookmark({
        bookmarkId: deletingBookmark.id,
      });
      enqueueSnackbar(response.message || '車站書籤刪除成功', {
        variant: 'success',
      });
      setDeletingBookmark(null);
      await fetchAllStationBookmark();
    } catch (error) {
      enqueueSnackbar((error as string) || '車站書籤刪除失敗', {
        variant: 'error',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    setIsExportingExcel(true);

    try {
      const blob = await getStationBookmarkExcel();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.setAttribute(
        'download',
        `車站書籤_${dayjs().format('YYYYMMDD')}.xlsx`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      enqueueSnackbar('匯出車站書籤成功', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar((error as string) || '匯出車站書籤失敗', {
        variant: 'error',
      });
    } finally {
      setIsExportingExcel(false);
    }
  };

  return (
    <Stack
      sx={{
        width: '100%',
        maxWidth: '1280px',
        margin: '3.75rem auto',
        px: { xs: 2, sm: 3, lg: 0 },
        gap: '2rem',
        justifyContent: 'center',
      }}
    >
      <Typography variant='h5'>車站書籤</Typography>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        sx={{
          alignItems: { xs: 'stretch', sm: 'center' },
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        {/* 搜尋欄與排序選單 */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          sx={{ alignItems: { xs: 'stretch', sm: 'center' }, gap: 1, flexWrap: 'wrap' }}
        >
          <Box sx={{ width: { xs: '100%', sm: '15.5rem' } }}>
            <SearchInput
              width='100%'
              searchTerm={inputValue}
              onChange={handleSearch}
              placeholder='請輸入車站中文名稱搜尋'
            />
          </Box>
          {/* 有關鍵字時走單筆查詢 API，排序無意義故 disabled */}
          <Select
            size='small'
            value={sortDirection}
            disabled={!!keyword}
            onChange={(event) => {
              setPage(0);
              setSortDirection(event.target.value as 'ASC' | 'DESC');
            }}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            <MenuItem value='DESC'>收藏時間：新 → 舊</MenuItem>
            <MenuItem value='ASC'>收藏時間：舊 → 新</MenuItem>
          </Select>
        </Stack>
        {/* 按鈕: 列印與下載全部 */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          sx={{
            gap: '1rem',
            alignItems: { xs: 'stretch', sm: 'center' },
            width: { xs: '100%', sm: 'auto' },
          }}
        >
          <Button
            variant='outlined'
            color='neutral'
            onClick={handlePrint}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            列印
          </Button>
          <Button
            variant='outlined'
            color='neutral'
            disabled={isExportingExcel}
            startIcon={
              isExportingExcel ? (
                <CircularProgress size='0.875rem' color='inherit' />
              ) : undefined
            }
            onClick={handleDownload}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            下載全部
          </Button>
        </Stack>
      </Stack>
      {/* 資料顯示畫面 */}
      {isBookmarksLoading && allStationBookmark.length === 0 ? (
        <Stack sx={{ alignItems: 'center', py: 4 }}>
          <CircularProgress size='1.5rem' />
        </Stack>
      ) : allStationBookmark.length === 0 ? (
        <Typography
          variant='body2'
          color='text.secondary'
          sx={{ textAlign: 'center', py: 4 }}
        >
          尚無車站書籤
        </Typography>
      ) : (
        <Stack sx={{ gap: 2 }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(auto-fill, minmax(280px, 1fr))',
              },
              gap: 2,
            }}
          >
            {allStationBookmark.map((bookmark) => (
              <BookmarkStationCard
                key={bookmark.id}
                bookmark={bookmark}
                onDelete={setDeletingBookmark}
              />
            ))}
          </Box>
          {/* 載入更多車站書籤按鈕 */}
          {hasMore && (
            <Stack
              sx={{
                alignItems: 'center',
                py: 1,
                borderTop: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Button
                size='small'
                onClick={handleLoadMore}
                disabled={isMoreBookmarksLoading}
                startIcon={
                  isMoreBookmarksLoading ? (
                    <CircularProgress size='0.875rem' />
                  ) : undefined
                }
                sx={{
                  fontSize: '1rem',
                  backgroundColor: 'transparent',
                  color: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'transparent',
                    color: 'primary.light',
                  },
                }}
              >
                載入更多車站書籤...
              </Button>
            </Stack>
          )}
        </Stack>
      )}
      {/* 刪除確認對話框 */}
      <DeleteDialog
        title={deletingBookmark?.stationNameZhTw ?? ''}
        isOpen={!!deletingBookmark}
        isSubmitting={isDeleting}
        onClose={() => setDeletingBookmark(null)}
        onDeleteItem={handleConfirmDelete}
      >
        <Typography variant='body2'>
          確定刪除這筆車站書籤嗎？此操作無法復原。
        </Typography>
      </DeleteDialog>
    </Stack>
  );
};

export default StationBookmarkPage;
