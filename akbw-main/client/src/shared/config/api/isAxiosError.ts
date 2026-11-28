import { notifyError } from '@/shared/lib/notify-error';

/** Eski chaqiruvlar uchun: xatoni umumiy ushlagich orqali ko'rsatadi (server sababi bilan) */
export const onError = (error: unknown, err_massage?: string) => {
  notifyError(error, err_massage);
};
