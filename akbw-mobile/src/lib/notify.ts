import { create } from 'zustand';
import { ApiError } from './api';
import { tr } from './i18n';

/**
 * Ilovadagi har qanday xatolik foydalanuvchiga ko'rsatiladi (jim qolmaydi) — saytdagi bilan bir xil qoida.
 * Ekranning tepasida qisqa xabar (Toast) chiqadi; bir xil matn bir vaqtda bir marta.
 */

type Toast = { id: number; text: string; kind: 'error' | 'ok' };
type ToastState = { items: Toast[]; push: (text: string, kind?: Toast['kind']) => void; remove: (id: number) => void };

let seq = 0;
export const useToasts = create<ToastState>()((set, get) => ({
  items: [],
  push: (text, kind = 'error') => {
    if (get().items.some((x) => x.text === text)) return; // takror chiqmasin
    const id = ++seq;
    set((s) => ({ items: [...s.items.slice(-2), { id, text, kind }] }));
    setTimeout(() => get().remove(id), kind === 'error' ? 4500 : 2500);
  },
  remove: (id) => set((s) => ({ items: s.items.filter((x) => x.id !== id) })),
}));

export const showToast = (text: string, kind: Toast['kind'] = 'ok') => useToasts.getState().push(text, kind);

/** Xatoni tushunarli matnga aylantiradi. Server o'z sababini yuborsa — o'shani ko'rsatadi. */
export function describeError(error: unknown, fallback?: string): string {
  if (error instanceof ApiError) {
    if (error.status === 0) return error.message; // internet yo'q / vaqt tugadi — request() o'zi yozgan
    if (error.status >= 500 && error.status !== 503) return fallback || tr("Serverda xatolik yuz berdi. Birozdan keyin qayta urinib ko'ring.");
    if (error.message && error.message !== tr('Xatolik yuz berdi')) return error.message;
    if (error.status === 503) return tr("Xizmat vaqtincha ishlamayapti. Keyinroq urinib ko'ring.");
    if (error.status === 401) return tr('Sessiya tugadi. Iltimos, qayta kiring.');
    if (error.status === 403) return tr("Bu amal uchun ruxsat yo'q.");
    if (error.status === 404) return fallback || tr("So'ralgan ma'lumot topilmadi.");
    return fallback || tr("Ma'lumotlar noto'g'ri kiritildi. Tekshirib, qayta urinib ko'ring.");
  }
  if (error instanceof Error && error.message && !fallback) {
    if (/network request failed|failed to fetch|load failed/i.test(error.message))
      return tr("Internet bilan aloqa yo'q. Qayta urinib ko'ring.");
  }
  return fallback || tr("Kutilmagan xatolik yuz berdi. Iltimos, qayta urinib ko'ring.");
}

const isIgnorable = (error: unknown) =>
  error instanceof Error && (error.name === 'AbortError' || /cancel/i.test(error.message));

/** Xatoni ekranda ko'rsatadi. `.catch(notifyError)` yoki `catch (e) { notifyError(e, t('...')) }` */
export function notifyError(error: unknown, fallback?: string) {
  if (isIgnorable(error)) return;
  useToasts.getState().push(describeError(error, typeof fallback === 'string' ? fallback : undefined), 'error');
  if (__DEV__) console.warn('[AKBW xato]', error);
}

/** Kutilmagan JS xatolari va ushlanmagan Promise'lar ham jim qolmaydi (ilova ishga tushganda bir marta) */
let installed = false;
export function installGlobalErrorHandlers() {
  if (installed) return;
  installed = true;
  const EU = (globalThis as any).ErrorUtils;
  const prev = EU?.getGlobalHandler?.();
  EU?.setGlobalHandler?.((error: unknown, isFatal?: boolean) => {
    if (!isFatal) notifyError(error);
    prev?.(error, isFatal);
  });
  const H = (globalThis as any).HermesInternal;
  H?.enablePromiseRejectionTracker?.({
    allRejections: true,
    onUnhandled: (_id: number, error: unknown) => notifyError(error),
    onHandled: () => {},
  });
}
