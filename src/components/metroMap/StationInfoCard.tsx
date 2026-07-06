import { useEffect } from "react";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import CloseIcon from "@mui/icons-material/Close";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";

import { useStationStore } from "@/stores/stationStore";
import { useStationBookmarkStore } from "@/stores/stationBookmarkStore";
import { FareType, RoutingStrategy } from "@/services/metro/types";
import type {
  MetroMapLine,
  MetroMapStation,
  StationDetails,
  GetOriginDestinationDetailResponse,
} from "@/services/metro/interface";

interface Props {
  station?: MetroMapStation;
  line?: MetroMapLine;
  allLines?: MetroMapLine[];
  routeResult?: GetOriginDestinationDetailResponse;
  onClose: () => void;
}

function normalize(raw: string): string {
  return raw.startsWith("#") ? raw : `#${raw}`;
}

// 無條件進入法，和北捷官方計算方式一致
function formatTime(seconds: number): string {
  const mins = Math.ceil(seconds / 60);
  return `${mins} 分鐘`;
}

// 最大餘數法：各區段各自無條件進位會和車程時間 label（總秒數無條件進位）加總不一致，
// 改用此法依各區段實際秒數比例分配分鐘數，確保加總結果等於車程時間 label 的值
function allocateMinutes(secondsList: number[], totalSeconds: number): number[] {
  const targetMinutes = Math.ceil(totalSeconds / 60);
  const rawMinutes = secondsList.map((seconds) => seconds / 60);
  const flooredMinutes = rawMinutes.map((minutes) => Math.floor(minutes));
  let remainder =
    targetMinutes - flooredMinutes.reduce((sum, minutes) => sum + minutes, 0);

  const indexesByFractionDesc = rawMinutes
    .map((minutes, index) => ({ index, fraction: minutes - Math.floor(minutes) }))
    .sort((a, b) => b.fraction - a.fraction);

  const result = [...flooredMinutes];
  for (
    let i = 0;
    i < indexesByFractionDesc.length && remainder > 0;
    i++, remainder--
  ) {
    result[indexesByFractionDesc[i].index] += 1;
  }

  return result;
}

type FacilityKey = Extract<
  keyof StationDetails,
  | "atm"
  | "nursingRoom"
  | "diaperTable"
  | "chargingStation"
  | "ticketMachine"
  | "locker"
  | "drinkingWater"
  | "restroom"
  | "elevator"
  | "escalator"
>;

const FARE_TYPE_LABELS: Record<number, string> = {
  [FareType.FULL]: "全票",
  [FareType.STUDENT]: "學生票",
  [FareType.CHILD]: "兒童票",
  [FareType.LOVE]: "愛心票",
};

const ROUTING_STRATEGY_LABELS: Record<number, string> = {
  [RoutingStrategy.MIN_TRANSFER]: "最少轉乘次數",
  [RoutingStrategy.MIN_TIME]: "最短車程時間",
};

const FACILITY_LABELS: { key: FacilityKey; label: string }[] = [
  { key: "elevator", label: "電梯" },
  { key: "escalator", label: "電扶梯" },
  { key: "atm", label: "ATM" },
  { key: "restroom", label: "廁所" },
  { key: "drinkingWater", label: "飲水機" },
  { key: "chargingStation", label: "充電站" },
  { key: "ticketMachine", label: "售票機" },
  { key: "nursingRoom", label: "哺乳室" },
  { key: "diaperTable", label: "尿布台" },
];

