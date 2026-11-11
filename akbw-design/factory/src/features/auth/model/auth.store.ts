import {
  create
} from 'zustand';
import {
  persist,
  createJSONStorage
} from 'zustand/middleware';

interface FactoryAuthState {
  token: string | null;
  factory: {
    id: number;
    name: string;
    login: string;
  } | null;
  setAuth: (token: string, factory: any) => void;
  logout: () => void;
}

export const useFactoryAuthStore = create<FactoryAuthState>()(
  persist(
    (set) => ({
      token: null,
      factory: null,
      setAuth: (token, factory) => set({ token, factory }),
      logout: () => set({ token: null, factory: null }),
    }),
    {
      name: 'factory-auth-storage',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
