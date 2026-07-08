import { useState } from "react";
import dayjs from "dayjs";
import { enqueueSnackbar } from "notistack";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";

import { UpdateTripPlanNameDialog } from "@/components/tripPlan/UpdateTripPlanNameDialog";

import { useStationBookmarkStore } from "@/stores/stationBookmarkStore";

import { FARE_TYPE_LABELS, ROUTING_STRATEGY_LABELS } from "@/services/metro/types";
import { getTripPlanExcel } from "@/services/tripPlan";
import { formatDateTime } from "@/utils/date";

import type { TripPlan } from "@/services/tripPlan/interface";

const CARD_HEIGHT = "20rem";

interface TripPlanCardProps {
  tripPlan: TripPlan;
  onClick: (tripPlan: TripPlan) => void;
  onDelete: (tripPlan: TripPlan) => void;
  onUpdated: (tripPlan: TripPlan) => void;
}

export function TripPlanCard({
  tripPlan,
  onClick,
  onDelete,
  onUpdated,
}: TripPlanCardProps): React.ReactElement {
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [nameDialogSessionId, setNameDialogSessionId] = useState(0);
  const [isNameDialogOpen, setIsNameDialogOpen] = useState(false);

  const bookmarks = useStationBookmarkStore((state) => state.bookmarks);
  const toggleBookmark = useStationBookmarkStore(
    (state) => state.toggleBookmark
  );

  const travelMinutes = Math.ceil(tripPlan.travelTimeSeconds / 60);

  const isFromBookmarked = bookmarks.some(
    (bookmark) => bookmark.stationId === tripPlan.fromStationId
  );
  const isToBookmarked = bookmarks.some(
    (bookmark) => bookmark.stationId === tripPlan.toStationId
  );

  const routingLabel =
    ROUTING_STRATEGY_LABELS[tripPlan.routingStrategy] ?? "最少轉乘次數";

  const handleOpenNameDialog = (): void => {
    setNameDialogSessionId((prev) => prev + 1);
    setIsNameDialogOpen(true);
  };

  const handleNameSaved = (updated: TripPlan): void => {
    onUpdated(updated);
    setIsNameDialogOpen(false);
  };

  const handleExportExcel = async (): Promise<void> => {
    setIsExportingExcel(true);
    try {
      const blob = await getTripPlanExcel({ tripPlanId: tripPlan.id });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.setAttribute(
        "download",
        `${tripPlan.name}_${dayjs().format("YYYYMMDD")}.xlsx`
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
    <Card
      elevation={4}
      sx={{
        height: CARD_HEIGHT,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        overflow: "hidden",
      }}
    >
      <CardContent
        sx={{ height: "100%", display: "flex", flexDirection: "column" }}
      >
        <Stack
          direction='row'
          sx={{ justifyContent: "space-between", alignItems: "flex-start" }}
        >
          <Stack
            direction='row'
            sx={{ alignItems: "center", gap: 0.25, minWidth: 0 }}
          >
            <Typography
              variant='body1'
              noWrap
              sx={{ fontWeight: 700, lineHeight: 1.3, minWidth: 0 }}
            >
              {tripPlan.name}
            </Typography>
            <IconButton
              size='small'
              onClick={handleOpenNameDialog}
              sx={{ p: 0.25, flexShrink: 0 }}
            >
              <EditOutlinedIcon fontSize='small' />
            </IconButton>
          </Stack>
          <IconButton
            size='small'
            onClick={() => onDelete(tripPlan)}
            sx={{ mt: -0.5, mr: -0.5, flexShrink: 0 }}
          >
            <DeleteOutlinedIcon fontSize='small' />
          </IconButton>
        </Stack>

        <Stack
          direction='row'
          sx={{ alignItems: "center", gap: 0.25, mt: 0.5, minWidth: 0 }}
        >
          <Typography variant='subtitle2' noWrap sx={{ minWidth: 0 }}>
            {tripPlan.fromStationNameZhTw}
          </Typography>
          <IconButton
            size='small'
            onClick={() => toggleBookmark(tripPlan.fromStationId)}
            sx={{ p: 0.25, flexShrink: 0 }}
          >
            {isFromBookmarked ? (
              <BookmarkIcon fontSize='small' color='primary' />
            ) : (
              <BookmarkBorderIcon fontSize='small' />
            )}
          </IconButton>
          <ArrowForwardIcon
            fontSize='small'
            sx={{ color: "text.secondary", flexShrink: 0, mx: 0.25 }}
          />
          <Typography variant='subtitle2' noWrap sx={{ minWidth: 0 }}>
            {tripPlan.toStationNameZhTw}
          </Typography>
          <IconButton
            size='small'
            onClick={() => toggleBookmark(tripPlan.toStationId)}
            sx={{ p: 0.25, flexShrink: 0 }}
          >
            {isToBookmarked ? (
              <BookmarkIcon fontSize='small' color='primary' />
            ) : (
              <BookmarkBorderIcon fontSize='small' />
            )}
          </IconButton>
        </Stack>
        <Divider sx={{ my: 1 }} />
        <Stack direction='row' sx={{ justifyContent: "space-between" }}>
          <Typography variant='caption' color='text.secondary'>
            {FARE_TYPE_LABELS[tripPlan.fareType] ?? "全票"}
          </Typography>
          <Typography variant='caption' sx={{ fontWeight: 700 }}>
            NT${tripPlan.farePrice}
          </Typography>
        </Stack>
        <Stack direction='row' sx={{ justifyContent: "space-between" }}>
          <Typography variant='caption' color='text.secondary' noWrap>
            車程（{routingLabel}）
          </Typography>
          <Typography
            variant='caption'
            sx={{ fontWeight: 700, flexShrink: 0, ml: 1 }}
          >
            {travelMinutes} 分鐘
          </Typography>
        </Stack>
        <Divider sx={{ my: 1 }} />
        <Box sx={{ flexGrow: 1, minHeight: 0 }}>
          <Typography
            variant='caption'
            color='text.secondary'
            sx={{ display: "block", mb: 0.5, fontWeight: 600 }}
          >
            筆記
          </Typography>
          <Tooltip
            title={tripPlan.notes || ""}
            disableHoverListener={!tripPlan.notes}
          >
            <Typography
              variant='body2'
              color={tripPlan.notes ? "text.primary" : "text.disabled"}
              sx={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {tripPlan.notes || "尚無筆記"}
            </Typography>
          </Tooltip>
        </Box>
        <Divider sx={{ my: 1 }} />
        <Typography variant='caption' sx={{ color: "text.secondary" }}>
          更新時間：{formatDateTime(tripPlan.updatedAt)}
        </Typography>
        <Stack direction='row' sx={{ gap: 1, mt: 1 }}>
          <Button
            size='small'
            variant='outlined'
            color='neutral'
            startIcon={<FileDownloadOutlinedIcon fontSize='small' />}
            loading={isExportingExcel}
            onClick={handleExportExcel}
          >
            匯出 Excel
          </Button>
          <Button
            size='small'
            variant='contained'
            sx={{ backgroundColor: "primary.main" }}
            startIcon={<EditOutlinedIcon fontSize='small' />}
            onClick={() => onClick(tripPlan)}
          >
            編輯旅程資訊
          </Button>
        </Stack>
      </CardContent>

      <UpdateTripPlanNameDialog
        key={nameDialogSessionId}
        isOpen={isNameDialogOpen}
        onClose={() => setIsNameDialogOpen(false)}
        tripPlan={tripPlan}
        onSaved={handleNameSaved}
      />
    </Card>
  );
}
