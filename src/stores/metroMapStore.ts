import { create } from 'zustand';
import { enqueueSnackbar } from 'notistack';

import { getMetroMap, getOriginDestinationDetail } from '@/services/metro';
import { StationFacility } from '@/services/metro/enum';
import type {
  MetroMapLine,
  MetroMapStation,
  GetOriginDestinationDetailRequest,
  GetOriginDestinationDetailResponse,
} from '@/services/metro/interface';

interface MetroMapState {
  lines: MetroMapLine[];
  allStations: MetroMapStation[];
  isLoading: boolean;
  error: string | null;
  routeResult: GetOriginDestinationDetailResponse | null;
  isRouteLoading: boolean;
  selectedFacilities: StationFacility[];
  fetchMetroMap: () => Promise<void>;
  fetchRoute: (request: GetOriginDestinationDetailRequest) => Promise<void>;
  clearRoute: () => void;
  setSelectedFacilities: (facilities: StationFacility[]) => void;
}

export const useMetroMapStore = create<MetroMapState>((set) => ({
  lines: [],
  allStations: [],
  isLoading: false,
  error: null,
  routeResult: null,
  isRouteLoading: false,
  selectedFacilities: [],

  fetchMetroMap: async () => {
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
