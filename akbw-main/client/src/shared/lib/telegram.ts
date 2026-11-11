/**
 * Telegram Mini App yordamchilari.
 * Sayt oddiy brauzerda ochilsa hammasi jim o'tkazib yuboriladi.
 */

type Haptic = 'light' | 'medium' | 'heavy' | 'rigid' | 'soft';

export interface TgWebApp {
  initData: string;
  initDataUnsafe?: {
    user?: { id: number; first_name?: string; username?: string };
  };
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  isExpanded: boolean;
  ready: () => void;
  expand: () => void;
  close: () => void;
  isVersionAtLeast: (v: string) => boolean;
  setHeaderColor: (c: string) => void;
  setBackgroundColor: (c: string) => void;
  setBottomBarColor?: (c: string) => void;
  disableVerticalSwipes?: () => void;
  enableClosingConfirmation?: () => void;
  openLink: (url: string, opts?: { try_instant_view?: boolean }) => void;
  openTelegramLink: (url: string) => void;
  BackButton: {
    show: () => void;
    hide: () => void;
    onClick: (cb: () => void) => void;
    offClick: (cb: () => void) => void;
  };
  HapticFeedback: {
    impactOccurred: (s: Haptic) => void;
    notificationOccurred: (t: 'error' | 'success' | 'warning') => void;
    selectionChanged: () => void;
  };
  onEvent: (e: string, cb: () => void) => void;
  offEvent: (e: string, cb: () => void) => void;
}

declare global {
  interface Window {
    Telegram?: { WebApp?: TgWebApp };
  }
}

/** Sayt Telegram ichida ochilganmi (initData bo'sh bo'lmasa) */
export function getTelegram(): TgWebApp | null {
  if (typeof window === 'undefined') return null;
  const wa = window.Telegram?.WebApp;
  return wa && wa.initData ? wa : null;
}

export const isTelegram = () => getTelegram() !== null;

/** Tashqi havola (Payme, Click, Paynet...) — Telegram ichida tashqi brauzerda ochiladi */
export function openExternal(url: string) {
  const tg = getTelegram();
  if (tg) {
    tg.openLink(url);
    return;
  }
  window.location.replace(url);
}

export function haptic(
  kind: Haptic | 'success' | 'error' | 'select' = 'light',
) {
  const h = getTelegram()?.HapticFeedback;
  if (!h) return;
  try {
    if (kind === 'success' || kind === 'error') h.notificationOccurred(kind);
    else if (kind === 'select') h.selectionChanged();
    else h.impactOccurred(kind);
  } catch {
    /* eski Telegram versiyasi */
  }
}
