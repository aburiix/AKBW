// AKBW mijozlar boti — do'konni Telegram ichida ilova (Mini App) sifatida ochadi.
// Ishga tushirish: .env.example -> .env, tokenni yozing, so'ng `npm install && npm start`.
import dotenv from "dotenv";
import { Telegraf, Markup } from "telegraf";

dotenv.config();

// Telegram HTML: ismdagi < > & xabarni buzmasin
const esc = (v) => String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const TOKEN = process.env.SHOP_BOT_TOKEN;
const BASE = (process.env.WEBAPP_URL || "https://akbw.uz").replace(/\/$/, "");
if (!TOKEN) throw new Error("SHOP_BOT_TOKEN .env faylida yo'q");
if (!BASE.startsWith("https://")) throw new Error("WEBAPP_URL https:// bilan boshlanishi kerak (Telegram talabi)");

// Foydalanuvchi tiliga mos sahifa
const lang = (ctx) => {
  const c = ctx.from?.language_code || "uz";
  return c.startsWith("ru") ? "ru" : c.startsWith("en") ? "en" : "uz";
};
const url = (ctx, path = "") => `${BASE}/${lang(ctx)}${path}`;

const T = {
  uz: { hi: (n) => `Assalomu alaykum, ${n}! 👋\n\n<b>AKBW</b> — Aburiix Kraft Brand Wear.\nKiyimlarni şu yerning özida, Telegram içida tanlang va buyurtma bering.\n\n🚚 BTS orqali butun Özbekiston böylab yetkazamiz.`, shop: "🛍 Dökonni oçiş", cat: "👕 Katalog", cart: "🧺 Savat", help: "Dökonni oçiş uçun pastdagi tugmani bosing 👇" },
  ru: { hi: (n) => `Здравствуйте, ${n}! 👋\n\n<b>AKBW</b> — Aburiix Kraft Brand Wear.\nВыбирайте и заказывайте одежду прямо в Telegram.\n\n🚚 Доставка по всему Узбекистану через BTS.`, shop: "🛍 Открыть магазин", cat: "👕 Каталог", cart: "🧺 Корзина", help: "Нажмите кнопку ниже, чтобы открыть магазин 👇" },
  en: { hi: (n) => `Hello, ${n}! 👋\n\n<b>AKBW</b> — Aburiix Kraft Brand Wear.\nBrowse and order clothes right inside Telegram.\n\n🚚 Delivery across Uzbekistan via BTS.`, shop: "🛍 Open the shop", cat: "👕 Catalog", cart: "🧺 Cart", help: "Tap the button below to open the shop 👇" },
};

const shopKeyboard = (ctx) => {
  const t = T[lang(ctx)];
  return Markup.inlineKeyboard([
    [Markup.button.webApp(t.shop, url(ctx))],
    [Markup.button.webApp(t.cat, url(ctx, "/filters")), Markup.button.webApp(t.cart, url(ctx, "/cart"))],
  ]);
};

const bot = new Telegraf(TOKEN);

// Har bir kelgan xabarni logga yozish (diagnostika uchun; matn yozilmaydi)
bot.use((ctx, next) => {
  console.log(`[update] ${ctx.updateType} from=${ctx.from?.id ?? "-"} lang=${ctx.from?.language_code ?? "-"}`);
  return next();
});
bot.catch((err, ctx) => console.error(`[xato] ${ctx?.updateType}:`, err?.message || err));

bot.start((ctx) =>
  ctx.reply(T[lang(ctx)].hi(esc(ctx.from?.first_name || "")), { parse_mode: "HTML", ...shopKeyboard(ctx) }),
);
bot.command("shop", (ctx) => ctx.reply(T[lang(ctx)].help, shopKeyboard(ctx)));
bot.on("message", (ctx) => ctx.reply(T[lang(ctx)].help, shopKeyboard(ctx)));

// Chat pastidagi doimiy "Do'kon" menyu tugmasi (hamma uchun)
await bot.telegram.setChatMenuButton({
  menuButton: { type: "web_app", text: "Dökon", web_app: { url: `${BASE}/uz` } },
});
await bot.telegram.setMyCommands([
  { command: "start", description: "Boşlaş" },
  { command: "shop", description: "Dökonni oçiş" },
]);

bot.launch();
console.log(`AKBW shop bot ishga tushdi → ${BASE}`);
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
