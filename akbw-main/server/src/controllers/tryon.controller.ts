import type { Request, Response } from "express";
import axios from "axios";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { prisma } from "../db/client.js";

/**
 * AI kiyib ko'rish: foydalanuvchi surati + mahsulot rasmi → FASHN (fal.ai) → realistik rasm.
 * Faqat tizimga kirganlar (auth). Kuniga TRYON_DAILY_LIMIT ta (standart 3) muvaffaqiyatli/jarayondagi urinish.
 * Foydalanuvchi surati saqlanmaydi — faqat xotirada fal.ai'ga yuboriladi; natija uploads/tryon ga yoziladi.
 */
const FAL_URL = "https://fal.run/fal-ai/fashn/tryon/v1.6";
const DAILY_LIMIT = Number(process.env.TRYON_DAILY_LIMIT) || 3;
const DIR = path.join(process.cwd(), "uploads", "tryon");

// Kun Toshkent vaqti (UTC+5) bo'yicha boshlanadi
function startOfDayTashkent(): Date {
  const offset = 5 * 60 * 60 * 1000;
  const local = new Date(Date.now() + offset);
  local.setUTCHours(0, 0, 0, 0);
  return new Date(local.getTime() - offset);
}

async function usedToday(userId: string): Promise<number> {
  return prisma.tryOn.count({
    where: { userId, createdAt: { gte: startOfDayTashkent() }, status: { in: ["pending", "done"] } },
  });
}

function publicBase(req: Request): string {
  return (process.env.PUBLIC_URL || `${req.protocol}://${req.get("host")}`).replace(/\/$/, "");
}

export const getMyTryOns = async (req: Request, res: Response) => {
  const userId = req.user;
  const [used, items] = await Promise.all([
    usedToday(userId),
    prisma.tryOn.findMany({
      where: { userId, status: "done" },
      orderBy: { createdAt: "desc" },
      take: 8,
      select: { id: true, productId: true, resultUrl: true, createdAt: true },
    }),
  ]);
  res.json({
    ok: true,
    enabled: Boolean(process.env.FAL_KEY),
    limit: DAILY_LIMIT,
    left: Math.max(0, DAILY_LIMIT - used),
    items,
  });
};

export const createTryOn = async (req: Request, res: Response) => {
  const userId = req.user;
  const falKey = process.env.FAL_KEY;
  if (!falKey) {
    return res.status(503).json({ ok: false, code: "DISABLED", message: "Kiyib ko'rish xizmati hali sozlanmagan" });
  }
  if (!req.file) {
    return res.status(400).json({ ok: false, code: "NO_PHOTO", message: "Surat yuborilmadi" });
  }
  const productId = Number(req.body.productId);
  const imageIndex = Math.max(0, Number(req.body.imageIndex) || 0);
  if (!Number.isInteger(productId) || productId <= 0) {
    return res.status(400).json({ ok: false, code: "BAD_PRODUCT", message: "Mahsulot tanlanmadi" });
  }

  const product = await prisma.products.findUnique({ where: { id: productId }, select: { id: true, product_images: true } });
  const garment = product?.product_images?.[imageIndex] || product?.product_images?.[0];
  if (!garment) {
    return res.status(404).json({ ok: false, code: "NO_PRODUCT", message: "Mahsulot topilmadi" });
  }

  if ((await usedToday(userId)) >= DAILY_LIMIT) {
    return res.status(429).json({ ok: false, code: "LIMIT", message: "Bugungi urinishlar tugadi", left: 0 });
  }

  // Urinishni oldindan band qilamiz — bir vaqtda bir nechta so'rov limitni aylanib o'tmasin
  const record = await prisma.tryOn.create({ data: { userId, productId } });
  if ((await usedToday(userId)) > DAILY_LIMIT) {
    await prisma.tryOn.update({ where: { id: record.id }, data: { status: "failed" } });
    return res.status(429).json({ ok: false, code: "LIMIT", message: "Bugungi urinishlar tugadi", left: 0 });
  }

  try {
    const modelImage = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    const { data } = await axios.post(
      FAL_URL,
      {
        model_image: modelImage,
        garment_image: garment,
        category: "auto",
        mode: "balanced",
        garment_photo_type: "auto",
        output_format: "jpeg",
        num_samples: 1,
      },
      { headers: { Authorization: `Key ${falKey}` }, timeout: 110_000 },
    );

    const url: string | undefined = data?.images?.[0]?.url;
    if (!url) throw new Error("AI natija qaytarmadi");

    // Natijani o'zimizda saqlaymiz (tashqi havola muddati tugashi mumkin)
    const img = await axios.get<ArrayBuffer>(url, { responseType: "arraybuffer", timeout: 30_000 });
    fs.mkdirSync(DIR, { recursive: true });
    const name = `${crypto.randomUUID()}.jpg`;
    fs.writeFileSync(path.join(DIR, name), Buffer.from(img.data));
    const resultUrl = `${publicBase(req)}/uploads/tryon/${name}`;

    await prisma.tryOn.update({ where: { id: record.id }, data: { status: "done", resultUrl } });
    const used = await usedToday(userId);
    return res.json({ ok: true, id: record.id, resultUrl, left: Math.max(0, DAILY_LIMIT - used) });
  } catch (error: any) {
    await prisma.tryOn.update({ where: { id: record.id }, data: { status: "failed" } }).catch(() => {});
    const detail = error?.response?.data?.detail ?? error?.response?.data ?? error?.message;
    console.error("[tryon] xato:", error?.response?.status, typeof detail === "string" ? detail : JSON.stringify(detail)?.slice(0, 500));
    const status = error?.response?.status;
    const code = status === 422 ? "BAD_IMAGE" : status === 401 || status === 403 ? "DISABLED" : "AI_ERROR";
    return res.status(code === "BAD_IMAGE" ? 422 : 502).json({
      ok: false,
      code,
      message: code === "BAD_IMAGE" ? "Suratda odam aniq ko'rinmadi — boshqa surat bilan urinib ko'ring" : "AI xizmatida xatolik, birozdan keyin urinib ko'ring",
    });
  }
};

export const deleteTryOn = async (req: Request, res: Response) => {
  const item = await prisma.tryOn.findFirst({ where: { id: String(req.params.id), userId: req.user } });
  if (!item) return res.status(404).json({ ok: false, message: "Topilmadi" });
  const file = item.resultUrl.split("/uploads/tryon/")[1];
  if (file && /^[\w-]+\.jpg$/.test(file)) fs.rm(path.join(DIR, file), { force: true }, () => {});
  await prisma.tryOn.delete({ where: { id: item.id } });
  res.json({ ok: true });
};
