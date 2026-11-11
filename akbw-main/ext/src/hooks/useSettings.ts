import { useCallback, useEffect, useMemo, useState } from "react";
import type { AppSettings, DarkModePreference } from "@/types/settings";
import { storage, onStorageChanged } from "@/storage";
import { DEFAULT_SETTINGS } from "@/constants";

function applyTheme(mode: DarkModePreference): void {
  const dark =
    mode === "dark" ||
    (mode === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
}

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let alive = true;
    void storage.getSettings().then((value) => {
      if (!alive) return;
      setSettings(value);
      applyTheme(value.darkMode);
      setLoaded(true);
    });

    const unsubscribe = onStorageChanged((changes) => {
      if (!changes.settings) return;
      const next = changes.settings.newValue as AppSettings;
      setSettings(next);
      applyTheme(next.darkMode);
    });

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onMedia = (): void => {
      setSettings((prev) => {
        if (prev.darkMode === "system") applyTheme("system");
        return prev;
      });
    };
    media.addEventListener("change", onMedia);

    return () => {
      alive = false;
      unsubscribe();
      media.removeEventListener("change", onMedia);
    };
  }, []);

  const update = useCallback((patch: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      applyTheme(next.darkMode);
      void storage.setSettings(next);
      return next;
    });
  }, []);

  return useMemo(
    () => ({ settings, update, loaded }),
    [settings, update, loaded],
  );
}
