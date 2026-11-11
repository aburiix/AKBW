import { toAbsoluteUrl } from "./url";
import { IMAGE_FILTER } from "@/constants";

const NOISE_PATTERNS = [
  /logo/i,
  /icon/i,
  /avatar/i,
  /sprite/i,
  /pixel/i,
  /favicon/i,
  /emoji/i,
  /thumb\.(?:jpg|jpeg|png|webp)/i,
  /s\.(?:gif|png)/i,
  /transparent\.(?:png|gif)/i,
];

export function isSvgUrl(url: string): boolean {
  return /\.svg(?:\?|#|$)/i.test(url);
}

export function isEligibleImageUrl(url: string): boolean {
  if (!url) return false;
  if (!/^https?:/i.test(url)) return false;
  if (isSvgUrl(url)) return false;
  return !NOISE_PATTERNS.some((pattern) => pattern.test(url));
}

export function resolveImageUrl(
  img: HTMLImageElement,
  baseUrl: string,
): string | null {
  const src = img.currentSrc || img.src || "";
  if (!src) return null;
  if (src.startsWith("data:") || src.startsWith("blob:")) return null;
  const absolute = toAbsoluteUrl(src, baseUrl);
  if (!absolute) return null;
  return isEligibleImageUrl(absolute) ? absolute : null;
}

export function isEligibleImageElement(
  img: HTMLImageElement,
  baseUrl: string,
): boolean {
  if (img.closest("svg")) return false;
  if (img.closest("canvas")) return false;
  if (img.width === 0 && img.height === 0) return false;
  const naturalWidth = img.naturalWidth || img.width || 0;
  const naturalHeight = img.naturalHeight || img.height || 0;
  if (
    naturalWidth < IMAGE_FILTER.minDimension ||
    naturalHeight < IMAGE_FILTER.minDimension
  ) {
    return false;
  }
  return isEligibleImageUrl(resolveImageUrl(img, baseUrl) ?? "");
}

export function sortImagesBySize(imgs: HTMLImageElement[]): HTMLImageElement[] {
  return [...imgs].sort((a, b) => {
    const sizeA = (a.naturalWidth || 0) * (a.naturalHeight || 0);
    const sizeB = (b.naturalWidth || 0) * (b.naturalHeight || 0);
    return sizeB - sizeA;
  });
}

export function dedupeUrls(urls: string[]): string[] {
  return Array.from(new Set(urls));
}
