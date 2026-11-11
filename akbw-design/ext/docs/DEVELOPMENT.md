# Development Guide

## Stack

- **Manifest V3** — floating iframe panel + service worker + content script
- **Vite 7** — three isolated builds sharing the `@/*` → `src/*` alias
- **React 19 + TypeScript** — panel UI (strict mode, `verbatimModuleSyntax`)
- **Tailwind CSS v4** — via `@tailwindcss/vite`, class-based dark mode
- **Chrome APIs** — `storage`, `tabs`, `scripting`, `runtime`

## Project layout

```
popup.html                  # panel HTML entry (built to dist/popup.html, loaded in an iframe)
src/
  background/               # service worker entry (ES module build)
  content/                  # content script entry (IIFE build)
    panel.ts                # floating launcher button + iframe panel (show/hide/toggle, persistence)
    candidates.ts           # page scanning → PageCandidates
  popup/                    # React app (rendered in the floating panel): App.tsx + screens/ + styles.css
  components/               # shared UI components (incl. PanelCloseButton)
  hooks/                    # useCandidates, useCatalog, useProductData, useImport, …
  services/                 # messaging, api (login/catalog/create), translate
  storage/                  # typed chrome.storage.local wrapper
  types/                    # shared TS types (messages, product, …)
  utils/                    # text, url, currency, validate, image, errors
  constants/                # endpoints, defaults, limits
  env.ts                    # build-time ADMIN_CREDENTIALS (from .env)
public/manifest.json        # MV3 manifest (copied to dist/ as-is)
```

## Build-time env

- All three Vite configs use `envPrefix: ["ADMIN_", "VITE_"]`, so `ADMIN_LOGIN`
  and `ADMIN_PASSWORD` from `ext/.env` are statically inlined
  (`import.meta.env.ADMIN_LOGIN` — see `src/env.ts`). They end up in the
  bundle, so rebuild after changing `.env`.
- `ext/.env` is gitignored; commit `.env.example` instead.

## Scripts

| Script               | What it does                                             |
| -------------------- | -------------------------------------------------------- |
| `npm run dev`        | Watch-build **all three** bundles into `dist/`           |
| `npm run dev:popup`  | Browser dev server for the panel UI with HMR        |
| `npm run build`      | Clean + production build                                 |
| `npm run typecheck`  | `tsc --noEmit`                                           |
| `npm run lint`       | ESLint (flat config)                                     |

### Watch mode (recommended for extension work)

```bash
npm run dev
```

Builds `dist/` on every change. After the first build, load `dist/` in
`chrome://extensions`; on each rebuild click the refresh (↻) icon.

> Content-script and background changes require reloading the extension;
> panel changes are picked up on the next panel open.

### Panel-only UI work

```bash
npm run dev:popup
# open http://localhost:5173
```

The panel renders standalone in a browser tab (no Chrome APIs will work there,
so data flows are stubbed — mainly for layout/styling iteration).

## Build pipeline

Three Vite configs target the same `dist/` folder; `npm run build` cleans it
first so artifacts never collide:

1. `vite.config.content.ts` — **IIFE** bundle → `dist/content.js`
   (MV3 content scripts cannot be ES modules)
2. `vite.config.background.ts` — **ES module** → `dist/background.js`
   (manifest: `"type": "module"`)
3. `vite.config.popup.ts` — React app (panel UI), `base: "./"` (relative asset
   URLs) → `dist/popup.html` + `dist/assets/*`

`public/manifest.json` and `public/icons/` are copied by the popup build.

## Message protocol

```
Panel ──▶ Background ──▶ Content (chrome.tabs.sendMessage)
         EXTRACT_CANDIDATES  →  PING (liveness) / EXTRACT_CANDIDATES
         ◀── EXTRACT_CANDIDATES_RESULT { candidates }
         TOGGLE_PANEL (from action.onClicked) → SHOW_PANEL / HIDE_PANEL / TOGGLE_PANEL
```

- The background resolves the active tab, injects `content.js` via
  `chrome.scripting.executeScript` if a `PING` fails, then forwards
  `EXTRACT_CANDIDATES` and returns the result to the panel. Clicking the
  toolbar icon sends `TOGGLE_PANEL` to the active tab.
