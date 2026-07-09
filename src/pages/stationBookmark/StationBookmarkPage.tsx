import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
} from "react";
import dayjs from "dayjs";
import { enqueueSnackbar } from "notistack";
import { debounce } from "lodash-es";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { BookmarkStationCard } from "@/components/stationBookmark/StationBookmarkCard";
import { DeleteDialog } from "@/components/DeleteDialog";
import { SearchInput } from "@/components/SearchInput";

import {
  deleteStationBookmark,
  getAllStationBookmarkPaginated,
  getStationBookmarkByStationName,
  getStationBookmarkExcel,
} from "@/services/stationBookmark";

import type { StationBookmark } from "@/services/stationBookmark/interface";

const STATION_BOOKMARK_PAGE_SIZE = 8;

const StationBookmarkPage = () => {
  const [inputValue, setInputValue] = useState("");
  const [keyword, setKeyword] = useState("");
  const [allStationBookmark, setAllStationBookmark] = useState<StationBookmark[]>([]);
  const [page, setPage] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [deletingBookmark, setDeletingBookmark] =
    useState<StationBookmark | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);

  const hasMore = page + 1 < totalPage;

  const fetchAllStationBookmark = useCallback(async (): Promise<void> => {
    setIsLoading(true);

    try {
      if (keyword) {
        const response = await getStationBookmarkByStationName({
          stationName: keyword,
        });
        setAllStationBookmark(response ? [response] : []);
        setPage(0);
        setTotalPage(1);
      } else {
        const response = await getAllStationBookmarkPaginated({
          page: 0,
          size: STATION_BOOKMARK_PAGE_SIZE,
        });
        setAllStationBookmark(response.content);
        setPage(0);
        setTotalPage(response.totalPages);
      }
    } catch (error) {
      if (keyword) {
        setAllStationBookmark([]);
        setPage(0);
        setTotalPage(0);
      } else {
        enqueueSnackbar((error as string) || "取得車站書籤失敗", {
          variant: "error",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [keyword]);

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
    []
  );

  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setInputValue(value);
    debouncedSetKeyword(value);
  };

  const handleLoadMore = async () => {
    if (isLoadingMore) return;

    const nextPage = page + 1;
    setIsLoadingMore(true);

    try {
      const response = await getAllStationBookmarkPaginated({
        page: nextPage,
        size: STATION_BOOKMARK_PAGE_SIZE,
      });
      setAllStationBookmark((prev) => [...prev, ...response.content]);
      setPage(nextPage);
      setTotalPage(response.totalPages);
    } catch (error) {
      enqueueSnackbar((error as string) || "載入更多車站書籤失敗", {
        variant: "error",
      });
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingBookmark) return;

    setIsDeleting(true);

    try {
      const response = await deleteStationBookmark({
        bookmarkId: deletingBookmark.id.toString(),
      });
      enqueueSnackbar(response.message || "車站書籤刪除成功", { variant: "success" });
      setDeletingBookmark(null);
      await fetchAllStationBookmark();
    } catch (error) {
      enqueueSnackbar((error as string) || "車站書籤刪除失敗", {
        variant: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePrint = (): void => {
    window.print();
  };

  const handleDownload = async () => {
    setIsExportingExcel(true);

    try {
      const blob = await getStationBookmarkExcel();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.setAttribute(
        "download",
        `車站書籤_${dayjs().format("YYYYMMDD")}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      enqueueSnackbar("匯出車站書籤成功", { variant: "success" });
    } catch (error) {
      enqueueSnackbar((error as string) || "匯出車站書籤失敗", { variant: "error" });
    } finally {
      setIsExportingExcel(false);
    }
  };

  return (
    <Stack
      sx={{
        width: "100%",
        maxWidth: "1280px",
        margin: "3.75rem auto",
        gap: "2rem",
        justifyContent: "center",
      }}
    >
      <Typography variant='h5'>車站書籤</Typography>
      <Stack
        direction='row'
        sx={{
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* 搜尋欄 */}
        <SearchInput
          searchTerm={inputValue}
          onChange={handleSearch}
          placeholder='請輸入車站中文名稱搜尋'
        />
        {/* 按鈕: 列印與下載全部 */}
        <Stack direction='row' sx={{ gap: "1rem", alignItems: "center" }}>
          <Button variant='outlined' color='neutral' onClick={handlePrint}>
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
          >
            下載全部
          </Button>
        </Stack>
      </Stack>
      {/* 資料顯示畫面 */}
      {isLoading && allStationBookmark.length === 0 ? (
        <Stack sx={{ alignItems: "center", py: 4 }}>
          <CircularProgress size='1.5rem' />
        </Stack>
      ) : allStationBookmark.length === 0 ? (
        <Typography
          variant='body2'
          color='text.secondary'
          sx={{ textAlign: "center", py: 4 }}
        >
          尚無車站書籤
        </Typography>
      ) : (
        <Stack sx={{ gap: 2 }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
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
                alignItems: "center",
                py: 1,
                borderTop: "1px solid",
                borderColor: "divider",
              }}
            >
              <Button
                size='small'
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                startIcon={
                  isLoadingMore ? (
                    <CircularProgress size='0.875rem' />
                  ) : undefined
                }
                sx={{
                  fontSize: "1rem",
                  backgroundColor: "transparent",
                  color: "primary.main",
                  "&:hover": {
                    backgroundColor: "transparent",
                    color: "primary.light",
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
        title={deletingBookmark?.stationNameZhTw ?? ""}
        isOpen={!!deletingBookmark}
        isSubmitting={isDeleting}
        onClose={() => setDeletingBookmark(null)}
        onDeleteItem={handleConfirmDelete}
      >
        <Typography variant='body2'>
          確定要刪除這筆車站書籤嗎？此操作無法復原。
        </Typography>
      </DeleteDialog>
    </Stack>
  );
};

export default StationBookmarkPage;
