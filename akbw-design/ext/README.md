# AKBW Importer — Chrome Extension

Chrome Extension (Manifest V3) that lets an admin import products from **any**
e-commerce website into the AKBW backend.

The extension **automatically extracts** all candidate values from the page
(title, price, description, images) and presents them **inside a floating
panel** that stays open while you browse. The admin picks the right values
there — no clicking around the page. The admin also picks **categories, colors
and sizes** (loaded from the backend), then the product is created via
`POST /api/product`.

> UI tili: O'zbek. Backend default: `https://api.akbw.uz` (sozlamalardan
> o'zgartirish mumkin).

---

## Features

- **Persistent floating panel** — the content script injects a launcher button
  (bottom-right) on every page and an iframe panel (`popup.html`). It opens via
  the toolbar icon **or** the on-page button and **stays open across page
  navigation** — the panel reopens automatically after navigating (even in
  browsers like Arc that don't support `chrome.sidePanel`). Switching to a new
  product page clears the page-specific fields (name / price / description /
  images) and auto-loads the new page's candidates; category / color / size
  selections are kept.
- **Auto-extraction** — opening the panel scans the page and collects:
  - **Nomi:** `document.title`, `og:title`, `h1/h2`, `[itemprop=name]`, JSON-LD
  - **Narxi:** `og:price:amount`, JSON-LD `offers.price`, `[itemprop=price]`,
    `[class*=price]` elements (+ digit normalization). Shown in **yuan (¥)** —
    the number is sent to the backend as-is.
  - **Tavsif:** `og:description`, meta description, JSON-LD, `.description`,
    longest paragraph
  - **Rasmlar:** every `<img>` (+ `og:image`, JSON-LD, `data-src`/`srcset`
    lazy-load fallbacks), deduped, sorted by size, up to 50
- **Auto-login** — no need to paste a JWT. `ADMIN_LOGIN` / `ADMIN_PASSWORD` from
  `ext/.env` are baked in at build time; the extension calls `POST
  /api/admin/login` once, caches the token in `chrome.storage.local`, and
  re-logins automatically on `401`. A manually entered JWT in Settings
  overrides the auto-login.
- **Auto-translate** — whatever language the name / description are entered in
  (e.g. Chinese), they are translated to **uz, ru, en** before creating the
  product (free Google translate endpoint, auto-detects the source language).
- **Currency → UZS** — the price is automatically converted to **o'zbek so'mi**
  (live daily rate from `open.er-api.com`, 24h cache) and a **+20% markup** is
  applied before creating the product. The panel shows the live final price
  ("Yakuniy narx: ≈ … so'm"). Currency is detected from the symbol
  (`¥`→CNY, `$`→USD, `₽`→RUB, …); bare numbers default to **CNY**.
- **In-panel selection** — every field shows a candidate list with source
  tags; the best candidate is pre-filled and stays editable. Images are a
  multi-select gallery with "select all".
- **Backend catalog** — categories (nested), colors and sizes are fetched from
  the backend (`Accept-Language` localized) and multi-selected as checkboxes.
  Colors render as a **color swatch + friendly name** (Oq, Qora, Qizil, …)
  instead of raw hex codes.
- **Discount** — optional **Chegirma %** input (0–100); sent as `discount`
  when filled.
- **Import** — before sending, the payload is validated against the backend's
  `createProductSchema` (price, images, categories/sizes/colors, 3
  translations, weight/volume, discount, type). Then `POST {apiUrl}/api/product`
  with an admin JWT, typed error handling, progress bar, toasts, optional
  clear-after-import.
- **Settings** — backend URL, JWT token (optional), language,
  clear-after-import, remember selections, dark mode (system / light / dark).
- **Import history** — recent imports (capped at 50) with thumbnails.
- **Nice UX** — Linear/Raycast-style panel, dark mode, loading states,
  keyboard shortcuts (`⌘/Ctrl+Enter` import, `⌘/Ctrl+Shift+C` clear).

---

## Quick start

```bash
npm install
cp .env.example .env   # fill ADMIN_LOGIN (phone) + ADMIN_PASSWORD
npm run build          # produces dist/ (content.js, background.js, popup.html, manifest.json, icons)
```

1. Open `chrome://extensions`
2. Enable **Developer mode** (top-right)
3. Click **Load unpacked** and select the `dist/` folder
4. Open any product page — a small round **AKBW Importer** button appears at
   the bottom-right; click it (or the toolbar icon) to open the panel. The
   panel stays open while you browse
5. The panel fills itself with candidates — pick the values, images,
   categories / colors / sizes, optionally a discount, then **Mahsulotni qo'shish**

See [docs/INSTALLATION.md](docs/INSTALLATION.md) for details and
[docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) for the dev workflow.

---

## How it works

```
Floating panel (React in iframe) ──runtime.sendMessage──▶ Background (service worker)
                                          │  chrome.scripting fallback inject
                                          ▼
                                     chrome.tabs.sendMessage (PING / EXTRACT_CANDIDATES / TOGGLE_PANEL)
                                          ▼
                                   Content script (IIFE, ~8 KB)
                              injects launcher + iframe panel
                              scans page → PageCandidates
                                          │
                                          ▼
                 panel renders candidates; admin picks
                                          │
                 catalog: fetch GET /api/product/{categories,sizes,colors}
                                          │
                 import: POST /api/product (admin JWT)
```

The content script injects a **launcher button** and an iframe containing the
panel. The panel state (`akbwPanelOpen`) is kept in `chrome.storage.local`, so
after navigating the panel reopens automatically; the ✕ button (top-right of
each screen) posts `AKBW_PANEL_CLOSE` to hide it.

The panel reacts to navigation (`tabs.onUpdated` / `tabs.onActivated` /
`windows.onFocusChanged`): the active tab is re-queried, stale candidates are
discarded, and the new page is scanned automatically.

### Data model

```ts
interface ProductData {          // what the admin builds in the panel
  title: string;
  price: string;                 // as entered (¥/₽/$/…); converted to UZS on import
  description: string;
  images: string[];              // full image URLs
  categoryIds: number[];
  sizeIds: number[];
  colorIds: number[];
  discount: string;              // optional %, "0"–"100" or ""
  url: string; hostname: string; importedAt: string; language: string;
}

interface ImportPayload {        // sent to POST /api/product
  price: number;                 // UZS: round(entered × rate) + 20%
  product_images: string[];
  categories: number[];
  sizes: number[];
  colors: number[];
  translations: { name: string; description: string; lang: string }[];  // uz + ru + en (auto-translated)
  weight: number;                // default 1
  volume_x: number; volume_y: number; volume_z: number;  // default 10
  type: "SELF";
  discount?: number;             // sent only when the admin fills the field
}
```

---

## Folder structure

```
ext/
├─ popup.html                 # panel HTML entry (built to dist/popup.html, loaded in iframe)
├─ public/
│  ├─ manifest.json           # MV3 manifest
│  └─ icons/                  # 16/32/48/128 PNG
├─ src/
│  ├─ background/index.ts     # service worker: injects content, EXTRACT_CANDIDATES router, TOGGLE_PANEL
│  ├─ content/
│  │  ├─ index.ts             # message listener
│  │  ├─ panel.ts             # floating launcher + iframe panel (visibility, persistence)
│  │  └─ candidates.ts        # page scanning → title/price/description/images
│  ├─ components/             # UI (CandidatePicker, SelectableImageGrid, CheckboxList, …)
│  ├─ hooks/                  # useCandidates, useCatalog, useProductData, useImport, …
│  ├─ popup/                  # App, screens (Main/Settings/History), styles
│  ├─ services/               # api.ts (login/catalog/create), translate.ts, messaging.ts
│  ├─ storage/                # typed chrome.storage.local wrapper
│  ├─ types/                  # product, messages, settings
│  ├─ utils/                  # text, currency, validate, url, image, errors
│  └─ constants/              # endpoints, defaults, limits
├─ .env / .env.example        # ADMIN_LOGIN / ADMIN_PASSWORD (baked into the build)
├─ vite.config.{popup,content,background}.ts
├─ docs/                      # INSTALLATION / DEVELOPMENT / PACKAGING
└─ README.md
```

---

## Scripts

| Script                | Description                                        |
| --------------------- | -------------------------------------------------- |
| `npm run dev`         | Watch-build content + background + popup into `dist/` |
| `npm run dev:popup`   | Browser dev server for the popup (Hot reload)       |
| `npm run build`       | Clean + production build into `dist/`               |
| `npm run typecheck`   | `tsc --noEmit`                                      |
| `npm run lint`        | ESLint (flat config)                                |

---

## Backend contract

### Catalog (GET, no auth, `Accept-Language` header)

| Endpoint                          | Response                              |
| --------------------------------- | ------------------------------------- |
| `GET /api/product/categories`     | `[{id, name, parentId, children}]`    |
| `GET /api/product/sizes`          | `[{id, name}]`                        |
| `GET /api/product/colors`         | `[{id, name}]`                        |

### Create (POST, requires admin JWT)

```
POST /api/product
Authorization: Bearer <token>
Content-Type: application/json
Accept-Language: uz | ru | en
```

Payload as in the `ImportPayload` above. The backend validates that at least
one category / size / color exists and creates the product with localized
translations.

> `weight`/`volume_*` are required by the backend; the extension sends
> sensible defaults (1 kg, 10×10×10 cm) since they can't be extracted from
> the page.

---

## Configuration

Everything is stored in `chrome.storage.local`:

| Key              | Purpose                                        |
| ---------------- | ---------------------------------------------- |
| `productData`    | Current product selection for the active page  |
| `settings`       | Backend URL, token, language, toggles, theme   |
| `history`        | Recent imports (max 50)                        |
| `authToken`      | JWT obtained automatically via `/api/admin/login` |
| `exchangeRates`  | Cached UZS exchange rate (24h TTL)             |

`rememberSelections` scopes data per site: while the panel is open, moving to
a **different page on the same site** keeps your category / color / size picks
but resets the page-specific fields (name / price / description / images) and
auto-loads the new page's candidates. Moving to a **different site** resets
everything. Turning the toggle off also resets selections when you change
pages.

---

## Privacy

- Host permissions are `<all_urls>` — required to scan product pages and to
  `fetch()` the user-configured backend from the extension.
- Collected data is sent **only** to the backend URL configured in Settings.
- Selections and history stay in `chrome.storage.local` (never synced).

---

## Troubleshooting

- **"Bu sahifada tanlash imkonsiz"** — you're on a restricted page
  (`chrome://`, extension store, `file://`, …). Open a normal HTTP(S) page.
- **"Katalog yuklanmadi"** — the backend is unreachable, or CORS blocks the
  `chrome-extension://` origin. Point Settings → API URL at the right server
  and make sure the server's CORS allowlist permits extension origins.
- **No candidates** — the site uses unusual markup; edit the field manually
  or click refresh. Images may be lazy-loaded — scroll the page, then refresh.
- **"JWT token kiritilmagan …"** — `ext/.env` is empty. Fill
  `ADMIN_LOGIN` (phone) / `ADMIN_PASSWORD` and rebuild, or paste a JWT in
  Settings.
- **"Tarjima xizmatiga ulanishmadi"** — the free Google translate endpoint is
  unreachable/rate-limited; retry later.
- **Import fails with 401** — the auto-login credentials are wrong (check
  `.env`) or the manual JWT in Settings is invalid.
- **Panel doesn't open on icon click** — on Arc, the toolbar icon may not be
  actionable; use the on-page **launcher button** (bottom-right) instead. On
  Chrome/Edge reload the extension (`chrome://extensions` → refresh) after an
  update so the `action.onClicked` handler is registered.

---

## Future-ready

The architecture is set up for: AI auto-detection (replace/extend
`content/candidates.ts`), bulk import (loop `POST`),
image download/compression before upload, and cloud sync.
