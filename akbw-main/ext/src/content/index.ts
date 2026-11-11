import type { ContentCommand, ContentResponse, ExtensionMessage } from "@/types/messages";
import { extractCandidates } from "./candidates";
import { initPanel, show, hide, toggle } from "./panel";

void initPanel();

chrome.runtime.onMessage.addListener(
  (
    message: ExtensionMessage,
    _sender,
    sendResponse: (response?: unknown) => void,
  ) => {
    switch ((message as ContentCommand).type) {
      case "PING":
        sendResponse({ type: "PONG" });
        return false;
      case "EXTRACT_CANDIDATES":
        sendResponse({
          type: "EXTRACT_CANDIDATES_RESULT",
          candidates: extractCandidates(),
        } satisfies ContentResponse);
        return false;
      case "SHOW_PANEL":
        show();
        return false;
      case "HIDE_PANEL":
        hide();
        return false;
      case "TOGGLE_PANEL":
        toggle();
        return false;
      default:
        return false;
    }
  },
);
