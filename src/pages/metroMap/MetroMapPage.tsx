import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { enqueueSnackbar } from "notistack";

import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Divider from "@mui/material/Divider";
import ListItemText from "@mui/material/ListItemText";
import ListSubheader from "@mui/material/ListSubheader";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import SearchIcon from "@mui/icons-material/Search";
import TuneIcon from "@mui/icons-material/Tune";

import { MetroMapContainer } from "@/components/metroMap/MetroMapContainer";

import { useMetroMapStore } from "@/stores/metroMapStore";
import { useStationStore } from "@/stores/stationStore";

import {
  FareType,
  RoutingStrategy,
  StationFacility,
  labelToFacility,
  facilityFilterOptions,
  type FacilityLabel,
} from "@/services/metro/types";

interface StationOption {
  label: string;
  stationCode: string;
  group: string;
}

interface AdvancedFilters {
  equipment: FacilityLabel[];
  fare: FareLabel[];
  time: TimeLabel[];
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

  const stationOptions = useMemo(
    () =>
      allStations.map((station) => ({
        label: `${station.nameZhTw}（${station.stationCode}）`,
        stationCode: station.stationCode,
        group: "所有車站",
      })),
    [allStations]
  );

  const [startStation, setStartStation] = useState<StationOption | null>(null);
  const [endStation, setEndStation] = useState<StationOption | null>(null);
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({
    equipment: [],
    fare: [],
    time: [],
  });
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const hasAppliedSearchParam = useRef(false);

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
        label: `${matchedStation.nameZhTw}（${matchedStation.stationCode}）`,
        stationCode: matchedStation.stationCode,
        group: "所有車站",
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
    advancedFilters.fare.length +
    advancedFilters.time.length;

  const infoText = !hasStartStation
    ? "可點擊地圖路線(文湖、淡水信義、松山新店、中和新蘆、板南)的任意車站代碼，或選擇起始車站進行查詢"
    : isSingleStationMode
      ? `已選起始站「${startStation.label}」，可直接查詢單站資訊，或再選終點車站查詢路徑`
      : `已選起訖站，可查詢路徑（${startStation.label} → ${endStation!.label}）`;

  const toggleFilter = <K extends keyof AdvancedFilters>(
    category: K,
    value: AdvancedFilters[K][number]
  ): void => {
    setAdvancedFilters((prev) => {
      const current = prev[category] as Array<AdvancedFilters[K][number]>;
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];

      if (category === "equipment") {
        const facilities = (updated as FacilityLabel[])
          .map(labelToFacility)
          .filter((f): f is StationFacility => f !== undefined);
        setSelectedFacilities(facilities);
      }

      return { ...prev, [category]: updated };
    });
  };

  const handleSearch = async (): Promise<void> => {
    if (!startStation) return;

    // 單站查詢模式：呼叫單站詳細資訊 API（與點擊地圖站點行為一致）
    if (!endStation) {
      clearRoute();
      await selectAndFetchStation(startStation.stationCode);
      return;
    }

    clearSelection();

    // 路徑查詢模式：找出使用者選取的票種（預設全票）
    const selectedFareLabel = fareTypeFilterOptions.find((label) =>
      advancedFilters.fare.includes(label)
    );
    const fareType: FareType = selectedFareLabel
      ? fareLabelToType[selectedFareLabel]
      : FareType.FULL;

    // 找出使用者選取的路線策略（預設最少轉乘）
    const selectedTimeLabel = travelTimeFilterOptions.find((label) =>
      advancedFilters.time.includes(label)
    );
    const routingStrategy: RoutingStrategy = selectedTimeLabel
      ? timeLabelToStrategy[selectedTimeLabel]
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
          // top: HEADER_HEIGHT,
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
          <Stack direction='row' sx={{ alignItems: "center", gap: 1 }}>
            <Typography
              variant='body2'
              sx={{ color: "primary.contrastText", flexShrink: 0 }}
            >
              起始車站
            </Typography>
            <Autocomplete
              value={startStation}
              onChange={(_event, selectedOption) =>
                setStartStation(selectedOption)
              }
              options={stationOptions}
              groupBy={(option) => option.group}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) =>
                option.stationCode === value.stationCode
              }
              renderOption={(props, option) => (
                <li {...props} key={`${option.group}-${option.label}`}>
                  {option.label}
                </li>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder='選擇或搜尋車站'
                  size='small'
                />
              )}
              sx={{
                width: 180,
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "white",
                  height: SEARCH_CONTROL_HEIGHT,
                },
              }}
            />
          </Stack>
          {/* destination station */}
          <Stack direction='row' sx={{ alignItems: "center", gap: 1 }}>
            <Typography
              variant='body2'
              sx={{ color: "primary.contrastText", flexShrink: 0 }}
            >
              終點車站
            </Typography>
            <Autocomplete
              value={endStation}
              onChange={(_event, selectedOption) => {
                setEndStation(selectedOption);
                if (selectedOption) {
                  setAdvancedFilters((prev) => ({ ...prev, equipment: [] }));
                  setSelectedFacilities([]);
                } else {
                  setAdvancedFilters((prev) => ({
                    ...prev,
                    fare: [],
                    time: [],
                  }));
                }
              }}
              options={stationOptions}
              groupBy={(option) => option.group}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) =>
                option.stationCode === value.stationCode
              }
              renderOption={(props, option) => (
                <li {...props} key={`${option.group}-${option.label}`}>
                  {option.label}
                </li>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder='選擇或搜尋車站'
                  size='small'
                />
              )}
              sx={{
                width: 180,
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "white",
                  height: SEARCH_CONTROL_HEIGHT,
                },
              }}
            />
          </Stack>
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
                ? "查看站點"
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
                    onClick={() => toggleFilter("equipment", option)}
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
                  <MenuItem
                    key={option}
                    onClick={() => toggleFilter("fare", option)}
                  >
                    <Checkbox
                      checked={advancedFilters.fare.includes(option)}
                      size='small'
                    />
                    <ListItemText primary={option} />
                  </MenuItem>
                ))}
                <Divider />
                <ListSubheader sx={{ fontWeight: 700 }}>乘車時間</ListSubheader>
                {travelTimeFilterOptions.map((option) => (
                  <MenuItem
                    key={option}
                    onClick={() => toggleFilter("time", option)}
                  >
                    <Checkbox
                      checked={advancedFilters.time.includes(option)}
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
