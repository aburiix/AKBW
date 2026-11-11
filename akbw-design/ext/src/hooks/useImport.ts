import { useCallback, useEffect, useRef, useState } from "react";
import type { ImportPayload } from "@/types/product";
import type { AppSettings } from "@/types/settings";
import { createProduct, ensureAuthToken, type ImportResult } from "@/services/api";
import { buildLocalizedTranslations } from "@/services/translate";
import {
  applyMarkup,
  convertToUzs,
  detectCurrency,
} from "@/utils/currency";
import { validateImportPayload } from "@/utils/validate";
import { ApiError, toErrorMessage } from "@/utils/errors";
import { storage } from "@/storage";
import { parsePrice } from "@/utils/text";
import { VOLUME_DEFAULT, WEIGHT_DEFAULT } from "@/constants";

export type ImportStatus = "idle" | "loading" | "success" | "error";

export interface ImportState {
  status: ImportStatus;
  progress: number;
  message?: string;
}

/** Everything the import pipeline needs (before translation/currency). */
export interface ImportDraft {
  title: string;
  price: string;
  description: string;
  images: string[];
  categoryIds: number[];
  sizeIds: number[];
  colorIds: number[];
  discount?: number;
  url: string;
}

const INTERVAL_MS = 180;
const MAX_PROGRESS = 90;

export function useImport() {
  const [state, setState] = useState<ImportState>({ status: "idle", progress: 0 });
  const timer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearInterval(timer.current);
    },
    [],
  );

  const stopProgress = useCallback(() => {
    if (timer.current !== null) {
      window.clearInterval(timer.current);
      timer.current = null;
    }
  }, []);

  const start = useCallback(
    async (
      draft: ImportDraft,
      settings: AppSettings,
    ): Promise<ImportResult> => {
      setState({ status: "loading", progress: 8 });
      timer.current = window.setInterval(() => {
        setState((prev) =>
          prev.status === "loading"
            ? {
                ...prev,
                progress: Math.min(
                  prev.progress + (MAX_PROGRESS - prev.progress) * 0.12 + 1,
                  MAX_PROGRESS,
                ),
              }
            : prev,
        );
      }, INTERVAL_MS);

      try {
        const [translations, converted] = await Promise.all([
          buildLocalizedTranslations(draft.title, draft.description),
          convertToUzs(parsePrice(draft.price), detectCurrency(draft.price)),
        ]);
        const price = applyMarkup(converted);
        setState((prev) => ({ ...prev, progress: 55 }));

        const payload: ImportPayload = {
          price,
          product_images: draft.images,
          actual_product_link: draft.url,
          categories: draft.categoryIds,
          sizes: draft.sizeIds,
          colors: draft.colorIds,
          translations,
          weight: WEIGHT_DEFAULT,
          volume_x: VOLUME_DEFAULT,
          volume_y: VOLUME_DEFAULT,
          volume_z: VOLUME_DEFAULT,
          type: "SELF",
          ...(draft.discount !== undefined
            ? { discount: draft.discount }
            : {}),
        };

        const validationErrors = validateImportPayload(payload);
        if (validationErrors.length > 0) {
          throw new Error(
            `Ma'lumotlar noto'g'ri: ${validationErrors.join(" ")}`,
          );
        }

        let token = await ensureAuthToken(settings);
        let result: ImportResult;
        try {
          result = await createProduct(payload, settings, token);
        } catch (error) {
          if (error instanceof ApiError && error.status === 401) {
            await storage.clearAuthToken();
            token = await ensureAuthToken(settings, true);
            result = await createProduct(payload, settings, token);
          } else {
            throw error;
          }
        }

        stopProgress();
        setState({ status: "success", progress: 100 });
        return result;
      } catch (error) {
        stopProgress();
        const message = toErrorMessage(error);
        setState({ status: "error", progress: 100, message });
        throw new Error(message);
      }
    },
    [stopProgress],
  );

  const reset = useCallback(() => {
    stopProgress();
    setState({ status: "idle", progress: 0 });
  }, [stopProgress]);

  return { state, start, reset };
}
