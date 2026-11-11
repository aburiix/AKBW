import type { ContentCommand, ContentResponse } from "@/types/messages";
import type { PageCandidates } from "@/types/product";

/** Ask a tab's content script whether it is injected (PING/PONG). */
export async function pingTab(tabId: number): Promise<boolean> {
  try {
    const response = (await chrome.tabs.sendMessage(tabId, {
      type: "PING",
    })) as ContentResponse | undefined;
    return response?.type === "PONG";
  } catch {
    return false;
  }
}

export async function sendToTab(
  tabId: number,
  message: ContentCommand,
): Promise<ContentResponse | undefined> {
  try {
    return (await chrome.tabs.sendMessage(tabId, message)) as
      | ContentResponse
      | undefined;
  } catch {
    return undefined;
  }
}

/** Ask the background to extract candidates from the active tab. */
export async function runExtractCandidates(): Promise<PageCandidates | null> {
  try {
    const response = (await chrome.runtime.sendMessage({
      type: "EXTRACT_CANDIDATES",
    })) as ContentResponse | undefined;
    if (response && response.type === "EXTRACT_CANDIDATES_RESULT") {
      return response.candidates;
    }
  } catch {
    // fall through to null
  }
  return null;
}
