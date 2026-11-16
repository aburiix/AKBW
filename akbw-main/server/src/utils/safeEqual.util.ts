import crypto from "crypto";

/** Vaqtga bog'liq bo'lmagan qator solishtirish (kalitni taxmin qilishga qarshi) */
export const safeEqual = (a: string, b: string): boolean => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};
