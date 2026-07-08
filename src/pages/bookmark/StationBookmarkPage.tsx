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

import { BookmarkStationCard } from "@/components/bookmark/BookmarkStationCard";
import { DeleteDialog } from "@/components/DeleteDialog";
import { SearchInput } from "@/components/SearchInput";

import {
  deleteBookmark,
  getAllBookmarkPaginated,
  getBookmarkByStationName,
  getBookmarkExcel,
} from "@/services/stationBookmark";

import type { StationBookmark } from "@/services/stationBookmark/interface";

const BOOKMARK_PAGE_SIZE = 8;

const StationBookmarkPage = () => {
  const [inputValue, setInputValue] = useState("");
  const [keyword, setKeyword] = useState("");
  const [bookmarks, setBookmarks] = useState<StationBookmark[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [deletingBookmark, setDeletingBookmark] =
    useState<StationBookmark | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);

  const hasMore = page + 1 < totalPages;

  const fetchBookmarks = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      if (keyword) {
        const response = await getBookmarkByStationName({ stationName: keyword });
        setBookmarks(response ? [response] : []);
        setPage(0);
        setTotalPages(1);
      } else {
        const response = await getAllBookmarkPaginated({
          page: 0,
          size: BOOKMARK_PAGE_SIZE,
        });
        setBookmarks(response.content);
        setPage(0);
        setTotalPages(response.totalPages);
      }
    } catch (error) {
      if (keyword) {
        setBookmarks([]);
        setPage(0);
        setTotalPages(0);
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
    fetchBookmarks();
  }, [fetchBookmarks]);

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

  const handleLoadMore = async (): Promise<void> => {
    if (isLoadingMore) return;

    const nextPage = page + 1;

    setIsLoadingMore(true);
    try {
      const response = await getAllBookmarkPaginated({
        page: nextPage,
        size: BOOKMARK_PAGE_SIZE,
      });
      setBookmarks((prev) => [...prev, ...response.content]);
      setPage(nextPage);
      setTotalPages(response.totalPages);
    } catch (error) {
      enqueueSnackbar((error as string) || "載入更多車站書籤失敗", {
        variant: "error",
      });
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleConfirmDelete = async (): Promise<void> => {
    if (!deletingBookmark) return;

    setIsDeleting(true);
    try {
      const { message } = await deleteBookmark({
        bookmarkId: deletingBookmark.id.toString(),
      });
      enqueueSnackbar(message || "書籤刪除成功", { variant: "success" });
      setDeletingBookmark(null);
      await fetchBookmarks();
    } catch (error) {
      enqueueSnackbar((error as string) || "書籤刪除失敗", {
        variant: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePrint = (): void => {
    window.print();
  };

  const handleDownload = async (): Promise<void> => {
    setIsExportingExcel(true);
    try {
      const blob = await getBookmarkExcel();
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

      enqueueSnackbar("匯出成功", { variant: "success" });
    } catch (error) {
      enqueueSnackbar((error as string) || "匯出失敗", { variant: "error" });
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
        {/* Search */}
        <SearchInput
          searchTerm={inputValue}
          onChange={handleSearch}
          placeholder='請輸入車站中文名稱搜尋'
        />

        {/* Button: Print & Download all */}
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

      {isLoading && bookmarks.length === 0 ? (
        <Stack sx={{ alignItems: "center", py: 4 }}>
          <CircularProgress size='1.5rem' />
        </Stack>
      ) : bookmarks.length === 0 ? (
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
            {bookmarks.map((bookmark) => (
              <BookmarkStationCard
                key={bookmark.id}
                bookmark={bookmark}
                onDelete={setDeletingBookmark}
              />
            ))}
          </Box>

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
