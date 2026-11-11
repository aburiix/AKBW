import type { AppSettings } from "@/types/settings";

export const APP_NAME = "AKBW Importer";
export const APP_VERSION = "0.1.0";

export const PRODUCT_ENDPOINT = "/api/product";
export const CATALOG_ENDPOINTS = {
  categories: "/api/product/categories",
  sizes: "/api/product/sizes",
  colors: "/api/product/colors",
} as const;

export const ADMIN_LOGIN_ENDPOINT = "/api/admin/login";

/** Free exchange-rate API (updates daily, CORS-enabled). */
export const EXCHANGE_API_BASE = "https://open.er-api.com/v6/latest";
/** How long a fetched exchange rate stays valid in storage. */
export const EXCHANGE_RATE_TTL_MS = 24 * 60 * 60 * 1000;

/** Target currency the panel reports the final price in. */
export const TARGET_CURRENCY = "UZS";
/** Assumed source currency when the entered price has no symbol/code. */
export const DEFAULT_SOURCE_CURRENCY = "CNY";
/** Markup added on top of the converted price when creating the product. */
export const PRICE_MARKUP_PERCENT = 20;

export const DEFAULT_SETTINGS: AppSettings = {
  backendUrl: "https://api.akbw.uz",
  token: "",
  language: "uz",
  clearAfterImport: true,
  rememberSelections: true,
  darkMode: "system",
};

export const LANGUAGE_OPTIONS = [
  { value: "uz", label: "O'zbek" },
  { value: "ru", label: "Русский" },
  { value: "en", label: "English" },
] as const;

export const DARK_MODE_OPTIONS = [
  { value: "system", label: "Tizim" },
  { value: "light", label: "Yorug'" },
  { value: "dark", label: "Qorong'i" },
] as const;

export const IMPORT_TIMEOUT_MS = 60_000;
export const MAX_HISTORY = 50;
export const MAX_PREVIEW_TEXT = 260;

export const IMAGE_FILTER = {
  minDimension: 60,
};

export const MAX_IMAGE_CANDIDATES = 50;
export const MAX_TEXT_CANDIDATES = {
  title: 6,
  price: 8,
  description: 6,
} as const;

/** Backend requires weight + volume; sensible defaults when unknown. */
export const WEIGHT_DEFAULT = 1;
export const VOLUME_DEFAULT = 10;

export const FIELD_LABELS = {
  title: "Mahsulot nomi",
  price: "Narxi",
  description: "Tavsif",
  images: "Rasmlar",
  categories: "Kategoriyalar",
  colors: "Ranglar",
  sizes: "O'lchamlar",
  discount: "Chegirma",
} as const;
