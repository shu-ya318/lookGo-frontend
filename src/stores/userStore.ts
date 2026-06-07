import { create } from 'zustand';

import type { GetCurrentUserResponse } from '@/services/user/interface';

interface UserState {
  userInfo: GetCurrentUserResponse | null;
}

export const useUserStore = create<UserState>(() => ({
  userInfo: null,
}));
