import type { Catalog, CategoryNode, CatalogItem, ImportPayload } from "@/types/product";
import type { AppSettings } from "@/types/settings";
import { ApiError } from "@/utils/errors";
import { ADMIN_CREDENTIALS } from "@/env";
import { storage } from "@/storage";
import { ADMIN_LOGIN_ENDPOINT, CATALOG_ENDPOINTS, IMPORT_TIMEOUT_MS, PRODUCT_ENDPOINT } from "@/constants";

export interface ImportResult {
  ok: boolean;
  message?: string;
  data?: unknown;
}

function parseErrorMessage(body: unknown, fallback: string): string {
  if (body && typeof body === "object") {
    const record = body as Record<string, unknown>;
    if (typeof record.message === "string") return record.message;
    if (record.error && typeof record.error === "object") {
      const error = record.error as Record<string, unknown>;
      if (typeof error.message === "string") return error.message;
    }
  }
  return fallback;
}

async function request(
  baseUrl: string,
  path: string,
  init: RequestInit = {},
): Promise<unknown> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), IMPORT_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      ...init,
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError("TIMEOUT", "", undefined);
    }
    throw new ApiError("NO_INTERNET", "", undefined);
  } finally {
    clearTimeout(timeoutId);
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new ApiError("INVALID_RESPONSE", "", response.status);
  }

  if (!response.ok) {
    const message = parseErrorMessage(
      body,
      `Server xatolik qaytardi (HTTP ${response.status})`,
    );
    throw new ApiError("HTTP", message, response.status);
  }

  return body;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object") {
    return value as Record<string, unknown>;
  }
  return null;
}

function normalizeItems(body: unknown): CatalogItem[] {
  if (!Array.isArray(body)) return [];
  const items: CatalogItem[] = [];
  for (const entry of body) {
    const record = asRecord(entry);
    if (record && typeof record.id === "number") {
      items.push({ id: record.id, name: String(record.name ?? "") });
    }
  }
  return items;
}

function normalizeCategories(body: unknown): CategoryNode[] {
  if (!Array.isArray(body)) return [];
  const map = new Map<number, CategoryNode>();
  for (const entry of body) {
    const record = asRecord(entry);
    if (!record || typeof record.id !== "number") continue;
    map.set(record.id, {
      id: record.id,
      name: String(record.name ?? ""),
      parentId:
        typeof record.parentId === "number" ? record.parentId : null,
      children: [],
    });
  }
  const roots: CategoryNode[] = [];
  for (const node of map.values()) {
    const parent = node.parentId !== null ? map.get(node.parentId) : undefined;
    if (parent) {
      parent.children!.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

export async function fetchCatalog(settings: AppSettings): Promise<Catalog> {
  const baseUrl = settings.backendUrl.trim().replace(/\/+$/, "");
  if (!baseUrl) {
    throw new ApiError("NOT_CONFIGURED", "", undefined);
  }

  const headers = { "Accept-Language": settings.language };
  const [categories, sizes, colors] = await Promise.all([
    request(baseUrl, CATALOG_ENDPOINTS.categories, { headers }),
    request(baseUrl, CATALOG_ENDPOINTS.sizes, { headers }),
    request(baseUrl, CATALOG_ENDPOINTS.colors, { headers }),
  ]);

  return {
    categories: normalizeCategories(categories),
    sizes: normalizeItems(sizes),
    colors: normalizeItems(colors),
  };
}

export async function createProduct(
  payload: ImportPayload,
  settings: AppSettings,
  token?: string,
): Promise<ImportResult> {
  const baseUrl = settings.backendUrl.trim().replace(/\/+$/, "");
  if (!baseUrl) {
    throw new ApiError("NOT_CONFIGURED", "", undefined);
  }

  const body = await request(baseUrl, PRODUCT_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept-Language": settings.language,
      ...(token && token.trim()
        ? { Authorization: `Bearer ${token.trim()}` }
        : {}),
    },
    body: JSON.stringify(payload),
  });

  return {
    ok: true,
    message: parseErrorMessage(body, "Mahsulot muvaffaqiyatli qo'shildi"),
    data: body,
  };
}

/** POST /api/admin/login and return the JWT. */
export async function adminLogin(
  baseUrl: string,
  phone: string,
  password: string,
): Promise<string> {
  const body = await request(baseUrl, ADMIN_LOGIN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, password }),
  });

  const record = asRecord(body);
  const token = record?.token;
  if (typeof token !== "string" || token.trim() === "") {
    throw new ApiError(
      "INVALID_RESPONSE",
      "Login so'rovi muvaffaqiyatli bo'ldi, ammo javobda token topilmadi.",
    );
  }
  return token.trim();
}

/**
 * Resolve an authorization token for import requests:
 * 1. manually entered JWT in Settings wins;
 * 2. otherwise the last auto-login token is reused;
 * 3. otherwise the extension logs in with ADMIN_LOGIN/ADMIN_PASSWORD (.env).
 */
export async function ensureAuthToken(
  settings: AppSettings,
  force = false,
): Promise<string> {
  const manual = settings.token.trim();
  if (manual) return manual;

  if (!force) {
    const cached = await storage.getAuthToken();
    if (cached.trim()) return cached.trim();
  }

  const baseUrl = settings.backendUrl.trim().replace(/\/+$/, "");
  if (!baseUrl) {
    throw new ApiError("NOT_CONFIGURED", "", undefined);
  }

  const { login, password } = ADMIN_CREDENTIALS;
  if (!login.trim() || !password.trim()) {
    throw new ApiError(
      "NOT_CONFIGURED",
      "JWT token kiritilmagan va ADMIN_LOGIN/ADMIN_PASSWORD (.env) to'ldirilmagan. Sozlamalarda tokenni kiriting yoki .env faylini to'ldiring.",
      undefined,
    );
  }

  const token = await adminLogin(baseUrl, login.trim(), password);
  await storage.setAuthToken(token);
  return token;
}
