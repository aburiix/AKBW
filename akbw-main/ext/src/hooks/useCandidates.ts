import { useCallback, useEffect, useState } from "react";
import type { PageCandidates } from "@/types/product";
import { runExtractCandidates } from "@/services/messaging";
import type { ActiveTabInfo } from "./useActiveTab";

const EMPTY: PageCandidates = {
  title: [],
  price: [],
  description: [],
  images: [],
};

export function useCandidates(tab: ActiveTabInfo) {
  const [candidates, setCandidates] = useState<PageCandidates>(EMPTY);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (): Promise<void> => {
    if (!tab.isUsable || tab.tabId === null) {
      setCandidates(EMPTY);
      setUrl("");
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await runExtractCandidates();
      if (result) setCandidates(result);
      setUrl(tab.url);
    } catch {
      setError("Sahifadan ma'lumotlarni yuklab bo'lmadi.");
    } finally {
      setLoading(false);
    }
  }, [tab.isUsable, tab.tabId, tab.url]);

  useEffect(() => {
    if (url !== "" && url !== tab.url) {
      setCandidates(EMPTY);
      setUrl("");
    }
    void refresh();
  }, [refresh, url, tab.url]);

  return { candidates, url, loading, error, refresh };
}
