# AKBW — Aburiix Kraft Brand Wear

Kiyim-kechak marketpleysi: sayt, admin panel, server, zavod paneli, Chrome kengaytmasi va Telegram botlari.

## Papkalar

| Papka | Tavsif |
|---|---|
| `akbw-design/` | **Asosiy (joriy) loyiha** — yangi dizayn, Telegram Mini App va mijozlar boti bilan |
| `akbw-main/` | Asl (eski) nusxa — solishtirish uchun |
| `dizayn-maket/` | Yangi dizaynning HTML maketlari (v1–v5, tasdiqlangani `v5.html`) |

### `akbw-design/` ichida
- `client/` — akbw.uz sayti (Next.js 15, next-intl uz/ru/en, Tailwind v4)
- `server/` — API (Node, Prisma, PostgreSQL; Payme/Click/Paynet/Uzum, BTS, Eskiz SMS)
- `admin/` — admin panel
- `factory/` — zavod paneli
- `ext/` — Chrome kengaytmasi
- `bot/` — xodimlar boti (buyurtmalar, hisobotlar)
- `shop-bot/` — mijozlar boti: do'konni Telegram Mini App sifatida ochadi

## Sozlash
Maxfiy qiymatlar repoda **saqlanmaydi**. Har bir papkadagi `.env.example` dan nusxa olib, `.env` yarating:
- ildiz `.env` — `POSTGRES_PASSWORD` (docker-compose uchun)
- `server/.env` — baza, JWT, to'lov tizimlari, BTS, SMS, birinchi admin (`ADMIN_PHONE`, `ADMIN_PASSWORD`)
- `shop-bot/.env` — `SHOP_BOT_TOKEN`, `WEBAPP_URL`

Ishga tushirish (server tomonda): `docker compose up -d --build`.
