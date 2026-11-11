const RESTRICTED_PREFIXES = [
  "chrome://",
  "chrome-extension://",
  "edge://",
  "about:",
  "chrome-search://",
  "devtools://",
  "view-source:",
  "file://",
];

export function isRestrictedUrl(url: string): boolean {
  return RESTRICTED_PREFIXES.some((prefix) => url.startsWith(prefix));
}

export function isHttpUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

export function getHostname(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}

export function toAbsoluteUrl(href: string, baseUrl: string): string | null {
  if (!href) return null;
  if (href.startsWith("data:")) return null;
  if (href.startsWith("blob:")) return null;
  try {
    return new URL(href, baseUrl).href;
  } catch {
    return null;
  }
}

export function stripFragment(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.hash = "";
    return parsed.href;
  } catch {
    return url;
  }
}

export function isSameOrigin(a: string, b: string): boolean {
  try {
    return new URL(a).origin === new URL(b).origin;
  } catch {
    return false;
  }
}