- The panel is a **floating iframe** (`popup.html`) injected by the content
  script (`src/content/panel.ts`), so it survives navigation and works in
  browsers that don't support `chrome.sidePanel` (e.g. Arc). The open state is
  kept in `chrome.storage.local` (`akbwPanelOpen`) — after navigating, the
  content script reopens the panel automatically. The launcher button
  (bottom-right) shows whenever the panel is hidden.
- `useActiveTab` listens to `tabs.onUpdated` / `tabs.onActivated` /
  `windows.onFocusChanged`, so switching pages re-queries the active tab,
  discards stale candidates, and re-scans the new page. Moving to a new page on
  the same site resets the page-specific fields but keeps category/color/size
  picks (see `useProductData`); nothing else is persisted mid-flow except the
  final selection and the panel-open flag (`chrome.storage.local`).
- The panel's ✕ button (`PanelCloseButton`) is rendered only when running
  inside the iframe (`window.self !== window.top`) and posts `AKBW_PANEL_CLOSE`
  to the host page, which hides the panel.

## How candidate extraction works

`src/content/candidates.ts` runs only when asked (no observers):

- **Title:** `document.title`, `og:title`/`twitter:title`, `[itemprop=name]`,
  top visible `h1`/`h2`, JSON-LD `Product.name`.
- **Price:** JSON-LD `offers.price`, `og:price:amount`, `twitter:data1`,
  `[itemprop=price]`, `[class*=price]` elements → normalized display strings
  (parsed to numbers at import time by `utils/text.ts: parsePrice`).
- **Description:** JSON-LD, `og:description`/meta description, `.description`
  blocks, longest paragraph.
- **Images:** `og:image`/`twitter:image`, JSON-LD images, all `<img>` with
  `data-src`/`data-original`/`srcset` fallbacks; eligibility + size filtering
  in `utils/image.ts`; deduped and sorted by natural size.

## Backend integration

- `src/services/api.ts` → `fetchCatalog()` (parallel `GET` for categories /
  sizes / colors with `Accept-Language`), `createProduct()` (`POST
  /api/product` with `Authorization: Bearer`), `adminLogin()` and
  `ensureAuthToken()`. Auth resolution order: manual Settings JWT → cached
  `authToken` → login with `ADMIN_CREDENTIALS` (`ext/.env`). On `401` the
  cached token is cleared and the import retries once after a fresh login.
- Weight/volume are backend-required but unknown on the page → constants
  `WEIGHT_DEFAULT` / `VOLUME_DEFAULT` in `src/constants`.

## Import pipeline (`hooks/useImport.ts`)

On **Mahsulotni qo'shish** the pipeline runs, in order:

1. **Translate** (`services/translate.ts`) — the entered title/description are
   translated to `uz`, `ru`, `en` via the free Google endpoint
   (`translate.googleapis.com/translate_a/single`, `sl=auto`); long text is
   chunked. A translation failure aborts the import with a clear error.
2. **Currency** (`utils/currency.ts`) — `detectCurrency()` reads the symbol
   (`¥`→CNY, `$`→USD, …; bare digits → CNY), `convertToUzs()` fetches the live
   rate from `open.er-api.com` (cached 24h in `exchangeRates`), then
   `applyMarkup()` adds `PRICE_MARKUP_PERCENT` (20%). Rounding to whole so'm.
3. **Validate** (`utils/validate.ts`) — mirrors the backend's
   `createProductSchema` (price, non-empty images/categories/sizes/colors, 3
   complete translations, weight/volume, discount 0–100, type).
4. **Send** — `ensureAuthToken()` → `createProduct()`, retrying once on `401`.

`MainView` shows the live final price under the price field via the same
conversion functions (its own `priceHint` effect).

## Adding a field

1. Extend `PageCandidates` + the scanner in `src/content/candidates.ts`.
2. Add a picker section in `src/popup/screens/MainView.tsx` (or a component).
3. If it maps to the backend, extend `ImportPayload` in `src/types/product.ts`,
   the `ImportDraft` in `useImport`, and the payload builder there.

## Quality gates

```bash
npm run typecheck   # strict TS
npm run lint        # ESLint
npm run build       # must emit all 3 bundles
```

Keep type-only imports (`import type …`), no unused locals, and keep the
content script dependency-light — it must not import React or the popup app.
