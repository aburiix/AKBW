import { useCallback, useEffect, useState } from "react";
import type { AppSettings } from "@/types/settings";
import type { Catalog } from "@/types/product";
import { fetchCatalog } from "@/services/api";
import { toErrorMessage } from "@/utils/errors";

const EMPTY: Catalog = { categories: [], sizes: [], colors: [] };

export function useCatalog(settings: AppSettings, loaded: boolean) {
  const [catalog, setCatalog] = useState<Catalog>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (): Promise<void> => {
    if (!settings.backendUrl.trim()) {
      setError("API URL sozlanmagan — sozlamalarni oching");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setCatalog(await fetchCatalog(settings));
    } catch (caught) {
      setError(toErrorMessage(caught));
    } finally {
      setLoading(false);
    }
  }, [settings]);

  useEffect(() => {
    if (loaded) void refresh();
  }, [loaded, refresh]);

  return { catalog, loading, error, refresh };
}
