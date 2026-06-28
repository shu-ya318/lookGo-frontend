import { create } from 'zustand';

import { getMetroMap } from '@/services/metro';
import type { MetroMapLine } from '@/services/metro/interface';

interface MetroMapState {
  lines: MetroMapLine[];
  isLoading: boolean;
  error: string | null;
  fetchMetroMap: () => Promise<void>;
}

export const useMetroMapStore = create<MetroMapState>((set) => ({
  lines: [],
  isLoading: false,
  error: null,

  fetchMetroMap: async () => {
    set({ isLoading: true, error: null });
    try {
      const { lines } = await getMetroMap();
      set({ lines });
    } catch (err) {
      set({ error: err as string });
    } finally {
      set({ isLoading: false });
    }
  },
}));
