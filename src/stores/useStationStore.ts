import { create } from 'zustand';

import { getStationByCode } from '@/services/metro';
import { handleApiError } from '@/services/error';

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
      const details = await getStationByCode(stationCode);

      set({ stationDetails: details });
    } catch (error) {
      set({ error: handleApiError(error) });
    } finally {
      set({ isLoading: false });
    }
  },

  clearSelection: () => set({ currentStationCode: null, stationDetails: null }),
}));
