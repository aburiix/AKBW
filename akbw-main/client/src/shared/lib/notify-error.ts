'use client';

import { isAxiosError, isCancel } from 'axios';
import { toast } from 'sonner';
import { getLocaleFromPathname } from '@/shared/config/api/httpClient';

/**
 * Saytdagi har qanday xatolik foydalanuvchiga xabar bilan ko'rsatiladi (jim qolmaydi).
 * Server o'z xabarini yuborsa — o'shani, bo'lmasa xato turiga qarab tushunarli matnni chiqaradi.
 * Bir xil xabar bir vaqtda bir marta chiqadi (toast id = matn).
 */

type Lang = 'uz' | 'ru' | 'en';

const TEXT: Record<string, Record<Lang, string>> = {
  offline: {
    uz: "Internet aloqasi yöq. Ulanişni tekşirib, qayta urinib köring.",
    ru: 'Нет подключения к интернету. Проверьте соединение и попробуйте снова.',
    en: 'No internet connection. Check your connection and try again.',
  },
  online: {
    uz: 'Internet qayta ulandi.',
    ru: 'Интернет снова подключён.',
    en: 'Back online.',
  },
  network: {
    uz: "Server bilan boğlanib bölmadi. Birozdan keyin qayta urinib köring.",
    ru: 'Не удалось связаться с сервером. Попробуйте чуть позже.',
    en: 'Could not reach the server. Please try again shortly.',
  },
  timeout: {
    uz: "Server javob bermayapti (vaqt tugadi). Qayta urinib köring.",
    ru: 'Сервер не отвечает (время ожидания истекло). Попробуйте снова.',
    en: 'The server is not responding (timed out). Please try again.',
  },
  server: {
    uz: "Serverda xatolik yuz berdi. Birozdan keyin qayta urinib köring.",
    ru: 'Ошибка на сервере. Попробуйте чуть позже.',
    en: 'Server error. Please try again shortly.',
  },
  unavailable: {
    uz: "Xizmat vaqtincha işlamayapti. Keyinroq urinib köring.",
    ru: 'Сервис временно недоступен. Попробуйте позже.',
    en: 'The service is temporarily unavailable. Please try later.',
  },
  rate: {
    uz: "Juda köp sörov yuborildi. Bir daqiqa kutib, qayta urinib köring.",
    ru: 'Слишком много запросов. Подождите минуту и попробуйте снова.',
    en: 'Too many requests. Wait a minute and try again.',
  },
  forbidden: {
    uz: "Bu amal uçun ruxsat yöq.",
    ru: 'Нет доступа для этого действия.',
    en: "You don't have permission to do this.",
  },
  notFound: {
    uz: "Söralgan ma'lumot topilmadi.",
    ru: 'Запрошенные данные не найдены.',
    en: 'The requested data was not found.',
  },
  badRequest: {
    uz: "Ma'lumotlar notöğri kiritildi. Tekşirib, qayta urinib köring.",
    ru: 'Данные введены неверно. Проверьте и попробуйте снова.',
    en: 'Some data is invalid. Check it and try again.',
  },
  session: {
    uz: "Sessiya tugadi. Iltimos, qayta kiring.",
    ru: 'Сессия истекла. Пожалуйста, войдите снова.',
    en: 'Your session has expired. Please sign in again.',
  },
  update: {
    uz: "Sayt yangilandi. Sahifani qayta yuklang.",
    ru: 'Сайт обновился. Перезагрузите страницу.',
    en: 'The site was updated. Please reload the page.',
  },
  reload: { uz: 'Qayta yuklaş', ru: 'Перезагрузить', en: 'Reload' },
  unknown: {
    uz: "Kutilmagan xatolik yuz berdi. Iltimos, qayta urinib köring.",
    ru: 'Произошла непредвиденная ошибка. Попробуйте снова.',
    en: 'An unexpected error occurred. Please try again.',
  },
};

