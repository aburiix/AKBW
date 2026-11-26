import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Product } from './types';

type FavState = {
  items: Product[];
  toggle: (p: Product) => void;
  has: (id: number) => boolean;
};

export const useFavorites = create<FavState>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (p) => {
        const items = get().items;
        set({ items: items.some((i) => i.id === p.id) ? items.filter((i) => i.id !== p.id) : [p, ...items] });
      },
      has: (id) => get().items.some((i) => i.id === id),
    }),
    { name: 'akbw.favorites', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
