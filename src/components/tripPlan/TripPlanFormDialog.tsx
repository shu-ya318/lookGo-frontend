import { useEffect, useState } from "react";
import { enqueueSnackbar } from "notistack";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";

import { Dialog } from "@/components/Dialog";
import { StationAutocomplete } from "@/components/StationAutocomplete";

import { useMetroMapStore } from "@/stores/metroMapStore";

import { getOriginDestinationDetail, getStationByCode } from "@/services/metro";
import {
  FARE_TYPE_LABELS,
  FareType,
  ROUTING_STRATEGY_LABELS,
  RoutingStrategy,
} from "@/services/metro/types";
import {
  createTripPlan,
  updateTripPlan,
  updateTripPlanName,
} from "@/services/tripPlan";

import type { StationOption } from "@/services/metro/interface";
import type { TripPlan } from "@/services/tripPlan/interface";

const fareTypeFilterOptions = ["全票", "學生票", "兒童票", "愛心票"] as const;
type FareLabel = (typeof fareTypeFilterOptions)[number];
const fareLabelToType: Record<FareLabel, number> = {
  全票: FareType.FULL,
  學生票: FareType.STUDENT,
  兒童票: FareType.CHILD,
  愛心票: FareType.LOVE,
};

const travelTimeFilterOptions = ["最少轉乘次數", "最短車程時間"] as const;
type TimeLabel = (typeof travelTimeFilterOptions)[number];
const timeLabelToStrategy: Record<TimeLabel, number> = {
  最少轉乘次數: RoutingStrategy.MIN_TRANSFER,
  最短車程時間: RoutingStrategy.MIN_TIME,
};

interface AdvancedFilters {
  fare: FareLabel | null;
  time: TimeLabel | null;
}

const defaultAdvancedFilters: AdvancedFilters = {
  fare: null,
  time: null,
};

interface TripResult {
  fromStationId: number;
  toStationId: number;
  fromStationNameZhTw: string;
  toStationNameZhTw: string;
  fareType: number;
  routingStrategy: number;
  farePrice: number;
  transferCount: number;
  totalTravelTimeSeconds: number;
}

// StationOption 僅提供 stationCode，新增/更新旅程需要的 stationId 需另行查詢
const resolveStationId = async (
  station: StationOption
): Promise<number | null> => {
  try {
    const details = await getStationByCode({
      stationCode: station.stationCode,
    });
    return details.id;
  } catch (error) {
    enqueueSnackbar((error as string) || "取得車站資訊失敗", {
      variant: "error",
    });
    return null;
  }
};

interface RequiredFieldLabelProps {
  label: string;
  disabled?: boolean;
}

function RequiredFieldLabel({
  label,
  disabled = false,
}: RequiredFieldLabelProps): React.ReactElement {
  return (
    <Typography
      variant='body2'
      color={disabled ? "text.disabled" : "text.secondary"}
    >
      {label}
      <Box component='span' sx={{ color: "error.main", ml: 0.25 }}>
        *
      </Box>
    </Typography>
  );
}

interface TripPlanFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tripPlan: TripPlan | null;
  onSaved: (tripPlan: TripPlan, isNew: boolean) => void;
}

