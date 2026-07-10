import { create } from 'zustand';
import { enqueueSnackbar } from 'notistack';

import { useAuthStore } from '@/stores/authStore';

import {
  createStationBookmark,
  deleteStationBookmark,
  getAllStationBookmarkPaginated,
} from '@/services/stationBookmark';

import type { StationBookmark } from '@/services/stationBookmark/interface';

const FETCH_ALL_SIZE = 1000;

const getAccessToken = () => useAuthStore.getState().accessToken;

interface StationBookmarkState {
  bookmarks: StationBookmark[];
  isLoading: boolean;
  hasFetched: boolean;
  fetchAllBookmark: () => Promise<void>;
  toggleBookmark: (stationId: number) => Promise<void>;
}

export const useStationBookmarkStore = create<StationBookmarkState>(
  (set, get) => ({
    bookmarks: [],
    isLoading: false,
    hasFetched: false,

    fetchAllBookmark: async () => {
      if (get().hasFetched || !getAccessToken()) return;

      set({ isLoading: true });

      try {
        const response = await getAllStationBookmarkPaginated({
          page: 0,
          size: FETCH_ALL_SIZE,
        });
        set({ bookmarks: response.content, hasFetched: true });
      } catch (error) {
        enqueueSnackbar((error as string) || '取得車站書籤失敗', {
          variant: 'error',
        });
      } finally {
        set({ isLoading: false });
      }
    },

    toggleBookmark: async (stationId) => {
      if (!getAccessToken()) {
        enqueueSnackbar('請先登入以使用車站書籤功能', { variant: 'warning' });
        return;
      }

      const existing = get().bookmarks.find(
        (bookmark) => bookmark.stationId === stationId,
      );

      try {
        if (existing) {
          await deleteStationBookmark({ bookmarkId: existing.id });
          set({
            bookmarks: get().bookmarks.filter(
              (bookmark) => bookmark.id !== existing.id,
            ),
          });
        } else {
          const response = await createStationBookmark({ stationId });
          set({ bookmarks: [...get().bookmarks, response] });
        }
      } catch (error) {
        enqueueSnackbar((error as string) || '更新車站書籤失敗', {
          variant: 'error',
        });
      }
    },
  }),
);
