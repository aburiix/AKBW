import type { Request, Response } from "express";
import type Anthropic from "@anthropic-ai/sdk";
import { prisma } from "../db/client.js";
import {
  DAILY_LIMIT,
  MAX_THREAD_MESSAGES,
  assistantEnabled,
  makeTitle,
  runTurn,
} from "../services/assistant.service.js";

type Lang = "uz" | "ru" | "en";
const langOf = (req: Request): Lang => {
  const l = String((req as any).languageCode || req.headers["accept-language"] || "uz").slice(0, 2);
  return l === "ru" || l === "en" ? l : "uz";
};

// Kun Toshkent vaqti (UTC+5) bo'yicha
function startOfDay(): Date {
  const off = 5 * 3600 * 1000;
  const d = new Date(Date.now() + off);
  d.setUTCHours(0, 0, 0, 0);
  return new Date(d.getTime() - off);
}
const usedToday = (userId: string) =>
  prisma.assistantMessage.count({
    where: { role: "user", NOT: { ui: { equals: null as any } }, createdAt: { gte: startOfDay() }, thread: { userId } },
  });

export const getMe = async (req: Request, res: Response) => {
  const userId = req.user;
  const [used, memories, threads] = await Promise.all([
    usedToday(userId),
    prisma.assistantMemory.findMany({ where: { userId }, orderBy: { createdAt: "asc" }, select: { id: true, fact: true } }),
    prisma.assistantThread.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: 30,
      select: { id: true, title: true, updatedAt: true },
    }),
  ]);
  res.json({ ok: true, enabled: assistantEnabled(), limit: DAILY_LIMIT, left: Math.max(0, DAILY_LIMIT - used), memories, threads });
};

export const getThread = async (req: Request, res: Response) => {
  const thread = await prisma.assistantThread.findFirst({ where: { id: String(req.params.id), userId: req.user } });
  if (!thread) return res.status(404).json({ ok: false, message: "Topilmadi" });
  const rows = await prisma.assistantMessage.findMany({
    where: { threadId: thread.id, NOT: { ui: { equals: null as any } } },
    orderBy: { id: "asc" },
    select: { id: true, role: true, ui: true, createdAt: true },
  });
  res.json({ ok: true, thread: { id: thread.id, title: thread.title }, messages: rows });
};

export const deleteThread = async (req: Request, res: Response) => {
  const r = await prisma.assistantThread.deleteMany({ where: { id: String(req.params.id), userId: req.user } });
  res.json({ ok: r.count > 0 });
};

export const deleteMemory = async (req: Request, res: Response) => {
  const where = req.params.id ? { id: Number(req.params.id), userId: req.user } : { userId: req.user };
  const r = await prisma.assistantMemory.deleteMany({ where });
  res.json({ ok: true, deleted: r.count });
};

export const chat = async (req: Request, res: Response) => {
  const userId = req.user;
  const lang = langOf(req);
  const text = String(req.body?.message ?? "").trim().slice(0, 2000);
  if (!text) return res.status(400).json({ ok: false, code: "EMPTY", message: "Xabar bo'sh" });
  if (!assistantEnabled()) return res.status(503).json({ ok: false, code: "DISABLED", message: "Yordamchi hali sozlanmagan" });
  if ((await usedToday(userId)) >= DAILY_LIMIT) return res.status(429).json({ ok: false, code: "LIMIT", message: "Bugungi limit tugadi" });

  // Suhbat: mavjudini davom ettirish yoki yangisini ochish
  let thread = req.body?.threadId
    ? await prisma.assistantThread.findFirst({ where: { id: String(req.body.threadId), userId } })
    : null;
  if (!thread) thread = await prisma.assistantThread.create({ data: { userId, title: await makeTitle(text) } });

  const rows = await prisma.assistantMessage.findMany({ where: { threadId: thread.id }, orderBy: { id: "asc" } });
  if (rows.length >= MAX_THREAD_MESSAGES) {
    return res.status(409).json({ ok: false, code: "THREAD_FULL", message: "Suhbat juda uzun — yangi suhbat oching" });
  }
  // Tarix o'zgartirilmasdan qaytariladi (append-only). Ketma-ket bir xil rollar — API ularni birlashtiradi.
  const history: Anthropic.Beta.BetaMessageParam[] = rows.map((r) => ({ role: r.role as "user" | "assistant", content: r.api as any }));

  // Oldingi navbat vosita chaqiruvida uzilgan bo'lsa — javobsiz tool_use'larga xato natija qo'shamiz
  const last = rows[rows.length - 1];
  const pending: Anthropic.Beta.BetaToolResultBlockParam[] = [];
  if (last?.role === "assistant" && Array.isArray(last.api)) {
    for (const b of last.api as any[]) {
      if (b?.type === "tool_use") pending.push({ type: "tool_result", tool_use_id: b.id, is_error: true, content: "Uzildi" });
    }
  }

  // Joriy sahifa konteksti (mijoz qaysi mahsulotni ko'ryapti)
  const content: Anthropic.Beta.BetaContentBlockParam[] = [...pending];
  const productId = Number(req.body?.productId);
  if (Number.isInteger(productId) && productId > 0) {
    const p = await prisma.products.findUnique({ where: { id: productId }, include: { translations: true } });
    const name = p?.translations.find((t) => t.lang === lang)?.name ?? p?.translations[0]?.name;
    if (p && name) content.push({ type: "text", text: `[Kontekst: mijoz hozir #${p.id} «${name}» (${p.price} so'm) mahsulot sahifasini ko'ryapti]` });
  }
  content.push({ type: "text", text });

  // SSE
  res.status(200);
  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders?.();
  const emit = (event: string, data: unknown) => {
    if (!res.writableEnded) res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };
  const abort = new AbortController();
  res.on("close", () => abort.abort());
  emit("meta", { threadId: thread.id, title: thread.title });

  const threadId = thread.id;
  try {
    await runTurn({
      userId,
      threadId,
      lang,
      history,
      userContent: content,
      userUi: { text },
      emit,
      signal: abort.signal,
      save: async (role, api, ui) => {
        await prisma.assistantMessage.create({ data: { threadId, role, api: api as any, ui: (ui ?? undefined) as any } });
      },
    });
    await prisma.assistantThread.update({ where: { id: threadId }, data: { updatedAt: new Date() } });
    const used = await usedToday(userId);
    emit("done", { left: Math.max(0, DAILY_LIMIT - used) });
  } catch (e: any) {
    if (!abort.signal.aborted) {
      console.error("[assistant] xato:", e?.status ?? "", e?.message ?? e);
      const code = e?.status === 429 || e?.status === 529 ? "BUSY" : e?.status === 401 ? "DISABLED" : "AI_ERROR";
      emit("error", { code });
    }
  } finally {
    if (!res.writableEnded) res.end();
  }
};
