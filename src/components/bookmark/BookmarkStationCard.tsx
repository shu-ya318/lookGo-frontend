import { useEffect, useMemo, useState } from "react";
import { enqueueSnackbar } from "notistack";

import BookmarkIcon from "@mui/icons-material/Bookmark";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { Dialog } from "@/components/Dialog";
import { StationFacilityList } from "@/components/StationFacilityList";

import { useMetroMapStore } from "@/stores/metroMapStore";

import { getStationById } from "@/services/metro";
import { formatDateTime } from "@/utils/date";

import type { Station } from "@/services/metro/interface";
import type { StationBookmark } from "@/services/stationBookmark/interface";

const CARD_HEIGHT = "12rem";

// 路線代表色通常以不含 # 的六碼色碼儲存，統一補上前綴才能當作 CSS 色值使用
function normalizeColor(raw: string): string {
  return raw.startsWith("#") ? raw : `#${raw}`;
}

interface BookmarkStationCardProps {
  bookmark: StationBookmark;
  onDelete: (bookmark: StationBookmark) => void;
}

export function BookmarkStationCard({
  bookmark,
  onDelete,
}: BookmarkStationCardProps): React.ReactElement {
  const [isFacilityDialogOpen, setIsFacilityDialogOpen] = useState(false);
  const [facilityStation, setFacilityStation] = useState<Station | null>(
    null
  );
  const [isFacilityLoading, setIsFacilityLoading] = useState(false);

  const lines = useMetroMapStore((state) => state.lines);
  const fetchMetroMap = useMetroMapStore((state) => state.fetchMetroMap);

  useEffect(() => {
    fetchMetroMap();
  }, [fetchMetroMap]);

  // 車站可能同時隸屬多條路線（轉乘站），逐一比對每條路線是否含此車站
  const stationLines = useMemo(
    () =>
      lines.flatMap((line) => {
        const matchedStation = line.stations.find(
          (s) => s.stationId === bookmark.stationId
        );
        return matchedStation
          ? [{ line, stationCode: matchedStation.stationCode }]
          : [];
      }),
    [lines, bookmark.stationId]
  );

  const handleOpenFacilityDialog = async (): Promise<void> => {
    setIsFacilityDialogOpen(true);

    // 已載入過的設備資訊直接沿用，避免重複請求
    if (facilityStation) return;

    setIsFacilityLoading(true);
    try {
      const result = await getStationById({
        id: bookmark.stationId.toString(),
      });
      setFacilityStation(result);
    } catch (error) {
      enqueueSnackbar((error as string) || "取得設備資訊失敗", {
        variant: "error",
      });
    } finally {
      setIsFacilityLoading(false);
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
      <CardContent sx={{ height: "100%" }}>
        <Stack
          direction='row'
          sx={{ justifyContent: "space-between", alignItems: "flex-start" }}
        >
          <Stack sx={{ minWidth: 0 }}>
            <Typography
              variant='body1'
              noWrap
              sx={{ fontWeight: 700, lineHeight: 1.3 }}
            >
              {bookmark.stationNameZhTw}
            </Typography>
            <Typography variant='caption' color='text.secondary' noWrap>
              {bookmark.stationNameEn}
            </Typography>
          </Stack>
          <IconButton
            size='small'
            onClick={() => onDelete(bookmark)}
            sx={{ mt: -0.5, mr: -0.5, flexShrink: 0 }}
          >
            <BookmarkIcon fontSize='small' color='primary' />
          </IconButton>
        </Stack>
        <Stack
          direction='row'
          sx={{ flexWrap: "wrap", gap: 0.75, minHeight: "1.5rem", mt: 2 }}
        >
          {stationLines.map(({ line, stationCode }) => (
            <Chip
              key={line.letter}
              label={`${stationCode} ${line.nameZhTw}`}
              size='small'
              sx={{
                backgroundColor: normalizeColor(line.color),
                color: "#fff",
                fontWeight: 700,
                fontSize: 11,
              }}
            />
          ))}
        </Stack>
        <Divider sx={{ my: 1 }} />
        <Link
          component='button'
          type='button'
          variant='body2'
          underline='hover'
          onClick={handleOpenFacilityDialog}
        >
          查看站內設備
        </Link>
        <Typography
          variant='caption'
          color='text.disabled'
          sx={{ display: "block", mt: 1, color: "text.secondary" }}
        >
          收藏時間：{formatDateTime(bookmark.createdAt)}
        </Typography>
      </CardContent>

      <Dialog
        isOpen={isFacilityDialogOpen}
        onClose={() => setIsFacilityDialogOpen(false)}
        title={`${bookmark.stationNameZhTw} 設備資訊`}
        width='24rem'
      >
        {isFacilityLoading ? (
          <Stack sx={{ alignItems: "center", py: 2 }}>
            <CircularProgress size={20} />
          </Stack>
        ) : facilityStation ? (
          <StationFacilityList
            facilities={facilityStation}
            emptyFallback={
              <Typography color='text.secondary'>暫無設備資訊</Typography>
            }
          />
        ) : (
          <Typography color='text.secondary'>暫無設備資訊</Typography>
        )}
      </Dialog>
    </Card>
  );
}
