import { ApiError } from "@/utils/errors";

const GTX_URL = "https://translate.googleapis.com/translate_a/single";
/** Keep each request's query string well under the URL length limit. */
const MAX_CHUNK_LENGTH = 1500;
const MAX_CHUNKS = 8;

export const TARGET_LANGS = ["uz", "ru", "en"] as const;
export type TargetLang = (typeof TARGET_LANGS)[number];

function chunkText(text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  const sentences = trimmed.split(/(?<=[.!?…。．])\s+/u);
  const chunks: string[] = [];
  let current = "";
  for (const sentence of sentences) {
    const candidate = current ? `${current} ${sentence}` : sentence;
    if (candidate.length <= MAX_CHUNK_LENGTH) {
      current = candidate;
      continue;
    }
    if (current) {
      chunks.push(current);
      current = "";
    }
    for (let start = 0; start < sentence.length; start += MAX_CHUNK_LENGTH) {
      chunks.push(sentence.slice(start, start + MAX_CHUNK_LENGTH));
    }
  }
  if (current) chunks.push(current);
  return chunks.slice(0, MAX_CHUNKS);
}

async function translateChunk(chunk: string, target: TargetLang): Promise<string> {
  const url = `${GTX_URL}?client=gtx&sl=auto&tl=${target}&dt=t&q=${encodeURIComponent(
    chunk,
  )}`;
  let response: Response;
  try {
    response = await fetch(url);
  } catch {
    throw new ApiError(
      "NO_INTERNET",
      "Tarjima xizmatiga ulanishmadi. Internetni tekshirib qayta urinib ko'ring.",
    );
  }
  if (!response.ok) {
    throw new ApiError(
      "HTTP",
      `Tarjima xizmati xatolik qaytardi (HTTP ${response.status}). Qayta urinib ko'ring.`,
      response.status,
    );
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new ApiError(
      "INVALID_RESPONSE",
      "Tarjima xizmatidan noto'g'ri javob keldi. Qayta urinib ko'ring.",
    );
  }

  const rows = (data as Array<unknown> | null)?.[0];
  if (!Array.isArray(rows)) {
    throw new ApiError(
      "INVALID_RESPONSE",
      "Tarjima xizmatidan noto'g'ri javob keldi. Qayta urinib ko'ring.",
    );
  }
  return rows
    .map((row) => {
      const segment = Array.isArray(row) ? row[0] : null;
      return typeof segment === "string" ? segment : "";
    })
    .join("");
}

/** Translate free-form text into a target language (auto-detects source). */
export async function translateText(
  text: string,
  target: TargetLang,
): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed) return "";
  const chunks = chunkText(trimmed);
  const parts = await Promise.all(
    chunks.map((chunk) => translateChunk(chunk, target)),
  );
  return parts.join("").trim();
}

export interface LocalizedTranslation {
  name: string;
  description: string;
  lang: TargetLang;
}

/**
 * Translate the entered title + description into uz/ru/en. Runs all
 * translations in parallel; a failure aborts the whole import.
 */
export async function buildLocalizedTranslations(
  title: string,
  description: string,
): Promise<LocalizedTranslation[]> {
  const entries = await Promise.all(
    TARGET_LANGS.map(async (lang) => {
      const [name, desc] = await Promise.all([
        translateText(title, lang),
        translateText(description, lang),
      ]);
      return { name, description: desc, lang };
    }),
  );
  return entries;
}
