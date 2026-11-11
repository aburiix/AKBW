import { ApiError } from "@/utils/errors";
import {
  DEFAULT_SOURCE_CURRENCY,
  EXCHANGE_API_BASE,
  EXCHANGE_RATE_TTL_MS,
  PRICE_MARKUP_PERCENT,
  TARGET_CURRENCY,
} from "@/constants";
import { storage } from "@/storage";

export type SourceCurrency =
  | "CNY"
  | "USD"
  | "RUB"
  | "EUR"
  | "GBP"
  | "KZT"
  | "UZS";

const CURRENCY_PATTERNS: Array<{
  currency: SourceCurrency;
  pattern: RegExp;
}> = [
  { currency: "UZS", pattern: /\b(uzs|so[’']?m|сўм|сум)\b/i },
  { currency: "CNY", pattern: /(cn¥|¥|cny|元|rmb)/i },
  { currency: "USD", pattern: /\$|usd|dollar/i },
  { currency: "EUR", pattern: /€|eur|euro/i },
  { currency: "GBP", pattern: /£|gbp|sterling/i },
  { currency: "RUB", pattern: /₽|rub|руб/i },
  { currency: "KZT", pattern: /₸|kzt|тенге/i },
];

/** Guess the source currency from the entered price text (defaults to CNY). */
export function detectCurrency(raw: string): SourceCurrency {
  for (const { currency, pattern } of CURRENCY_PATTERNS) {
    if (pattern.test(raw)) return currency;
  }
  return DEFAULT_SOURCE_CURRENCY;
}

async function getUzsRate(base: SourceCurrency): Promise<number> {
  const cached = await storage.getExchangeRates();
  const now = Date.now();
  if (
    cached &&
    cached.base === base &&
    now - cached.updatedAt < EXCHANGE_RATE_TTL_MS
  ) {
    return cached.uzs;
  }

  const url = `${EXCHANGE_API_BASE}/${encodeURIComponent(base)}`;
  let response: Response;
  try {
    response = await fetch(url);
  } catch {
    if (cached && cached.base === base) return cached.uzs;
    throw new ApiError(
      "NO_INTERNET",
      `Valyuta kursini yuklashda xatolik (${base} → ${TARGET_CURRENCY}). Internetni tekshirib qayta urinib ko'ring.`,
    );
  }

  if (!response.ok) {
    if (cached && cached.base === base) return cached.uzs;
    throw new ApiError(
      "HTTP",
      `Valyuta kursi xizmati xatolik qaytardi (HTTP ${response.status}).`,
      response.status,
    );
  }

  let body: { rates?: Record<string, number> };
  try {
    body = (await response.json()) as { rates?: Record<string, number> };
  } catch {
    throw new ApiError(
      "INVALID_RESPONSE",
      "Valyuta kursi xizmatidan noto'g'ri javob keldi.",
    );
  }

  const uzs = body?.rates?.[TARGET_CURRENCY];
  if (typeof uzs !== "number" || !Number.isFinite(uzs) || uzs <= 0) {
    throw new ApiError(
      "INVALID_RESPONSE",
      `Valyuta kursi xizmatidan ${TARGET_CURRENCY} kursi topilmadi.`,
    );
  }

  await storage.setExchangeRates({ base, uzs, updatedAt: now });
  return uzs;
}

/** Convert an amount to UZS (whole so'm), fetching/caching the rate. */
export async function convertToUzs(
  amount: number,
  base: SourceCurrency,
): Promise<number> {
  if (base === "UZS") return Math.round(amount);
  const rate = await getUzsRate(base);
  return Math.round(amount * rate);
}

/** Add the configured markup (%) on top of the converted amount. */
export function applyMarkup(
  uzsAmount: number,
  percent: number = PRICE_MARKUP_PERCENT,
): number {
  return Math.round((uzsAmount * (100 + percent)) / 100);
}

export function formatSom(amount: number): string {
  return amount.toLocaleString("uz-UZ");
}
