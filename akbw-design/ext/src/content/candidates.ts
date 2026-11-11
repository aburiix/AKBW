import type { PageCandidates, TextCandidate } from "@/types/product";
import { cleanText } from "@/utils/text";
import { toAbsoluteUrl } from "@/utils/url";
import { isEligibleImageUrl } from "@/utils/image";
import { IMAGE_FILTER, MAX_IMAGE_CANDIDATES, MAX_TEXT_CANDIDATES } from "@/constants";

function isVisible(el: Element): boolean {
  if (el.tagName === "META" || el.tagName === "SCRIPT" || el.tagName === "STYLE") {
    return false;
  }
  const style = window.getComputedStyle(el);
  if (style.display === "none" || style.visibility === "hidden") return false;
  const rect = el.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

function jsonLdItems(): Array<Record<string, unknown>> {
  const items: Array<Record<string, unknown>> = [];
  for (const script of Array.from(
    document.querySelectorAll('script[type="application/ld+json"]'),
  )) {
    try {
      const parsed = JSON.parse(script.textContent || "null") as unknown;
      const candidates = Array.isArray(parsed) ? parsed : [parsed];
      for (const candidate of candidates) {
        if (!candidate || typeof candidate !== "object") continue;
        const record = candidate as Record<string, unknown>;
        items.push(record);
        if (Array.isArray(record["@graph"])) {
          for (const node of record["@graph"]) {
            if (node && typeof node === "object") {
              items.push(node as Record<string, unknown>);
            }
          }
        }
      }
    } catch {
      // skip malformed JSON-LD blocks
    }
  }
  return items;
}

function findProductLd(): Record<string, unknown> | null {
  for (const item of jsonLdItems()) {
    const type = item["@type"];
    const matches =
      type === "Product" ||
      (Array.isArray(type) && (type as string[]).includes("Product"));
    if (matches) return item;
  }
  return null;
}

function firstString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function collect(limit: number): {
  push: (value: string, source: string) => void;
  list: TextCandidate[];
} {
  const list: TextCandidate[] = [];
  const push = (value: string, source: string): void => {
    const cleaned = cleanText(value);
    if (!cleaned) return;
    if (list.some((candidate) => candidate.value === cleaned)) return;
    list.push({ value: cleaned, source });
  };
  return { push, list: list.slice(0, limit) };
}

function extractTitleCandidates(): TextCandidate[] {
  const { push, list } = collect(MAX_TEXT_CANDIDATES.title);

  const ld = findProductLd();
  if (ld) push(firstString(ld.name), "JSON-LD");

  for (const meta of Array.from(
    document.querySelectorAll(
      'meta[property="og:title"], meta[name="twitter:title"], meta[itemprop="name"]',
    ),
  )) {
    push(meta.getAttribute("content") || "", "meta");
  }

  for (const h1 of Array.from(document.querySelectorAll("h1")).slice(0, 3)) {
    if (isVisible(h1)) push(h1.innerText || "", "h1");
  }
  for (const h2 of Array.from(document.querySelectorAll("h2")).slice(0, 3)) {
    if (isVisible(h2)) push(h2.innerText || "", "h2");
  }

  if (document.title) push(document.title, "tab sarlavhasi");
  return list;
}

function extractPriceCandidates(): TextCandidate[] {
  const { push, list } = collect(MAX_TEXT_CANDIDATES.price);

  const ld = findProductLd();
  if (ld) {
    const offers = ld.offers as Record<string, unknown> | undefined;
    if (offers && typeof offers === "object") {
      push(firstString(offers.price, offers.lowPrice, offers.highPrice), "JSON-LD narx");
      const spec = offers.priceSpecification as Record<string, unknown> | undefined;
      if (spec && typeof spec === "object") {
        push(firstString(spec.price), "JSON-LD narx");
      }
    }
  }

  for (const meta of Array.from(
    document.querySelectorAll(
      'meta[property="og:price:amount"], meta[name="twitter:data1"], meta[itemprop="price"]',
    ),
  )) {
    const content = meta.getAttribute("content");
    if (content) push(content, "meta");
  }

  for (const el of Array.from(
    document.querySelectorAll(
      '[class*="price" i], [id*="price" i], [data-testid*="price" i], [itemprop="price"]',
    ),
  ).slice(0, 20)) {
    if (!isVisible(el)) continue;
    const text = cleanText((el as HTMLElement).innerText || el.textContent || "");
    if (!text || text.length > 60 || !/\d/.test(text)) continue;
    push(text, "element");
  }

  return list;
}

function extractDescriptionCandidates(): TextCandidate[] {
  const { push, list } = collect(MAX_TEXT_CANDIDATES.description);

  const ld = findProductLd();
  if (ld) push(firstString(ld.description), "JSON-LD");

  for (const meta of Array.from(
    document.querySelectorAll(
      'meta[property="og:description"], meta[name="description"], meta[name="twitter:description"]',
    ),
  )) {
    push(meta.getAttribute("content") || "", "meta");
  }

  for (const el of Array.from(
    document.querySelectorAll(
      '[class*="description" i], [class*="desc" i], [id*="description" i], [itemprop="description"]',
    ),
  ).slice(0, 10)) {
    if (!isVisible(el)) continue;
    push((el as HTMLElement).innerText || "", "element");
  }

  let best: { text: string; length: number } | null = null;
  for (const p of Array.from(document.querySelectorAll("p"))) {
    if (!isVisible(p)) continue;
    const text = cleanText(p.innerText || "");
    if (text.length >= 20 && text.length > (best?.length ?? 0)) {
      best = { text, length: text.length };
    }
  }
  if (best) push(best.text, "paragraf");

  return list;
}

function srcsetUrls(srcset: string): string[] {
  return srcset
    .split(",")
    .map((part) => part.trim().split(/\s+/)[0])
    .filter(Boolean);
}

function extractImageCandidates(): string[] {
  const ordered: string[] = [];
  const seen = new Set<string>();

  const push = (raw: string, requireEligible: boolean): void => {
    const absolute = raw ? toAbsoluteUrl(raw, location.href) : null;
    if (!absolute) return;
    if (absolute.startsWith("data:") || absolute.startsWith("blob:")) return;
    if (requireEligible && !isEligibleImageUrl(absolute)) return;
    if (seen.has(absolute)) return;
    seen.add(absolute);
    ordered.push(absolute);
  };

  for (const meta of Array.from(
    document.querySelectorAll(
      'meta[property="og:image"], meta[property="og:image:url"], meta[name="twitter:image"]',
    ),
  )) {
    push(meta.getAttribute("content") || "", false);
  }

  const ld = findProductLd();
  if (ld) {
    const image = ld.image;
    if (typeof image === "string") {
      push(image, false);
    } else if (Array.isArray(image)) {
      for (const entry of image) {
        push(typeof entry === "string" ? entry : firstString((entry as Record<string, unknown>)?.url), false);
      }
    }
  }

  const sized: Array<{ url: string; area: number }> = [];
  for (const img of Array.from(document.querySelectorAll("img"))) {
    if (img.closest("svg") || img.closest("canvas")) continue;
    if (img.width === 0 && img.height === 0) continue;

    const candidateUrls = [
      img.currentSrc || img.src,
      img.getAttribute("data-src"),
      img.getAttribute("data-original"),
      img.getAttribute("data-lazy-src"),
      ...srcsetUrls(img.srcset),
    ];

    let resolved = "";
    for (const candidate of candidateUrls) {
      if (!candidate) continue;
      const absolute = toAbsoluteUrl(candidate, location.href);
      if (absolute && isEligibleImageUrl(absolute)) {
        resolved = absolute;
        break;
      }
    }
    if (!resolved) continue;

    const naturalWidth = img.naturalWidth || img.width || 0;
    const naturalHeight = img.naturalHeight || img.height || 0;
    if (
      naturalWidth > 0 &&
      naturalHeight > 0 &&
      (naturalWidth < IMAGE_FILTER.minDimension ||
        naturalHeight < IMAGE_FILTER.minDimension)
    ) {
      continue;
    }
    sized.push({ url: resolved, area: naturalWidth * naturalHeight });
  }

  sized.sort((a, b) => b.area - a.area);
  for (const item of sized) {
    push(item.url, true);
  }

  return ordered.slice(0, MAX_IMAGE_CANDIDATES);
}

export function extractCandidates(): PageCandidates {
  return {
    title: extractTitleCandidates(),
    price: extractPriceCandidates(),
    description: extractDescriptionCandidates(),
    images: extractImageCandidates(),
  };
}
