import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Product } from './types';

export type CartItem = {
  key: string;
  productId: number;
  name: string;
  image?: string;
  price: number;
  discount: number;
  size?: string;
  color?: string;
  sizeId?: number | null;
  colorId?: number | null;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  add: (p: Product, size?: string, color?: string) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (p, size, color) => {
        const key = `${p.id}|${size ?? ''}|${color ?? ''}`;
        const items = get().items;
        const found = items.find((i) => i.key === key);
        if (found) {
          set({ items: items.map((i) => (i.key === key ? { ...i, quantity: i.quantity + 1 } : i)) });
        } else {
          set({
            items: [
              ...items,
              {
                key,
                productId: p.id,
                name: p.name,
                image: p.product_images?.[0],
                price: p.price,
                discount: p.discount ?? 0,
                size,
                color,
                sizeId: p.sizes?.find((x) => x.name === size)?.id ?? null,
                colorId: p.colors?.find((x) => x.name === color)?.id ?? null,
                quantity: 1,
              },
            ],
          });
        }
      },
      setQty: (key, qty) =>
        set({ items: get().items.map((i) => (i.key === key ? { ...i, quantity: Math.max(1, Math.min(99, qty)) } : i)) }),
      remove: (key) => set({ items: get().items.filter((i) => i.key !== key) }),
      clear: () => set({ items: [] }),
    }),
    { name: 'akbw.cart', storage: createJSONStorage(() => AsyncStorage) },
  ),
);

export const cartCount = (items: CartItem[]) => items.reduce((n, i) => n + i.quantity, 0);
