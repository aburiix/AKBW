import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type BearStore = {
  token: string | null;
  refreshToken: string | null;
  setToken: (token: string | null, refreshToken?: string | null) => void;
  logout: () => void;
};

export const useUserStore = create<BearStore>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      setToken: (token, refreshToken) =>
        set({ token, refreshToken: refreshToken || null }),
      logout: () => {
        set({ token: null, refreshToken: null });
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
