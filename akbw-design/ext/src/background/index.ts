import type { ContentResponse, PopupRequest } from "@/types/messages";
import type { PageCandidates } from "@/types/product";
import { pingTab, sendToTab } from "@/services/messaging";

const EMPTY_CANDIDATES: PageCandidates = {
  title: [],
  price: [],
  description: [],
  images: [],
};

chrome.action.onClicked.addListener(async (tab) => {
  if (typeof tab.id !== "number") return;
  await ensureContentScript(tab.id);
  await sendToTab(tab.id, { type: "TOGGLE_PANEL" });
});

async function getActiveTabId(): Promise<number | null> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab?.id ?? null;
}

async function ensureContentScript(tabId: number): Promise<void> {
  const alive = await pingTab(tabId);
  if (alive) return;
  await chrome.scripting.executeScript({
    target: { tabId },
    files: ["content.js"],
  });
}

async function handleExtractCandidates(): Promise<ContentResponse> {
  const tabId = await getActiveTabId();
  if (tabId === null) {
    return { type: "EXTRACT_CANDIDATES_RESULT", candidates: EMPTY_CANDIDATES };
  }
  await ensureContentScript(tabId);
  const response = await sendToTab(tabId, { type: "EXTRACT_CANDIDATES" });
  if (response && response.type === "EXTRACT_CANDIDATES_RESULT") return response;
  return { type: "EXTRACT_CANDIDATES_RESULT", candidates: EMPTY_CANDIDATES };
}

chrome.runtime.onMessage.addListener(
  (
    message: PopupRequest,
    _sender,
    sendResponse: (response?: unknown) => void,
  ) => {
    switch (message.type) {
      case "EXTRACT_CANDIDATES":
        void handleExtractCandidates()
          .then(sendResponse)
          .catch(() => {
            sendResponse({
              type: "EXTRACT_CANDIDATES_RESULT",
              candidates: EMPTY_CANDIDATES,
            } satisfies ContentResponse);
          });
        return true; // keep the channel open for the async response
      default:
        return false;
    }
  },
);