export function StationInfoCard({
  station,
  line,
  allLines = [],
  routeResult,
  onClose,
}: Props): React.ReactElement {
  const stationDetails = useStationStore((state) => state.stationDetails);
  const isLoading = useStationStore((state) => state.isLoading);
  const bookmarks = useStationBookmarkStore((state) => state.bookmarks);
  const fetchBookmarks = useStationBookmarkStore(
    (state) => state.fetchBookmarks
  );
  const toggleBookmark = useStationBookmarkStore(
    (state) => state.toggleBookmark
  );

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  const isBookmarked = station
    ? bookmarks.some((bookmark) => bookmark.stationId === station.stationId)
    : false;

  const transferLines =
    station && line
      ? allLines.filter(
        (l) =>
          l.letter !== line.letter &&
          l.stations.some((s) => s.nameZhTw === station.nameZhTw)
      )
      : [];
  const isTransfer = transferLines.length > 0;

  // 只保留有值（非 null、非 undefined、非空字串）的設備
  const availableFacilities = stationDetails
    ? FACILITY_LABELS.filter(({ key }) => {
      const value = stationDetails[key];
      return value != null && value !== ""; // != null 同時排除 null 與 undefined
    })
    : [];

  const fromName =
    routeResult?.route[0]?.stations[0]?.nameZhTw ??
    routeResult?.fromStationCode ??
    "";
  const lastSeg = routeResult?.route[routeResult.route.length - 1];
  const toName =
    lastSeg?.stations[lastSeg.stations.length - 1]?.nameZhTw ??
    routeResult?.toStationCode ??
    "";

  // 依序交錯排列「區段秒數、轉乘秒數、區段秒數、…」，轉乘總秒數平均分配到各轉乘點
  const segmentsSeconds = routeResult?.route.map((s) => s.segmentTimeSeconds) ?? [];
  const transferGapCount = Math.max(segmentsSeconds.length - 1, 0);
  const transferSecondsPerGap =
    transferGapCount > 0 && routeResult
      ? routeResult.transferTimeSeconds / transferGapCount
      : 0;

  const chunkSeconds: number[] = [];
  segmentsSeconds.forEach((seconds, i) => {
    chunkSeconds.push(seconds);
    if (i < transferGapCount) chunkSeconds.push(transferSecondsPerGap);
  });

  const chunkMinutes = routeResult
    ? allocateMinutes(chunkSeconds, routeResult.totalTravelTimeSeconds)
    : [];

  return (
    <Card
      elevation={4}
      sx={{
        position: "absolute",
        bottom: 24,
        left: 24,
        width: routeResult ? 280 : 240,
        zIndex: 10,
        borderRadius: 2,
        maxHeight: "calc(100% - 48px)",
        overflowY: "auto",
      }}
    >
      {/* ── 車站資訊模式 ── */}
      {station && line && (
        <CardContent sx={{ "&:last-child": { pb: 2 } }}>
          <Stack
            direction='row'
            sx={{ justifyContent: "space-between", alignItems: "flex-start" }}
          >
            <Box>
              <Stack direction='row' sx={{ alignItems: "center", gap: 0.25 }}>
                <Typography
                  variant='body1'
                  sx={{ fontWeight: 700, lineHeight: 1.3 }}
                >
                  {station.nameZhTw}
                </Typography>
                <IconButton
                  size='small'
                  onClick={() => toggleBookmark(station.stationId)}
                  sx={{ p: 0.25 }}
                >
                  {isBookmarked ? (
                    <BookmarkIcon fontSize='small' color='primary' />
                  ) : (
                    <BookmarkBorderIcon fontSize='small' />
                  )}
                </IconButton>
              </Stack>
              <Typography variant='caption' color='text.secondary'>
                {station.nameEn}
              </Typography>
            </Box>
            <IconButton
              size='small'
              onClick={onClose}
              sx={{ mt: -0.5, mr: -0.5 }}
            >
              <CloseIcon fontSize='small' />
            </IconButton>
          </Stack>

          <Divider sx={{ my: 1 }} />

          <Stack direction='row' sx={{ flexWrap: "wrap", gap: 0.75 }}>
            <Chip
              label={`${station.stationCode} ${line.nameZhTw}`}
              size='small'
              sx={{
                backgroundColor: normalize(line.color),
                color: "#fff",
                fontWeight: 700,
                fontSize: 11,
              }}
            />
            {transferLines.map((tl) => {
              const ts = tl.stations.find(
                (station) => station.nameZhTw === station.nameZhTw
              );
              return (
                <Chip
                  key={tl.letter}
                  label={`${ts?.stationCode ?? tl.letter} ${tl.nameZhTw}`}
                  size='small'
                  sx={{
                    backgroundColor: normalize(tl.color),
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 11,
                  }}
                />
              );
            })}
          </Stack>

          {isTransfer && (
            <Stack
              direction='row'
              spacing={0.5}
              sx={{ mt: 1, alignItems: "center" }}
            >
              <SwapHorizIcon sx={{ fontSize: 16, color: "warning.main" }} />
              <Typography
                variant='caption'
                color='warning.main'
                sx={{ fontWeight: 600 }}
              >
                可轉乘 {transferLines.length} 條路線
              </Typography>
            </Stack>
          )}

          <Divider sx={{ my: 1 }} />
          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 1 }}>
              <CircularProgress size={20} />
            </Box>
          ) : availableFacilities.length > 0 ? (
            <>
              <Typography
                variant='caption'
                color='text.secondary'
                sx={{ display: "block", mb: 0.75 }}
              >
                站內設施
              </Typography>
              <Stack spacing={0.5}>
                {availableFacilities.map(({ key, label }) => {
                  const note = stationDetails![key] as string;
                  return (
                    <Stack
                      key={key}
                      direction='row'
                      sx={{
                        justifyContent: "space-between",
                        alignItems: "baseline",
                      }}
                    >
                      <Typography
                        variant='caption'
                        color='text.secondary'
                        sx={{ fontSize: 11, flexShrink: 0 }}
                      >
                        {label}
                      </Typography>
                      {note && note.trim() !== "" && (
                        <Typography
                          variant='caption'
                          sx={{
                            fontSize: 11,
                            fontWeight: 500,
                            textAlign: "right",
                            ml: 1,
                          }}
                        >
                          {note}
                        </Typography>
                      )}
                    </Stack>
                  );
                })}
              </Stack>
            </>
          ) : null}
        </CardContent>
      )}

      {/* ── 路徑查詢結果模式 ── */}
      {routeResult && (
        <CardContent sx={{ "&:last-child": { pb: 2 } }}>
          <Stack
            direction='row'
            sx={{ justifyContent: "space-between", alignItems: "center" }}
          >
            <Typography variant='body2' sx={{ fontWeight: 700 }}>
              路徑查詢結果
            </Typography>
            <IconButton
              size='small'
              onClick={onClose}
              sx={{ mt: -0.5, mr: -0.5 }}
            >
              <CloseIcon fontSize='small' />
            </IconButton>
          </Stack>

          <Typography variant='caption' color='text.secondary'>
            {fromName} → {toName}
          </Typography>

          <Divider sx={{ my: 1 }} />

          <Stack spacing={0.75}>
            {routeResult.route.map((segment, index) => (
              <Box key={`${segment.lineCode}-${index}`}>
                <Stack
                  direction='row'
                  sx={{ alignItems: "flex-start", gap: 0.75 }}
                >
                  <Chip
                    label={segment.lineCode}
                    size='small'
                    sx={{
                      backgroundColor: normalize(segment.lineColor),
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: 11,
                      height: 20,
                      minWidth: 32,
                      flexShrink: 0,
                    }}
                  />
                  <Box>
                    <Typography
                      variant='caption'
                      sx={{
                        fontWeight: 600,
                        display: "block",
                        lineHeight: 1.3,
                      }}
                    >
                      {segment.lineNameZhTw}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      共 {segment.stations.length} 站・
                      {chunkMinutes[index * 2]} 分鐘
                    </Typography>
                  </Box>
                </Stack>
                {index < routeResult.route.length - 1 && (
                  <Stack
                    direction='row'
                    sx={{ alignItems: "center", ml: 0.5, mt: 0.5, mb: 0.25 }}
                  >
                    <SwapHorizIcon
                      sx={{
                        fontSize: 13,
                        color: "warning.main",
                        transform: "rotate(90deg)",
                      }}
                    />
                    <Typography
                      variant='caption'
                      color='warning.main'
                      sx={{ fontSize: 10, ml: 0.25 }}
                    >
                      轉乘 {chunkMinutes[index * 2 + 1]} 分鐘
                    </Typography>
                  </Stack>
                )}
              </Box>
            ))}
          </Stack>

          <Divider sx={{ my: 1 }} />

          <Stack spacing={0.5}>
            {[
              {
                label: "票價種類",
                value: FARE_TYPE_LABELS[routeResult.fareType] ?? "全票",
              },
              {
                label: "乘車時間計算依據",
                value:
                  ROUTING_STRATEGY_LABELS[routeResult.routingStrategy] ??
                  "最少轉乘次數",
              },
              { label: "轉乘次數", value: `${routeResult.transferCount} 次` },
              {
                label: "車程時間",
                value: formatTime(routeResult.totalTravelTimeSeconds),
              },
            ].map(({ label, value }) => (
              <Stack
                key={label}
                direction='row'
                sx={{ justifyContent: "space-between", alignItems: "baseline" }}
              >
                <Typography
                  variant='caption'
                  color='text.secondary'
                  sx={{ fontSize: 11, flexShrink: 0 }}
                >
                  {label}
                </Typography>
                <Typography
                  variant='caption'
                  sx={{
                    fontSize: 11,
                    fontWeight: 500,
                    textAlign: "right",
                    ml: 1,
                  }}
                >
                  {value}
                </Typography>
              </Stack>
            ))}
            <Stack
              direction='row'
              sx={{ justifyContent: "space-between", alignItems: "baseline" }}
            >
              <Typography
                variant='caption'
                color='text.secondary'
                sx={{ fontSize: 11, flexShrink: 0 }}
              >
                票價
              </Typography>
              <Typography
                variant='caption'
                sx={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "primary.main",
                  textAlign: "right",
                  ml: 1,
                }}
              >
                NT${routeResult.farePrice}
              </Typography>
            </Stack>
          </Stack>
        </CardContent>
      )}
    </Card>
  );
}