export function TripPlanFormDialog({
  isOpen,
  onClose,
  tripPlan,
  onSaved,
}: TripPlanFormDialogProps): React.ReactElement {
  const isEditMode = tripPlan !== null;

  const stationOptions = useMetroMapStore((state) => state.stationOptions);
  const fetchStationOptions = useMetroMapStore(
    (state) => state.fetchStationOptions
  );

  useEffect(() => {
    fetchStationOptions();
  }, [fetchStationOptions]);

  const [tripTitle, setTripTitle] = useState(tripPlan?.name ?? "");
  const [startStation, setStartStation] = useState<StationOption | null>(
    null
  );
  const [endStation, setEndStation] = useState<StationOption | null>(null);
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>(
    tripPlan
      ? {
        fare: (FARE_TYPE_LABELS[tripPlan.fareType] as FareLabel) ?? null,
        time:
          (ROUTING_STRATEGY_LABELS[
            tripPlan.routingStrategy
          ] as TimeLabel) ?? null,
      }
      : defaultAdvancedFilters
  );
  const [tripResult, setTripResult] = useState<TripResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [note, setNote] = useState(tripPlan?.notes ?? "");
  const [isSaving, setIsSaving] = useState(false);

  const hasEndStation = endStation !== null;

  // 編輯模式下，依旅程紀錄的車站中文名稱比對出對應的車站選項
  useEffect(() => {
    if (!tripPlan || stationOptions.length === 0) return;

    const start =
      stationOptions.find(
        (station) => station.nameZhTw === tripPlan.fromStationNameZhTw
      ) ?? null;
    const end =
      stationOptions.find(
        (station) => station.nameZhTw === tripPlan.toStationNameZhTw
      ) ?? null;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStartStation(start);
    setEndStation(end);
  }, [tripPlan, stationOptions]);

  // 起訖車站、票價種類與車程時間皆選定後自動查詢路線
  useEffect(() => {
    if (
      !startStation ||
      !endStation ||
      !advancedFilters.fare ||
      !advancedFilters.time
    ) {
      return;
    }

    const fareType = fareLabelToType[advancedFilters.fare];
    const routingStrategy = timeLabelToStrategy[advancedFilters.time];

    let isMounted = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsSearching(true);
    Promise.all([
      getOriginDestinationDetail({
        fromStationCode: startStation.stationCode,
        toStationCode: endStation.stationCode,
        fareType,
        routingStrategy,
      }),
      resolveStationId(startStation),
      resolveStationId(endStation),
    ])
      .then(([detail, startStationId, endStationId]) => {
        if (!isMounted || startStationId === null || endStationId === null) {
          return;
        }
        setTripResult({
          fromStationId: startStationId,
          toStationId: endStationId,
          fromStationNameZhTw: startStation.nameZhTw,
          toStationNameZhTw: endStation.nameZhTw,
          fareType: detail.fareType,
          routingStrategy: detail.routingStrategy,
          farePrice: detail.farePrice,
          transferCount: detail.transferCount,
          totalTravelTimeSeconds: detail.totalTravelTimeSeconds,
        });
      })
      .catch((error) => {
        if (isMounted) {
          enqueueSnackbar((error as string) || "路線查詢失敗", {
            variant: "error",
          });
        }
      })
      .finally(() => {
        if (isMounted) setIsSearching(false);
      });

    return () => {
      isMounted = false;
    };
  }, [startStation, endStation, advancedFilters.fare, advancedFilters.time]);

  const handleFareChange = (
    _event: React.MouseEvent<HTMLElement>,
    value: FareLabel | null
  ): void => {
    setAdvancedFilters((prev) => ({ ...prev, fare: value }));
  };

  const handleTimeChange = (
    _event: React.MouseEvent<HTMLElement>,
    value: TimeLabel | null
  ): void => {
    setAdvancedFilters((prev) => ({ ...prev, time: value }));
  };

  const handleSave = async (): Promise<void> => {
    if (!tripResult) return;

    setIsSaving(true);
    try {
      if (tripPlan) {
        let updated = tripPlan;
        if (tripTitle.trim() && tripTitle !== tripPlan.name) {
          updated = await updateTripPlanName({
            tripPlanId: tripPlan.id,
            name: tripTitle,
          });
        }
        updated = await updateTripPlan({
          tripPlanId: tripPlan.id,
          fareType: tripResult.fareType,
          farePrice: tripResult.farePrice,
          transferCount: tripResult.transferCount,
          routingStrategy: tripResult.routingStrategy,
          notes: note || undefined,
        });
        enqueueSnackbar("旅程更新成功！", { variant: "success" });
        onSaved(updated, false);
      } else {
        const created = await createTripPlan({
          name: tripTitle,
          fromStationId: tripResult.fromStationId,
          toStationId: tripResult.toStationId,
          fareType: tripResult.fareType,
          farePrice: tripResult.farePrice,
          transferCount: tripResult.transferCount,
          routingStrategy: tripResult.routingStrategy,
          notes: note || undefined,
        });
        enqueueSnackbar("旅程新增成功！", { variant: "success" });
        onSaved(created, true);
      }
    } catch (error) {
      enqueueSnackbar((error as string) || "旅程儲存失敗", {
        variant: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? "編輯旅程" : "新增旅程"}
      width='32rem'
      action={
        <Button
          variant='contained'
          loading={isSaving}
          disabled={!tripResult || !tripTitle.trim() || !note.trim()}
          onClick={handleSave}
        >
          {isEditMode ? "更新旅程" : "儲存旅程"}
        </Button>
      }
    >
      <Stack sx={{ gap: 2 }}>
        <TextField
          label='旅程名稱'
          value={tripTitle}
          onChange={(event) => setTripTitle(event.target.value)}
          size='small'
          fullWidth
          required
          placeholder='請輸入旅程名稱'
        />

        {/* 1. 起始車站 / 2. 終點車站 */}
        <Stack direction='row' sx={{ gap: 2, flexWrap: "wrap" }}>
          <Stack sx={{ gap: 0.5 }}>
            <RequiredFieldLabel label='起始車站' disabled={isEditMode} />
            <StationAutocomplete
              value={startStation}
              onChange={setStartStation}
              disabled={isEditMode}
              sx={{ width: 200 }}
            />
          </Stack>
          <Stack sx={{ gap: 0.5 }}>
            <RequiredFieldLabel label='終點車站' disabled={isEditMode} />
            <StationAutocomplete
              value={endStation}
              onChange={setEndStation}
              disabled={isEditMode}
              sx={{ width: 200 }}
            />
          </Stack>
        </Stack>

        {/* 3. 票價種類：同一橫排單選 */}
        <Stack sx={{ gap: 0.5 }}>
          <RequiredFieldLabel label='票價種類' disabled={!hasEndStation} />
          <ToggleButtonGroup
            value={advancedFilters.fare}
            onChange={handleFareChange}
            exclusive
            size='small'
            disabled={!hasEndStation}
            sx={{ flexWrap: "wrap" }}
          >
            {fareTypeFilterOptions.map((option) => (
              <ToggleButton key={option} value={option}>
                {option}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Stack>

        {/* 4. 車程時間：同一橫排單選兩種 value */}
        <Stack sx={{ gap: 0.5 }}>
          <RequiredFieldLabel label='車程時間' disabled={!hasEndStation} />
          <ToggleButtonGroup
            value={advancedFilters.time}
            onChange={handleTimeChange}
            exclusive
            size='small'
            disabled={!hasEndStation}
            sx={{ flexWrap: "wrap" }}
          >
            {travelTimeFilterOptions.map((option) => (
              <ToggleButton key={option} value={option}>
                {option}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Stack>

        {isSearching && (
          <Stack sx={{ alignItems: "center", py: 1 }}>
            <CircularProgress size='1.5rem' />
          </Stack>
        )}

        {tripResult && (
          <Stack sx={{ gap: 2 }}>


            <Stack direction='row' sx={{ justifyContent: "space-between" }}>
              <Typography variant='body2' color='text.secondary'>
                {FARE_TYPE_LABELS[tripResult.fareType] ?? "全票"}
              </Typography>
              <Typography variant='body2' sx={{ fontWeight: 700 }}>
                NT${tripResult.farePrice}
              </Typography>
            </Stack>
            <Stack direction='row' sx={{ justifyContent: "space-between" }}>
              <Typography variant='body2' color='text.secondary'>
                車程（
                {ROUTING_STRATEGY_LABELS[tripResult.routingStrategy] ??
                  "最少轉乘次數"}
                ）
              </Typography>
              <Typography variant='body2' sx={{ fontWeight: 700 }}>
                {Math.ceil(tripResult.totalTravelTimeSeconds / 60)} 分鐘
              </Typography>
            </Stack>
          </Stack>
        )}

        {/* 5. 筆記：開啟表單即顯示，允許多行 */}
        <TextField
          label='筆記'
          value={note}
          onChange={(event) => setNote(event.target.value)}
          multiline
          rows={3}
          fullWidth
          required
          placeholder='輸入您的旅程筆記...'
        />
      </Stack>
    </Dialog>
  );
}
