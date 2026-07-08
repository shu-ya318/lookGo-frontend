import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { enqueueSnackbar } from "notistack";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Divider from "@mui/material/Divider";
import ListItemText from "@mui/material/ListItemText";
import ListSubheader from "@mui/material/ListSubheader";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Radio from "@mui/material/Radio";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import SearchIcon from "@mui/icons-material/Search";
import TuneIcon from "@mui/icons-material/Tune";

import { LabeledStationField } from "@/components/LabeledStationField";
import { MetroMapContainer } from "@/components/metroMap/MetroMapContainer";

import { useMetroMapStore } from "@/stores/metroMapStore";
import { useStationStore } from "@/stores/stationStore";

import { formatStationLabel } from "@/utils/station";

import {
  FareType,
  RoutingStrategy,
  StationFacility,
  labelToFacility,
  facilityFilterOptions,
  type FacilityLabel,
} from "@/services/metro/types";

import type { StationOption } from "@/services/metro/interface";

interface AdvancedFilters {
  equipment: FacilityLabel[];
  fare: FareLabel | null;
  time: TimeLabel | null;
}

const fareTypeFilterOptions = ["全票", "學生票", "兒童票", "愛心票"] as const;
type FareLabel = (typeof fareTypeFilterOptions)[number];
const fareLabelToType = {
  全票: FareType.FULL,
  學生票: FareType.STUDENT,
  兒童票: FareType.CHILD,
  愛心票: FareType.LOVE,
};

const travelTimeFilterOptions = ["最少轉乘次數", "最短車程時間"] as const;
type TimeLabel = (typeof travelTimeFilterOptions)[number];
const timeLabelToStrategy = {
  最少轉乘次數: RoutingStrategy.MIN_TRANSFER,
  最短車程時間: RoutingStrategy.MIN_TIME,
};

const HEADER_HEIGHT = "4.375rem";
const SEARCH_BAR_HEIGHT = "5.5rem";
const SEARCH_CONTROL_HEIGHT = "2.5rem";

