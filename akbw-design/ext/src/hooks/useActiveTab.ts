import { useEffect, useState } from "react";
import { getHostname, isRestrictedUrl } from "@/utils/url";

export interface ActiveTabInfo {
  tabId: number | null;
  url: string;
  hostname: string;
  isUsable: boolean;
}

const INITIAL: ActiveTabInfo = {
  tabId: null,
  url: "",
  hostname: "",
  isUsable: false,
};

const QUERY_DELAY_MS = 120;

export function useActiveTab(): ActiveTabInfo {
  const [info, setInfo] = useState<ActiveTabInfo>(INITIAL);

  useEffect(() => {
    let alive = true;
    let timeoutId = 0;

    const query = (): void => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        void chrome.tabs
          .query({ active: true, currentWindow: true })
          .then((tabs) => {
            if (!alive) return;
            const tab = tabs[0];
            const url = tab?.url ?? "";
            setInfo({
              tabId: tab?.id ?? null,
              url,
              hostname: getHostname(url),
              isUsable: Boolean(url) && !isRestrictedUrl(url),
            });
          })
          .catch(() => {
            if (alive) setInfo(INITIAL);
          });
      }, QUERY_DELAY_MS);
    };

    const onUpdated = (
      _tabId: number,
      changeInfo: chrome.tabs.TabChangeInfo,
    ): void => {
      if (changeInfo.status === "complete") query();
    };
    const onActivated = (): void => {
      query();
    };
    const onFocusChanged = (windowId: number): void => {
      if (windowId === chrome.windows.WINDOW_ID_NONE) return;
      query();
    };

    query();
    chrome.tabs.onUpdated.addListener(onUpdated);
    chrome.tabs.onActivated.addListener(onActivated);
    chrome.windows.onFocusChanged.addListener(onFocusChanged);

    return () => {
      alive = false;
      window.clearTimeout(timeoutId);
      chrome.tabs.onUpdated.removeListener(onUpdated);
      chrome.tabs.onActivated.removeListener(onActivated);
      chrome.windows.onFocusChanged.removeListener(onFocusChanged);
    };
  }, []);

  return info;
}
