import jwt from "jsonwebtoken";

/**
 * Telefon raqami SMS orqali tasdiqlanganini isbotlovchi qisqa muddatli imzo.
 * /api/sms/verify muvaffaqiyatli bo'lsa beriladi; /api/auth/login va /register
 * faqat shu imzo bilan ishlaydi (aks holda raqamni bilgan har kim kira olardi).
 */
const PURPOSE = "phone-verified";
const TTL = "10m";

export const normalizePhone = (v: unknown) => String(v ?? "").replace(/\D/g, "");

const secret = () => {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error("JWT_SECRET is not defined");
  return s;
};

export const signPhoneProof = (phone: string) =>
  jwt.sign({ phone: normalizePhone(phone), purpose: PURPOSE }, secret(), { expiresIn: TTL });

/** Imzo shu raqam uchun berilgan va muddati o'tmagan bo'lsa true */
export const checkPhoneProof = (token: unknown, phone: unknown): boolean => {
  if (typeof token !== "string" || !token) return false;
  try {
    const d: any = jwt.verify(token, secret());
    return d?.purpose === PURPOSE && !!d.phone && d.phone === normalizePhone(phone);
  } catch {
    return false;
  }
};
