import { create } from 'zustand';
import { enqueueSnackbar } from 'notistack';

import { useAuthStore } from '@/stores/authStore';

import {
  createStationBookmark,
  deleteStationBookmark,
  getAllStationBookmarkPaginated,
} from '@/services/stationBookmark';

import type { StationBookmark } from '@/services/stationBookmark/interface';

// 用來一次取得目前使用者所有書籤，供各頁面判斷車站是否已收藏
const FETCH_ALL_SIZE = 1000;

interface StationBookmarkState {
  bookmarks: StationBookmark[];
  isLoading: boolean;
  hasFetched: boolean;
  fetchBookmarks: () => Promise<void>;
  toggleBookmark: (stationId: number) => Promise<void>;
}

export const useStationBookmarkStore = create<StationBookmarkState>((set, get) => ({
  bookmarks: [],
  isLoading: false,
  hasFetched: false,

  fetchBookmarks: async () => {
    if (get().hasFetched || !useAuthStore.getState().accessToken) return;

    set({ isLoading: true });
    try {
      const { content } = await getAllStationBookmarkPaginated({
        page: 0,
        size: FETCH_ALL_SIZE,
      });
      set({ bookmarks: content, hasFetched: true });
    } catch (error) {
      enqueueSnackbar((error as string) || '取得車站書籤失敗', {
        variant: 'error',
      });
    } finally {
      set({ isLoading: false });
    }
  },

  toggleBookmark: async (stationId) => {
    if (!useAuthStore.getState().accessToken) {
      enqueueSnackbar('請先登入以使用車站書籤功能', { variant: 'warning' });
      return;
    }

    const existing = get().bookmarks.find(
      bookmark => bookmark.stationId === stationId
    );

    try {
      if (existing) {
        await deleteStationBookmark({ bookmarkId: existing.id.toString() });
        set({
          bookmarks: get().bookmarks.filter(
            bookmark => bookmark.id !== existing.id
          ),
        });
      } else {
        const bookmark = await createStationBookmark({ stationId });
        set({ bookmarks: [...get().bookmarks, bookmark] });
      }
    } catch (error) {
      enqueueSnackbar((error as string) || '更新車站書籤失敗', {
        variant: 'error',
      });
    }
  },
}));