const lang = (): Lang => {
  const l = getLocaleFromPathname() as string;
  return l === 'ru' || l === 'en' ? l : 'uz';
};
export const errorText = (key: keyof typeof TEXT) => TEXT[key][lang()];

/** Server yuborgan xabarni topadi ({message} | {error} | {errors:[{message}]} | matn) */
const serverMessage = (data: unknown): string | null => {
  if (!data) return null;
  if (typeof data === 'string') {
    const s = data.trim();
    // HTML sahifa (nginx 502 va h.k.) — foydalanuvchiga ko'rsatilmaydi
    return s && !s.startsWith('<') && s.length < 300 ? s : null;
  }
  if (typeof data === 'object') {
    const d = data as Record<string, any>;
    const m = d.message ?? d.error ?? d.errors?.[0]?.message ?? d.details?.[0]?.message;
    if (typeof m === 'string' && m.trim()) return m.trim();
  }
  return null;
};

/** Xatoni foydalanuvchiga tushunarli matnga aylantiradi */
export const describeError = (error: unknown, fallback?: string): string => {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return errorText('offline');
  if (isAxiosError(error)) {
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') return errorText('timeout');
    if (!error.response) return errorText('network');
    const status = error.response.status;
    const msg = serverMessage(error.response.data);
    // 5xx da server matni ko'pincha texnik bo'ladi — 503 (xizmat ulanmagan) bundan mustasno
    if (status >= 500 && status !== 503) return fallback || errorText('server');
    if (msg) return msg;
    if (status === 503) return errorText('unavailable');
    if (status === 429) return errorText('rate');
    if (status === 401) return errorText('session');
    if (status === 403) return errorText('forbidden');
    if (status === 404) return errorText('notFound');
    if (status >= 400) return fallback || errorText('badRequest');
  }
  if (error instanceof Error && /Loading chunk|ChunkLoadError|Failed to fetch dynamically imported module/i.test(error.message))
    return errorText('update');
  if (error instanceof TypeError && /fetch|network|load failed/i.test(error.message)) return errorText('network');
  return fallback || errorText('unknown');
};

/** Bekor qilingan so'rovlar va foydalanuvchi o'zi to'xtatgan amallar xato emas */
export const isIgnorable = (error: unknown): boolean => {
  if (isCancel(error)) return true;
  if (error instanceof DOMException && error.name === 'AbortError') return true;
  if (error instanceof Error && error.name === 'AbortError') return true;
  const m = error instanceof Error ? error.message : String(error ?? '');
  // brauzerning zararsiz ogohlantirishlari
  return /ResizeObserver loop|Script error\.?$|NotAllowedError|share canceled|Share canceled/i.test(m);
};

// Komponent o'zi ko'rsatgan xatolar — umumiy ushlagich ularni qayta chiqarmaydi
const NOTIFIED = new WeakSet<object>();
/** Komponent xatoni o'zi (boshqa matn bilan) ko'rsatganda belgilaydi */
export const markNotified = (error: unknown) => {
  if (typeof error === 'object' && error !== null) NOTIFIED.add(error);
};
export const wasNotified = (error: unknown) => typeof error === 'object' && error !== null && NOTIFIED.has(error);

/** Xatoni toast bilan ko'rsatadi (bir xato — bir xabar) */
export const notifyError = (error: unknown, fallback?: string) => {
  if (typeof window === 'undefined' || isIgnorable(error)) return;
  if (typeof error === 'object' && error !== null) {
    if (NOTIFIED.has(error)) return;
    NOTIFIED.add(error);
  }
  const text = describeError(error, fallback);
  const needsReload = text === errorText('update');
  toast.error(text, {
    id: text,
    ...(needsReload ? { action: { label: errorText('reload'), onClick: () => window.location.reload() }, duration: 15000 } : {}),
  });
  if (process.env.NODE_ENV !== 'production') console.warn('[AKBW xato]', error);
};
