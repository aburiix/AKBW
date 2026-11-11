# Installation Guide

## Requirements

- **Node.js ≥ 20** (developed against Node 24)
- **npm ≥ 10**
- **Google Chrome** (Chromium-based browsers work too — including **Arc**, where
  the on-page launcher button is used since the toolbar icon isn't actionable)

## 1. Install dependencies

```bash
cd ext
npm install
```

## 2. Credentials

```bash
cp .env.example .env
# open .env and fill:
#   ADMIN_LOGIN=     ← admin phone number
#   ADMIN_PASSWORD=  ← admin password
```

These are baked into the bundle at build time: the extension logs in
automatically (`POST /api/admin/login`) and obtains a JWT, so you never have to
paste a token.

> **Security note:** credentials are embedded in the built extension, so anyone
> with the `dist/` folder can read them. Use an admin account scoped for this
> purpose.

## 3. Build

```bash
npm run build
```

This runs `clean → build:content → build:background → build:popup` and emits a
ready-to-load folder:

```
dist/
├─ manifest.json
├─ background.js        # service worker (ES module)
├─ content.js           # content script (IIFE, ~8 KB) — injects the floating panel
├─ popup.html           # panel entry (loaded in an iframe)
├─ assets/              # panel JS + CSS
└─ icons/               # 16/32/48/128
```

## 4. Load the unpacked extension

1. Open `chrome://extensions`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked**
4. Select the `ext/dist/` folder

You should see **AKBW Importer** in the toolbar.

## 5. Configure

1. Open any product page (e.g. `1688.com`, `amazon.com`, `aliexpress.com`)
2. A small round **AKBW Importer** button appears at the **bottom-right** of
   the page — click it (or the toolbar icon) to open the **floating panel**
3. Click the gear icon (**Sozlamalar**)
4. Set:
   - **API URL** — e.g. `https://api.akbw.uz` (default) or your local server
   - **JWT Token** — *optional*; if empty the extension logs in automatically
     with `ADMIN_LOGIN` / `ADMIN_PASSWORD` from `.env`
   - **Til (Language)** — `uz`, `ru` or `en` (used for `Accept-Language`)
   - Toggles for **clear-after-import** and **remember selections**
   - **Mavzu (Theme)** — system / light / dark

Settings are saved automatically.

## 6. First import

1. On the product page, click the launcher button or the extension icon — the
   panel **stays open** while you browse (switch pages or sites without it
   closing; navigating to a new page reopens it automatically)
2. The panel **scans the page** — title / price / description candidates load
   (best one pre-selected), and up to 50 images appear in a gallery
3. Tap a different candidate or edit the text if needed; the price can be in any
   currency (`¥`, `$`, `₽`, …) — bare numbers are treated as **yuan (¥)**
4. Click images to include them (green check); or **Barchasi**
5. Pick **Kategoriyalar**, **Ranglar** (color swatches), **O'lchamlar** from
   the backend list
6. Optionally fill **Chegirma %** (0–100)
7. Press **Mahsulotni qo'shish** (or `⌘/Ctrl + Enter`)

Before sending, the extension **auto-translates** the name/description to
**uz, ru, en**, converts the price to **so'm** (live rate) and adds **+20%**.
You can see the final price live under the price field ("Yakuniy narx: ≈ … so'm").

The backend receives `POST {apiUrl}/api/product`.

> Nothing closes mid-flow — the panel stays open until you import, and moving
> to a new product page clears the page fields (keeping category/color/size
> picks) and reloads the new page's candidates automatically.

## Updating

Rebuild and click the refresh (↻) button on the extension card in
`chrome://extensions`, or remove and **Load unpacked** again.

## Server side notes

- The catalog endpoints (`GET /api/product/categories|sizes|colors`) are
  public; creating a product requires the admin JWT (obtained automatically).
- The server's CORS allowlist already accepts `chrome-extension://` origins, so
  panel fetches (login, catalog, create) work out of the box.
