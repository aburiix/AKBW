export function collapseWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export function cleanText(raw: string | null | undefined): string {
  if (!raw) return "";
  return collapseWhitespace(
    raw
      .replace(/\u00a0/g, " ")
      .replace(/\r\n?/g, "\n")
      .replace(/[\u200b\u200c\ufeff]/g, ""),
  );
}

export function truncate(value: string, max = 160): string {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1).trimEnd()}…`;
}

export function capitalize(value: string): string {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/**
 * Parse a human-readable price into a number.
 * Handles "1 234 567", "1.234,56", "12,999.00", "12'500" and bare digits.
 */
export function parsePrice(value: string): number {
  let cleaned = value
    .replace(/\s/g, "")
    .replace(/\u00a0/g, "")
    .replace(/'/g, "");
  const match = cleaned.match(/[\d.,]+/);
  if (!match) return 0;

  cleaned = match[0];
  if (cleaned.includes(".") && cleaned.includes(",")) {
    const lastDot = cleaned.lastIndexOf(".");
    const lastComma = cleaned.lastIndexOf(",");
    if (lastDot > lastComma) {
      cleaned = cleaned.replace(/,/g, "");
    } else {
      cleaned = cleaned.replace(/\./g, "").replace(",", ".");
    }
  } else if (cleaned.includes(",")) {
    const [integer, fraction] = cleaned.split(",");
    const decimal =
      fraction !== undefined && fraction.length > 0 && fraction.length <= 2;
    cleaned = decimal ? `${integer}.${fraction}` : `${integer}${fraction}`;
  }

  const parsed = Number(cleaned);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

export function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const seconds = Math.floor((Date.now() - then) / 1000);
  const formatter = new Intl.RelativeTimeFormat("uz", { numeric: "auto" });
  if (seconds < 60) return formatter.format(-seconds, "second");
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return formatter.format(-minutes, "minute");
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return formatter.format(-hours, "hour");
  const days = Math.floor(hours / 24);
  return formatter.format(-days, "day");
}
