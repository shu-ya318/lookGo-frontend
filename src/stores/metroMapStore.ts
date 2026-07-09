import { create } from 'zustand';
import { enqueueSnackbar } from 'notistack';

import { getAllStationOption, getMetroMap, getOriginDestinationDetails } from '@/services/metro';

import type { StationFacility } from '@/services/metro/types';
import type {
  MetroMapLine,
  MetroMapStation,
  StationOption,
  GetOriginDestinationDetailsRequest,
  GetOriginDestinationDetailsResponse,
} from '@/services/metro/interface';

interface MetroMapState {
  lines: MetroMapLine[];
  allStations: MetroMapStation[];
  stationOptions: StationOption[];
  isStationOptionsLoading: boolean;
  isLoading: boolean;
  error: string | null;
  routeResult: GetOriginDestinationDetailsResponse | null;
  isRouteLoading: boolean;
  selectedFacilities: StationFacility[];
  fetchMetroMap: () => Promise<void>;
  fetchStationOptions: () => Promise<void>;
  fetchRoute: (request: GetOriginDestinationDetailsRequest) => Promise<void>;
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
    if (get().lines.length > 0) return;

    set({ isLoading: true, error: null });

    try {
      const response = await getMetroMap();
      const seen = new Set<string>();
      const allStations: MetroMapStation[] = [];

      for (const line of response.lines) {
        for (const station of line.stations) {
          if (!seen.has(station.stationCode)) {
            seen.add(station.stationCode);
            allStations.push(station);
          }
        }
      }
      set({ lines: response.lines, allStations });
    } catch (error) {
      set({ error: error as string });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchStationOptions: async () => {
    if (get().stationOptions.length > 0) return;

    set({ isStationOptionsLoading: true });
    try {
      const response = await getAllStationOption();
      set({ stationOptions: response });
    } catch (error) {
      enqueueSnackbar((error as string) || '取得車站選項失敗', { variant: 'error' });
    } finally {
      set({ isStationOptionsLoading: false });
    }
  },

  fetchRoute: async (request) => {
    set({ isRouteLoading: true });

    try {
      const response = await getOriginDestinationDetails(request);
      set({ routeResult: response });
    } catch (error) {
      enqueueSnackbar((error as string) || '路徑查詢失敗', { variant: 'error' });
    } finally {
      set({ isRouteLoading: false });
    }
  },

  clearRoute: () => set({ routeResult: null }),
  setSelectedFacilities: (facilities) => set({ selectedFacilities: facilities }),
}));
