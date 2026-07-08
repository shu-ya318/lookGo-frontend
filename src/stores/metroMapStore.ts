import { create } from 'zustand';
import { enqueueSnackbar } from 'notistack';

import { getAllStationOption, getMetroMap, getOriginDestinationDetail } from '@/services/metro';

import type { StationFacility } from '@/services/metro/types';
import type {
  MetroMapLine,
  MetroMapStation,
  StationOption,
  GetOriginDestinationDetailRequest,
  GetOriginDestinationDetailResponse,
} from '@/services/metro/interface';

interface MetroMapState {
  lines: MetroMapLine[];
  allStations: MetroMapStation[];
  stationOptions: StationOption[];
  isStationOptionsLoading: boolean;
  isLoading: boolean;
  error: string | null;
  routeResult: GetOriginDestinationDetailResponse | null;
  isRouteLoading: boolean;
  selectedFacilities: StationFacility[];
  fetchMetroMap: () => Promise<void>;
  fetchStationOptions: () => Promise<void>;
  fetchRoute: (request: GetOriginDestinationDetailRequest) => Promise<void>;
  clearRoute: () => void;
  setSelectedFacilities: (facilities: StationFacility[]) => void;
}

export const useMetroMapStore = create<MetroMapState>((set, get) => ({
  lines: [],
  allStations: [],
  stationOptions: [],
  isStationOptionsLoading: false,
  isLoading: false,
  error: null,
  routeResult: null,
  isRouteLoading: false,
  selectedFacilities: [],

  fetchMetroMap: async () => {
    // 各頁面共用同一份路網資料快取，已載入過就不重複 fetch
    if (get().lines.length > 0) return;

    set({ isLoading: true, error: null });

    try {
      const { lines } = await getMetroMap();
      const seen = new Set<string>();
      const allStations: MetroMapStation[] = [];

      for (const line of lines) {
        for (const station of line.stations) {
          if (!seen.has(station.stationCode)) {
            seen.add(station.stationCode);
            allStations.push(station);
          }
        }
      }
      set({ lines, allStations });
    } catch (err) {
      set({ error: err as string });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchStationOptions: async () => {
    // 各頁面共用同一份車站選項快取，已載入過就不重複 fetch
    if (get().stationOptions.length > 0) return;

    set({ isStationOptionsLoading: true });
    try {
      const options = await getAllStationOption();
      set({ stationOptions: options });
    } catch (err) {
      enqueueSnackbar((err as string) || '取得車站選項失敗', { variant: 'error' });
    } finally {
      set({ isStationOptionsLoading: false });
    }
  },

  fetchRoute: async (request) => {
    set({ isRouteLoading: true });
    try {
      const result = await getOriginDestinationDetail(request);
      set({ routeResult: result });
    } catch (err) {
      enqueueSnackbar((err as string) || '路徑查詢失敗', { variant: 'error' });
    } finally {
      set({ isRouteLoading: false });
    }
  },

  clearRoute: () => set({ routeResult: null }),
  setSelectedFacilities: (facilities) => set({ selectedFacilities: facilities }),
}));
