import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  accessToken: string | null;
  clearAuth: () => void;
}

// refreshToken 由後端以 HttpOnly Cookie 管理，前端不持有也不儲存
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      clearAuth: () => set({ accessToken: null }),
    }),
    {
      name: 'accessToken',
    },
  ),
);
