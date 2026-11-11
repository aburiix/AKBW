import type { ProductData } from "@/types/product";
import type { AppSettings } from "@/types/settings";
import type { ImportHistoryEntry } from "@/types/product";
import { DEFAULT_SETTINGS } from "@/constants";

export const STORAGE_KEYS = {
  productData: "productData",
  settings: "settings",
  history: "history",
  authToken: "authToken",
  exchangeRates: "exchangeRates",
} as const;

export interface StoredExchangeRates {
  base: string;
  uzs: number;
  updatedAt: number;
}

export interface StorageMap {
  productData: ProductData;
  settings: AppSettings;
  history: ImportHistoryEntry[];
  authToken: string;
  exchangeRates: StoredExchangeRates | null;
}

export type StorageKey = keyof StorageMap;

export function emptyProductData(): ProductData {
  return {
    title: "",
    price: "",
    description: "",
    images: [],
    categoryIds: [],
    sizeIds: [],
    colorIds: [],
    discount: "",
    url: "",
    hostname: "",
    importedAt: new Date().toISOString(),
    language: DEFAULT_SETTINGS.language,
  };
}

async function getItem<K extends StorageKey>(
  key: K,
  fallback: StorageMap[K],
): Promise<StorageMap[K]> {
  const result = await chrome.storage.local.get(key);
  return (result[key] as StorageMap[K] | undefined) ?? fallback;
}

async function setItem<K extends StorageKey>(
  key: K,
  value: StorageMap[K],
): Promise<void> {
  await chrome.storage.local.set({ [key]: value });
}

export const storage = {
  getProductData: () => getItem(STORAGE_KEYS.productData, emptyProductData()),
  setProductData: (data: ProductData) =>
    setItem(STORAGE_KEYS.productData, data),
  updateProductData: (patch: Partial<ProductData>) =>
    getItem(STORAGE_KEYS.productData, emptyProductData()).then((current) =>
      setItem(STORAGE_KEYS.productData, { ...current, ...patch }),
    ),
  clearProductData: () =>
    setItem(STORAGE_KEYS.productData, emptyProductData()),

  getSettings: () => getItem(STORAGE_KEYS.settings, DEFAULT_SETTINGS),
  setSettings: (settings: AppSettings) =>
    setItem(STORAGE_KEYS.settings, settings),
  updateSettings: (patch: Partial<AppSettings>) =>
    getItem(STORAGE_KEYS.settings, DEFAULT_SETTINGS).then((current) =>
      setItem(STORAGE_KEYS.settings, { ...current, ...patch }),
    ),

  getHistory: () => getItem(STORAGE_KEYS.history, []),
  setHistory: (entries: ImportHistoryEntry[]) =>
    setItem(STORAGE_KEYS.history, entries),
  clearHistory: () => setItem(STORAGE_KEYS.history, []),

  getAuthToken: () => getItem(STORAGE_KEYS.authToken, ""),
  setAuthToken: (token: string) => setItem(STORAGE_KEYS.authToken, token),
  clearAuthToken: () => setItem(STORAGE_KEYS.authToken, ""),

  getExchangeRates: () => getItem(STORAGE_KEYS.exchangeRates, null),
  setExchangeRates: (rates: StoredExchangeRates) =>
    setItem(STORAGE_KEYS.exchangeRates, rates),
};

export type StorageChangeHandler = (
  changes: Record<string, chrome.storage.StorageChange>,
  areaName: "local" | "managed" | "session" | "sync",
) => void;

export function onStorageChanged(
  handler: StorageChangeHandler,
): () => void {
  const listener: StorageChangeHandler = (changes, areaName) => {
    handler(changes, areaName);
  };
  chrome.storage.onChanged.addListener(listener);
  return () => chrome.storage.onChanged.removeListener(listener);
}
