import { create } from 'zustand';
import { enqueueSnackbar } from 'notistack';

import {
  getAllStationOption,
  getMetroMap,
  getOriginDestinationDetails,
} from '@/services/metro';

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
  stations: MetroMapStation[];
  stationOptions: StationOption[];
  isStationOptionsLoading: boolean;
  isMetroMapLoading: boolean;
  error: string | null;
  routeResult: GetOriginDestinationDetailsResponse | null;
  isRouteLoading: boolean;
  selectedFacilities: StationFacility[];
  fetchMetroMap: () => Promise<void>;
  fetchAllStationOption: () => Promise<void>;
  fetchRoute: (request: GetOriginDestinationDetailsRequest) => Promise<void>;
  clearRoute: () => void;
  setSelectedFacilities: (facilities: StationFacility[]) => void;
}

export const useMetroMapStore = create<MetroMapState>((set, get) => ({
  lines: [],
  stations: [],
  stationOptions: [],
  isStationOptionsLoading: false,
  isMetroMapLoading: false,
  error: null,
  routeResult: null,
  isRouteLoading: false,
  selectedFacilities: [],

  fetchMetroMap: async () => {
    if (get().lines.length > 0) return;

    set({ isMetroMapLoading: true, error: null });

    try {
      const response = await getMetroMap();
      const seenStationCodes = new Set<string>();
      const stations: MetroMapStation[] = [];

      for (const line of response.lines) {
        for (const station of line.stations) {
          if (!seenStationCodes.has(station.stationCode)) {
            seenStationCodes.add(station.stationCode);
            stations.push(station);
          }
        }
      }

      set({ lines: response.lines, stations });
    } catch (error) {
      set({ error: error as string });
    } finally {
      set({ isMetroMapLoading: false });
    }
  },

  fetchAllStationOption: async () => {
    if (get().stationOptions.length > 0) return;

    set({ isStationOptionsLoading: true });

    try {
      const response = await getAllStationOption();
      set({ stationOptions: response });
    } catch (error) {
      enqueueSnackbar((error as string) || '取得車站選項失敗', {
        variant: 'error',
      });
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
      enqueueSnackbar((error as string) || '路徑查詢失敗', {
        variant: 'error',
      });
    } finally {
      set({ isRouteLoading: false });
    }
  },

  clearRoute: () => set({ routeResult: null }),
  setSelectedFacilities: (facilities) =>
    set({ selectedFacilities: facilities }),
}));
