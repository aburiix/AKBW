import { isAxiosError } from "axios";

/**
 * Logga yoziladigan xavfsiz xato ko'rinishi: tashqi xizmat (BTS, Payme…) xatosida faqat holat, javob va manzil.
 * So'rov tanasi (login/parol, mijoz ma'lumoti) va Authorization sarlavhasi logga tushmaydi.
 */
export const safeErr = (e: unknown) =>
  isAxiosError(e)
    ? { status: e.response?.status, data: e.response?.data, message: e.message, url: e.config?.url }
    : e;
