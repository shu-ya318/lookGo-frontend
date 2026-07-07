import { useCallback, useEffect, useState } from "react";
import dayjs from "dayjs";
import { enqueueSnackbar } from "notistack";

import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";

import placeholderImg from "@/assets/placeholder.png";

import { DeleteDialog } from "@/components/DeleteDialog";

import {
  deleteBookmark,
  getAllBookmarkPaginated,
  getBookmarkExcel,
} from "@/services/stationBookmark";
import { formatDateTime } from "@/utils/date";

import type { StationBookmark } from "@/services/stationBookmark/interface";

const BOOKMARK_PAGE_SIZE = 16;

const StationBookmarkPage = () => {
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
      const response = await getAllBookmarkPaginated({
        page: 0,
        size: BOOKMARK_PAGE_SIZE,
      });
      setBookmarks(response.content);
      setPage(0);
      setTotalPages(response.totalPages);
    } catch (error) {
      enqueueSnackbar((error as string) || "取得車站書籤失敗", {
        variant: "error",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchBookmarks();
  }, [fetchBookmarks]);

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
      }}
    >
      <Stack
        sx={{
          alignItems: "center",
          gap: "1rem",
          py: 3,
          backgroundColor: "quaternary.dark",
          borderRadius: 2,
        }}
      >
        <Typography variant='h5'>車站書籤</Typography>
        <Stack direction='row' sx={{ gap: 2 }}>
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
            下載
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
        <Stack
          sx={{
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          {bookmarks.map((bookmark, index) => (
            <Stack key={bookmark.id}>
              {index > 0 && (
                <Divider sx={{ borderColor: "tertiary.dark" }} />
              )}
              <Stack
                direction='row'
                sx={{
                  alignItems: "center",
                  px: 4,
                  py: 3,
                  backgroundColor: "tertiary.dark",
                }}
              >
                <Avatar
                  src={placeholderImg}
                  variant='circular'
                  sx={{
                    width: 64,
                    height: 64,
                    mr: 3,
                    flexShrink: 0,
                  }}
                />
                <Stack sx={{ flex: 1, gap: 0.5 }}>
                  <Typography variant='body2' sx={{ fontWeight: 700 }}>
                    {bookmark.stationNameZhTw}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    收藏時間：{formatDateTime(bookmark.createdAt)}
                  </Typography>
                </Stack>
                <IconButton
                  size='small'
                  onClick={() => setDeletingBookmark(bookmark)}
                >
                  <DeleteOutlinedIcon fontSize='small' />
                </IconButton>
              </Stack>
            </Stack>
          ))}

          {hasMore && (
            <Stack
              sx={{
                alignItems: "center",
                py: 2,
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
