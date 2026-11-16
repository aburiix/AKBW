import type { NextFunction, Request, Response } from "express";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { rateLimit } from "express-rate-limit";
import { checkAdmins } from "./admin.middleware.js";

/**
 * Xavfsizlik qatlamlari:
 * - kirish urinishlarini cheklash (parolni taxmin qilishga qarshi)
 * - ishchi bot uchun maxfiy kalit
 * - admin yoki fabrika tokeni talab qiladigan yo'llar
 */

const digits = (v: unknown) => String(v ?? "").replace(/\D/g, "");
const tooMany = (minutes: number) => (_req: Request, res: Response) =>
  res.status(429).json({
    ok: false,
    code: "TOO_MANY_ATTEMPTS",
    message: `Juda ko'p noto'g'ri urinish. ${minutes} daqiqadan keyin qayta urinib ko'ring.`,
  });

// Nginx orqali kelgan haqiqiy IP (app "trust proxy" yoqilgan)
const common = { standardHeaders: true, legacyHeaders: false, validate: { trustProxy: false } } as const;

/** Admin/fabrika login: bitta IP — 15 daqiqada 10 ta, bitta raqam — 15 daqiqada 5 ta muvaffaqiyatsiz urinish */
export const loginLimiterByIp = rateLimit({
  ...common,
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  handler: tooMany(15),
});
export const loginLimiterByAccount = rateLimit({
  ...common,
  windowMs: 15 * 60 * 1000,
  limit: 5,
  skipSuccessfulRequests: true,
  keyGenerator: (req) => `acc:${digits(req.body?.phone) || req.body?.login || "x"}`,
  handler: tooMany(15),
});

/** SMS kodni tekshirish: bitta raqamga 10 daqiqada 6 ta urinish (5 xonali kodni taxmin qilishga qarshi) */
export const smsVerifyLimiter = rateLimit({
  ...common,
  windowMs: 10 * 60 * 1000,
  limit: 6,
  skipSuccessfulRequests: true,
  keyGenerator: (req) => `sms:${digits(req.body?.phone)}`,
  handler: tooMany(10),
});

/** SMS yuborish: bitta IP — 15 daqiqada 8 ta (SMS balansini behuda sarflashga qarshi) */
export const smsSendLimiter = rateLimit({
  ...common,
  windowMs: 15 * 60 * 1000,
  limit: 8,
  handler: tooMany(15),
});

/** Muvaffaqiyatsiz kirishni parolsiz qayd qilish */
export const logFailedLogin = (kind: string) => (req: Request, res: Response, next: NextFunction) => {
  res.on("finish", () => {
    if (res.statusCode === 401 || res.statusCode === 429) {
      const tail = digits(req.body?.phone).slice(-4) || "????";
      console.warn(`[login] ${kind} rad etildi status=${res.statusCode} ip=${req.ip} tel=***${tail}`);
    }
  });
  next();
};

/** Ishchi bot: X-Bot-Secret sarlavhasi server.env dagi BOT_API_SECRET ga teng bo'lishi shart */
export const checkBotSecret = (req: Request, res: Response, next: NextFunction) => {
  const expected = process.env.BOT_API_SECRET || "";
  const got = String(req.headers["x-bot-secret"] ?? "");
  const ok =
    expected.length >= 32 &&
    got.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(got), Buffer.from(expected));
  if (!ok) return res.status(401).json({ ok: false, message: "Unauthorized" });
  next();
};

/** Admin yoki fabrika tokeni (masalan, jo'natma holatini o'zgartirish) */
export const checkAdminOrFactory = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const secret = process.env.JWT_SECRET;
    if (token && secret) {
      const decoded: any = jwt.verify(token, secret);
      if (decoded?.role === "factory" && decoded.id) {
        req.user = String(decoded.id);
        return next();
      }
    }
  } catch {
    return res.status(401).json({ ok: false, message: "Unauthorized" });
  }
  return checkAdmins(req, res, next);
};
