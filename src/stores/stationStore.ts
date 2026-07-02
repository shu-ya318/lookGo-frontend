import { create } from 'zustand';

import { getStationByCode } from '@/services/metro';
import { handleApiError } from '@/services/error';
import { useMetroMapStore } from '@/stores/metroMapStore';

import type { StationDetails } from '@/services/metro/interface';

interface StationState {
  currentStationCode: string | null;
  stationDetails: StationDetails | null;
  isLoading: boolean;
  error: string | null;
  selectAndFetchStation: (stationCode: string) => Promise<void>;
  clearSelection: () => void;
}

export const useStationStore = create<StationState>((set) => ({
  currentStationCode: null,
  stationDetails: null,
  isLoading: false,
  error: null,

  selectAndFetchStation: async (stationCode) => {
    set({ currentStationCode: stationCode, isLoading: true, error: null });

    try {
      const { selectedFacilities } = useMetroMapStore.getState();
      const details = await getStationByCode({
        stationCode,
        stationFacilities: selectedFacilities.length > 0 ? selectedFacilities : undefined,
      });

      set({ stationDetails: details });
    } catch (error) {
      set({ error: handleApiError(error) });
    } finally {
      set({ isLoading: false });
    }
  },

  clearSelection: () => set({ currentStationCode: null, stationDetails: null }),
}));
