import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      clearAuth: () => set({ accessToken: null, refreshToken: null }),
    }),
    {
      name: 'accessToken',
    },
  ),
);
