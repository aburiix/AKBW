import type { ImportPayload } from "@/types/product";

const PRODUCT_TYPES: ReadonlyArray<ImportPayload["type"]> = ["SELF", "FACTORY"];

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * Mirror of the backend's `createProductSchema` (Joi). Returns a list of
 * Uzbek error messages; an empty list means the payload is valid.
 */
export function validateImportPayload(payload: ImportPayload): string[] {
  const errors: string[] = [];

  if (!isFiniteNumber(payload.price) || payload.price <= 0) {
    errors.push("Narx (price) musbat son bo'lishi shart.");
  }

  if (
    !Array.isArray(payload.product_images) ||
    payload.product_images.length === 0 ||
    payload.product_images.some((url) => !isNonEmptyString(url))
  ) {
    errors.push("Kamida bitta rasm (product_images) kerak.");
  }

  const idFields: Array<{ key: keyof ImportPayload; label: string }> = [
    { key: "categories", label: "kategoriya" },
    { key: "sizes", label: "o'lcham" },
    { key: "colors", label: "rang" },
  ];
  for (const { key, label } of idFields) {
    const list = payload[key] as unknown;
    if (
      !Array.isArray(list) ||
      list.length === 0 ||
      list.some((id) => !isFiniteNumber(id))
    ) {
      errors.push(`Kamida bitta ${label} (${String(key)}) tanlangan bo'lishi shart.`);
    }
  }

  if (
    !Array.isArray(payload.translations) ||
    payload.translations.length === 0 ||
    payload.translations.some(
      (translation) =>
        typeof translation.name !== "string" ||
        typeof translation.description !== "string" ||
        typeof translation.lang !== "string",
    )
  ) {
    errors.push("Tarjimalar (translations) to'liq bo'lishi shart (name, description, lang).");
  }

  if (payload.discount !== undefined) {
    if (
      !isFiniteNumber(payload.discount) ||
      payload.discount < 0 ||
      payload.discount > 100
    ) {
      errors.push("Chegirma (discount) 0–100 orasida bo'lishi kerak.");
    }
  }

  if (!PRODUCT_TYPES.includes(payload.type)) {
    errors.push("Mahsulot turi (type) noto'g'ri.");
  }

  const volumeFields: Array<keyof ImportPayload> = [
    "weight",
    "volume_x",
    "volume_y",
    "volume_z",
  ];
  for (const key of volumeFields) {
    if (!isFiniteNumber(payload[key])) {
      errors.push(`${key} raqam bo'lishi shart.`);
    }
  }

  return errors;
}
