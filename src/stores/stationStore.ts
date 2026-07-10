import { create } from 'zustand';

import { getStationByCode } from '@/services/metro';
import { handleApiError } from '@/services/error';

import { useMetroMapStore } from '@/stores/metroMapStore';

import type { StationDetail } from '@/services/metro/interface';

interface StationState {
  currentStationCode: string | null;
  stationDetail: StationDetail | null;
  isStationLoading: boolean;
  error: string | null;
  selectAndFetchStation: (stationCode: string) => Promise<void>;
  clearSelection: () => void;
}

export const useStationStore = create<StationState>((set) => ({
  currentStationCode: null,
  stationDetail: null,
  isStationLoading: false,
  error: null,

  selectAndFetchStation: async (stationCode) => {
    set({ currentStationCode: stationCode, isStationLoading: true, error: null });

    try {
      const { selectedFacilities } = useMetroMapStore.getState();
      const response = await getStationByCode({
        stationCode,
        ...(selectedFacilities.length > 0 && {
          stationFacilities: selectedFacilities,
        }),
      });
      set({ stationDetail: response });
    } catch (error) {
      set({ error: handleApiError(error) });
    } finally {
      set({ isStationLoading: false });
    }
  },

  clearSelection: () => set({ currentStationCode: null, stationDetail: null }),
}));
