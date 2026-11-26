import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMemo } from 'react';
import { Platform, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/**
 * AKBW v5 dizayn tizimi — sayt (akbw.uz) va admin panel bilan bir xil palitra.
 * Tungi rejim — asosiy; kunduzgi — admin paneldagi "Kunduzgi" palitra.
 */
export type Palette = {
  scheme: 'dark' | 'light';
  bg: string; // sahifa foni
  s1: string; // kartochka / yuza
  s2: string; // ichki yuza, rasm o'rni
  s3: string;
  text: string;
  mute: string;
  mute2: string;
  line: string;
  line2: string;
  ivory: string; // asosiy tugma foni (tungi: fil suyagi, kunduzgi: qora)
  onIvory: string; // shu tugma ustidagi matn
  bronze: string;
  star: string;
  ok: string;
  sale: string;
  info: string;
  glow: string; // sahifa tepasidagi iliq nur
  glass: string; // shisha panel foni
  heroBg: string; // banner radial gradienti
  onImage: string; // rasm ustidagi matn (doim och)
  shade: string; // rasm ustidagi qoraytirish
};

export const DARK: Palette = {
  scheme: 'dark',
  bg: '#0E0D0B',
  s1: '#161512',
  s2: '#1D1B18',
  s3: '#26231F',
  text: '#F6F0E6',
  mute: 'rgba(246,240,230,0.62)',
  mute2: 'rgba(246,240,230,0.40)',
  line: 'rgba(246,240,230,0.10)',
  line2: 'rgba(246,240,230,0.20)',
  ivory: '#EFE8DB',
  onIvory: '#13110F',
  bronze: '#8A6243',
  star: '#E6C58A',
  ok: '#A9C49A',
  sale: '#E0896F',
  info: '#9FB4C9',
  glow: 'radial-gradient(80% 50% at 50% -10%, rgba(138,98,67,0.30), transparent 70%)',
  glass: 'rgba(22,21,18,0.82)',
  heroBg: 'radial-gradient(70% 70% at 70% 30%, #6E4A2E, #24180F 60%, #120D09)',
  onImage: '#EFE8DB',
  shade: 'rgba(14,13,11,0.75)',
};

export const LIGHT: Palette = {
  scheme: 'light',
  bg: '#F6F4F0',
  s1: '#FBFAF7',
  s2: '#F0EDE7',
  s3: '#E6E2DA',
  text: '#13110F',
  mute: 'rgba(19,17,15,0.62)',
  mute2: 'rgba(19,17,15,0.42)',
  line: 'rgba(19,17,15,0.09)',
  line2: 'rgba(19,17,15,0.18)',
  ivory: '#13110F',
  onIvory: '#F6F0E6',
  bronze: '#8A6243',
  star: '#8A6243',
  ok: '#4F7A3F',
  sale: '#A94A33',
  info: '#3E6488',
  glow: 'radial-gradient(80% 50% at 50% -10%, rgba(138,98,67,0.16), transparent 70%)',
  glass: 'rgba(251,250,247,0.86)',
  heroBg: 'radial-gradient(70% 70% at 70% 30%, #6E4A2E, #24180F 60%, #120D09)',
  onImage: '#EFE8DB',
  shade: 'rgba(14,13,11,0.70)',
};

export const F = {
  display: 'Kenao', // logo
  serif: 'DidotBold', // sarlavhalar
  label: 'Futura', // KATTA HARFLI yorliqlar va tugmalar
} as const;

/** Saytdagi .lbl — Futura, 11px, harf oralig'i 0.2em, katta harf. */
export const label = (size = 11) => ({
  fontFamily: F.label,
  fontSize: size,
  letterSpacing: size * 0.2,
  textTransform: 'uppercase' as const,
});

export type ThemeMode = 'system' | 'dark' | 'light';

export const useThemeMode = create<{ mode: ThemeMode; setMode: (m: ThemeMode) => void }>()(
  persist((set) => ({ mode: 'system', setMode: (mode) => set({ mode }) }), {
    name: 'akbw.theme',
    storage: createJSONStorage(() => AsyncStorage),
  }),
);

/** Joriy palitra: foydalanuvchi tanlovi yoki telefon rejimi. */
export function useColors(): Palette {
  const system = useColorScheme();
  const mode = useThemeMode((s) => s.mode);
  const scheme = mode === 'system' ? (system === 'light' ? 'light' : 'dark') : mode;
  return scheme === 'light' ? LIGHT : DARK;
}

/** Palitraga bog'liq uslublar: const s = useStyles(mk) */
export function useStyles<T>(factory: (c: Palette) => T): T {
  const c = useColors();
  return useMemo(() => factory(c), [c, factory]);
}

/**
 * Tab sahifasi pastidan suzuvchi menyugacha qo'shimcha joy (simulyatorda o'lchangan:
 * shu qiymatda tugma bilan menyu orasida ~12 pt qoladi).
 */
export function useTabBarSpace(): number {
  const insets = useSafeAreaInsets();
  return insets.bottom + (Platform.OS === 'ios' ? 12 : 30);
}