const MetroMapPage = () => {
  const {
    allStations,
    fetchRoute,
    isRouteLoading,
    setSelectedFacilities,
    clearRoute,
  } = useMetroMapStore();
  const selectAndFetchStation = useStationStore(
    (state) => state.selectAndFetchStation
  );
  const isStationLoading = useStationStore((state) => state.isLoading);
  const clearSelection = useStationStore((state) => state.clearSelection);

  const [searchParams, setSearchParams] = useSearchParams();
  const hasAppliedSearchParam = useRef(false);

  const [startStation, setStartStation] = useState<StationOption | null>(null);
  const [endStation, setEndStation] = useState<StationOption | null>(null);
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({
    equipment: [],
    fare: null,
    time: null,
  });
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const keyword = searchParams.get("search")?.trim();
    if (!keyword || hasAppliedSearchParam.current || allStations.length === 0) {
      return;
    }

    hasAppliedSearchParam.current = true;

    const matchedStation = allStations.find(
      (station) =>
        station.stationCode === keyword || station.nameZhTw.includes(keyword)
    );

    if (matchedStation) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStartStation({
        stationCode: matchedStation.stationCode,
        nameZhTw: matchedStation.nameZhTw,
      });
      selectAndFetchStation(matchedStation.stationCode);
    } else {
      enqueueSnackbar(`找不到符合「${keyword}」的車站，請重新查詢`, {
        variant: "warning",
      });
    }

    setSearchParams({}, { replace: true });
  }, [allStations, searchParams, setSearchParams, selectAndFetchStation]);

  const hasStartStation = startStation !== null;
  const hasEndStation = endStation !== null;
  const isSingleStationMode = hasStartStation && !hasEndStation;
  const isRouteMode = hasStartStation && hasEndStation;
  const canSearch = hasStartStation && !isRouteLoading && !isStationLoading;
  const isMenuOpen = Boolean(menuAnchorEl);
  const totalFilterCount =
    advancedFilters.equipment.length +
    (advancedFilters.fare ? 1 : 0) +
    (advancedFilters.time ? 1 : 0);

  const infoText = !hasStartStation
    ? "可點擊地圖路線(文湖、淡水信義、松山新店、中和新蘆、板南)的任意車站代碼，或選擇起始車站進行查詢"
    : isSingleStationMode
      ? `已選起始站「${formatStationLabel(startStation)}」，可直接查詢單站資訊，或再選終點車站查詢路徑`
      : `已選起訖站，可查詢路徑（${formatStationLabel(startStation)} → ${formatStationLabel(endStation!)}）`;

  const toggleEquipmentFilter = (value: FacilityLabel): void => {
    setAdvancedFilters((prev) => {
      const updated = prev.equipment.includes(value)
        ? prev.equipment.filter((v) => v !== value)
        : [...prev.equipment, value];

      const facilities = updated
        .map(labelToFacility)
        .filter((f): f is StationFacility => f !== undefined);
      setSelectedFacilities(facilities);

      return { ...prev, equipment: updated };
    });
  };

  const selectFareFilter = (value: FareLabel): void => {
    setAdvancedFilters((prev) => ({
      ...prev,
      fare: prev.fare === value ? null : value,
    }));
  };

  const selectTimeFilter = (value: TimeLabel): void => {
    setAdvancedFilters((prev) => ({
      ...prev,
      time: prev.time === value ? null : value,
    }));
  };

  const handleSearch = async (): Promise<void> => {
    if (!startStation) return;

    // 單站查詢模式：呼叫單站詳細資訊 API（與點擊地圖車站行為一致）
    if (!endStation) {
      clearRoute();
      await selectAndFetchStation(startStation.stationCode);

      return;
    }

    clearSelection();

    // 使用者選取的票種（預設全票）
    const fareType: FareType = advancedFilters.fare
      ? fareLabelToType[advancedFilters.fare]
      : FareType.FULL;

    // 使用者選取的路線策略（預設最少轉乘）
    const routingStrategy: RoutingStrategy = advancedFilters.time
      ? timeLabelToStrategy[advancedFilters.time]
      : RoutingStrategy.MIN_TRANSFER;

    await fetchRoute({
      fromStationCode: startStation.stationCode,
      toStationCode: endStation.stationCode,
      fareType,
      routingStrategy,
    });
  };

  return (
    <Box
      sx={{
        position: "relative",
        height: `calc(100vh - ${HEADER_HEIGHT})`,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "tertiary.light",
      }}
    >
      {/* search bar */}
      <Stack
        sx={{
          position: "sticky",
          flexShrink: 0,
          backgroundColor: "primary.main",
          px: 3,
          py: 1.5,
          gap: 1,
          height: SEARCH_BAR_HEIGHT,
          zIndex: 10,
        }}
      >
        <Stack direction='row' sx={{ alignItems: "center", gap: 1 }}>
          <InfoOutlinedIcon
            sx={{ color: "primary.contrastText", fontSize: 20 }}
          />
          <Typography
            variant='caption'
            sx={{
              color: isSingleStationMode
                ? "rgba(255,255,160,0.95)"
                : isRouteMode
                  ? "rgba(180,255,180,0.95)"
                  : "primary.contrastText",
              transition: "color 0.3s ease",
            }}
          >
            {infoText}
          </Typography>
        </Stack>
        <Stack
          direction='row'
          sx={{ alignItems: "center", gap: 2, flexWrap: "wrap" }}
        >
          {/* start station */}
          <LabeledStationField
            label='起始車站'
            value={startStation}
            onChange={setStartStation}
            width={180}
            controlHeight={SEARCH_CONTROL_HEIGHT}
          />
          {/* destination station */}
          <LabeledStationField
            label='終點車站'
            value={endStation}
            onChange={(selectedOption) => {
              setEndStation(selectedOption);
              if (selectedOption) {
                setAdvancedFilters((prev) => ({ ...prev, equipment: [] }));
                setSelectedFacilities([]);
              } else {
                setAdvancedFilters((prev) => ({
                  ...prev,
                  fare: null,
                  time: null,
                }));
              }
            }}
            width={180}
            controlHeight={SEARCH_CONTROL_HEIGHT}
          />
          {/* advanced filter */}
          <Button
            startIcon={<TuneIcon />}
            onClick={(event) => setMenuAnchorEl(event.currentTarget)}
            variant='outlined'
            size='small'
            disabled={!hasStartStation}
            sx={{
              height: SEARCH_CONTROL_HEIGHT,
              minWidth: 140,
              color: "primary.contrastText",
              borderColor: "rgba(255,255,255,0.5)",
              "&:hover": {
                borderColor: "white",
                backgroundColor: "rgba(255,255,255,0.1)",
              },
            }}
          >
            進階查詢{totalFilterCount > 0 && ` (${totalFilterCount})`}
          </Button>
          <Button
            startIcon={<SearchIcon />}
            variant='contained'
            size='small'
            disabled={!canSearch}
            onClick={handleSearch}
            sx={{
              height: SEARCH_CONTROL_HEIGHT,
              minWidth: 140,
              backgroundColor: "primary.contrastText",
              color: "primary.main",
              "&:hover": { backgroundColor: "rgba(255,255,255,0.85)" },
            }}
          >
            {isRouteLoading || isStationLoading
              ? "查詢中…"
              : isSingleStationMode
                ? "查詢車站"
                : "開始查詢"}
          </Button>
          {/* advance filter menu */}
          <Menu
            anchorEl={menuAnchorEl}
            open={isMenuOpen}
            onClose={() => setMenuAnchorEl(null)}
          >
            {isSingleStationMode && (
              <>
                <ListSubheader sx={{ fontWeight: 700 }}>設備</ListSubheader>
                {facilityFilterOptions.map((option) => (
                  <MenuItem
                    key={option}
                    onClick={() => toggleEquipmentFilter(option)}
                  >
                    <Checkbox
                      checked={advancedFilters.equipment.includes(option)}
                      size='small'
                    />
                    <ListItemText primary={option} />
                  </MenuItem>
                ))}
              </>
            )}

            {isRouteMode && (
              <>
                <ListSubheader sx={{ fontWeight: 700 }}>票價種類</ListSubheader>
                {fareTypeFilterOptions.map((option) => (
                  <MenuItem key={option} onClick={() => selectFareFilter(option)}>
                    <Radio
                      checked={advancedFilters.fare === option}
                      size='small'
                    />
                    <ListItemText primary={option} />
                  </MenuItem>
                ))}
                <Divider />
                <ListSubheader sx={{ fontWeight: 700 }}>乘車時間</ListSubheader>
                {travelTimeFilterOptions.map((option) => (
                  <MenuItem key={option} onClick={() => selectTimeFilter(option)}>
                    <Radio
                      checked={advancedFilters.time === option}
                      size='small'
                    />
                    <ListItemText primary={option} />
                  </MenuItem>
                ))}
              </>
            )}
          </Menu>
        </Stack>
      </Stack>
      {/* Metro Map */}
      <Box sx={{ flex: 1, position: "relative", overflow: "hidden" }}>
        <MetroMapContainer />
      </Box>
    </Box>
  );
};

export default MetroMapPage;
