import type { PageCandidates } from "./product";

/** Messages sent from the popup to the background service worker. */
export type PopupRequest = { type: "EXTRACT_CANDIDATES" };

/** Messages sent from the background to a tab's content script. */
export type ContentCommand =
  | { type: "PING" }
  | { type: "EXTRACT_CANDIDATES" }
  | { type: "SHOW_PANEL" }
  | { type: "HIDE_PANEL" }
  | { type: "TOGGLE_PANEL" };

export type ContentResponse =
  | { type: "PONG" }
  | { type: "EXTRACT_CANDIDATES_RESULT"; candidates: PageCandidates };

export type ExtensionMessage = PopupRequest | ContentCommand | ContentResponse;
