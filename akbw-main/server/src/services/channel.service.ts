import { prisma } from "../db/client.js";

/**
 * Yangi mahsulotni Telegram kanalga post qilish (rasm + narx + o'lcham/rang + "Sotib olish" tugmasi).
 * Do'kon boti kanalda admin bo'lishi kerak. Sozlamalar (server.env):
 *   CHANNEL_BOT_TOKEN — do'kon boti kaliti (deploy/set-channel.sh shop-bot.env dan ko'chiradi)
 *   CHANNEL_ID        — @kanal_nomi yoki -100… raqami
 *   SITE_URL          — tugma havolasi uchun (standart https://akbw.uz)
 * Sozlanmagan bo'lsa funksiya o'chiq: hech narsa yuborilmaydi.
 *
 * Xavfsizlik: bot kaliti URL ichida bo'ladi — shuning uchun xatolar faqat Telegram javobi bilan
 * (URL va kalitsiz) logga yoziladi.
 */

const cfg = () => ({
    token: (process.env.CHANNEL_BOT_TOKEN ?? "").replace(/['"\s]/g, ""),
    chatId: (process.env.CHANNEL_ID ?? "").replace(/['"\s]/g, ""),
    site: (process.env.SITE_URL || "https://akbw.uz").replace(/\/+$/, ""),
});

export const isChannelEnabled = () => {
    const { token, chatId } = cfg();
    return !!token && !!chatId;
};

export class ChannelError extends Error {
    constructor(message: string, public code = 400) {
        super(message);
    }
}

type TgResult<T> = { ok: boolean; result?: T; description?: string; error_code?: number };

async function tg<T = any>(method: string, body: Record<string, unknown>): Promise<T> {
    const { token } = cfg();
    let res: Response;
    try {
        res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
            signal: AbortSignal.timeout(20000),
        });
    } catch {
        throw new ChannelError("Telegram bilan bog'lanib bo'lmadi", 502);
    }
    const data = (await res.json().catch(() => ({}))) as TgResult<T>;
    if (!data.ok) {
        console.error(`Telegram ${method} xatosi:`, data.error_code, data.description);
        throw new ChannelError(humanize(data.description), data.error_code ?? 400);
    }
    return data.result as T;
}

/** Telegram xatosini admin tushunadigan matnga */
function humanize(d = ""): string {
    if (/chat not found/i.test(d)) return "Kanal topilmadi. Kanal nomini tekshiring.";
    if (/not enough rights|need administrator|not a member|bot is not a member/i.test(d))
        return "Bot kanalda admin emas yoki post yuborish huquqi yo'q.";
    if (/wrong file identifier|failed to get http url content|wrong type of the web page content|IMAGE_PROCESS_FAILED/i.test(d))
        return "Mahsulot rasmini Telegram ochib bo'lmadi. Rasm havolasini tekshiring.";
    if (/Unauthorized/i.test(d)) return "Bot kaliti noto'g'ri.";
    if (/Too Many Requests/i.test(d)) return "Telegram cheklovi: birozdan keyin qayta urinib ko'ring.";
    return d ? `Telegram xatosi: ${d}` : "Telegram xatosi";
}

/** O'zbekcha matn — yangi alifbo (Ö Ğ Ş Ç), havolalar va @nomlar tegmaydi */
export function toNewLatin(text: string): string {
    return text
        .split(/(https?:\/\/\S+|@[\w.]+)/)
        .map((part, i) =>
            i % 2
                ? part
                : part
                      .replace(/O['ʻ‘’`]/g, "Ö")
                      .replace(/o['ʻ‘’`]/g, "ö")
                      .replace(/G['ʻ‘’`]/g, "Ğ")
                      .replace(/g['ʻ‘’`]/g, "ğ")
                      .replace(/S[Hh]/g, "Ş")
                      .replace(/sh/g, "ş")
                      .replace(/C[Hh]/g, "Ç")
                      .replace(/ch/g, "ç"),
        )
        .join("");
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const money = (n: number) => `${Math.round(n).toLocaleString("ru-RU").replace(/ /g, " ")} söm`;
const https = (u?: string | null) => (u ? u.replace(/^http:\/\//, "https://") : "");

const PRODUCT_INCLUDE = {
    translations: true,
    sizes: { include: { translations: true } },
    colors: { include: { translations: true } },
} as const;

const pickName = (tr: { lang: string; name: string }[] | undefined) =>
    tr?.find((t) => t.lang === "uz")?.name || tr?.[0]?.name || "";

async function loadProduct(id: number) {
    const p = await prisma.products.findUnique({ where: { id }, include: PRODUCT_INCLUDE });
    if (!p) throw new ChannelError("Mahsulot topilmadi", 404);
    return p;
}
type FullProduct = Awaited<ReturnType<typeof loadProduct>>;

/** Post matni (HTML, ≤ 1024 belgi — Telegram rasm izohi chegarasi) */
export function buildCaption(p: FullProduct): string {
    const tr = p.translations.find((t) => t.lang === "uz") ?? p.translations[0];
    const name = toNewLatin(tr?.name ?? `Mahsulot #${p.id}`);
    const discount = Math.min(100, Math.max(0, p.discount || 0));
    const final = Math.round(p.price * (1 - discount / 100));
    const sizes = p.sizes.map((s) => pickName(s.translations)).filter(Boolean);
    const colors = p.colors.map((c) => toNewLatin(pickName(c.translations))).filter(Boolean);

    const lines: string[] = [`<b>${esc(name)}</b>`, ""];
    lines.push(
        discount > 0
            ? `💰 <b>${money(final)}</b>  <s>${money(p.price)}</s>  (−${discount}%)`
            : `💰 <b>${money(final)}</b>`,
    );
    if (sizes.length) lines.push(`📏 Ölçamlar: ${esc(sizes.join(" · "))}`);
    if (colors.length) lines.push(`🎨 Ranglar: ${esc(colors.join(" · "))}`);

    const desc = toNewLatin((tr?.description ?? "").trim());
    const footer = ["", "🚚 BTS orqali butun Özbekiston böylab yetkaziş", "", "#AKBW #yangi"];
    const used = lines.join("\n").length + footer.join("\n").length + 4;
    if (desc) {
        const room = 1000 - used;
        if (room > 40) lines.push("", esc(desc.length > room ? desc.slice(0, room - 1).trimEnd() + "…" : desc));
    }
    return [...lines, ...footer].join("\n");
}

function markup(p: FullProduct) {
    const { site } = cfg();
    return { inline_keyboard: [[{ text: "🛍 Sotib olish", url: `${site}/uz/product/${p.id}` }]] };
}

function mainPhoto(p: FullProduct) {
    const photo = https(p.product_images?.[0]);
    if (!photo) throw new ChannelError("Mahsulotda rasm yo'q — kanalga rasmsiz post yuborilmaydi.");
    return photo;
}

/** Kanalga yangi post yuboradi yoki mavjud postni yangilaydi */
export async function publishProduct(id: number): Promise<{ message_id: number; updated: boolean }> {
    if (!isChannelEnabled()) throw new ChannelError("Telegram kanal hali sozlanmagan.", 503);
    const p = await loadProduct(id);
    if (p.channel_message_id) {
        await updateProductPost(id, p);
        return { message_id: p.channel_message_id, updated: true };
    }
    const msg = await tg<{ message_id: number }>("sendPhoto", {
        chat_id: cfg().chatId,
        photo: mainPhoto(p),
        caption: buildCaption(p),
        parse_mode: "HTML",
        reply_markup: markup(p),
    });
    await prisma.products.update({
        where: { id },
        data: { channel_message_id: msg.message_id, channel_posted_at: new Date() },
    });
    return { message_id: msg.message_id, updated: false };
}

/** Mahsulot tahrirlanganda kanaldagi postni yangilaydi (rasm, narx, matn). Post yo'q bo'lsa — hech narsa. */
export async function updateProductPost(id: number, preloaded?: FullProduct): Promise<boolean> {
    if (!isChannelEnabled()) return false;
    const p = preloaded ?? (await loadProduct(id));
    if (!p.channel_message_id) return false;
    try {
        await tg("editMessageMedia", {
            chat_id: cfg().chatId,
            message_id: p.channel_message_id,
            media: { type: "photo", media: mainPhoto(p), caption: buildCaption(p), parse_mode: "HTML" },
            reply_markup: markup(p),
        });
    } catch (e) {
        // o'zgarish bo'lmasa Telegram xato qaytaradi — bu xato emas
        if (e instanceof ChannelError && /not modified/i.test(e.message)) return true;
        // post kanaldan qo'lda o'chirilgan bo'lsa — belgini tozalaymiz, keyingi safar yangidan yuboriladi
        if (e instanceof ChannelError && /message to edit not found/i.test(e.message)) {
            await prisma.products.update({ where: { id }, data: { channel_message_id: null, channel_posted_at: null } });
            return false;
        }
        throw e;
    }
    return true;
}

/**
 * Mahsulot o'chirilganda kanaldagi postni olib tashlaydi.
 * Telegram 48 soatdan eski postni botga o'chirtirmasligi mumkin — unda post "Sotuvda yo'q" deb belgilanadi.
 */
export async function removeProductPost(id: number): Promise<void> {
    if (!isChannelEnabled()) return;
    const p = await prisma.products.findUnique({ where: { id }, select: { channel_message_id: true } });
    if (!p?.channel_message_id) return;
    const { chatId } = cfg();
    try {
        await tg("deleteMessage", { chat_id: chatId, message_id: p.channel_message_id });
    } catch {
        await tg("editMessageReplyMarkup", {
            chat_id: chatId,
            message_id: p.channel_message_id,
            reply_markup: { inline_keyboard: [[{ text: "❌ Sotuvda yöq", url: cfg().site }]] },
        }).catch(() => {});
    }
}
