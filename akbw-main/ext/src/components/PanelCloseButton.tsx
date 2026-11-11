import { Icon } from "@/components/Icon";

const PANEL_CLOSE_EVENT = "AKBW_PANEL_CLOSE";

/**
 * Renders a close button only when the popup is embedded in the floating
 * iframe panel (a content-script-injected container). In the standalone
 * popup mode nothing is rendered.
 */
export function PanelCloseButton() {
  if (window.self !== window.top) {
    return (
      <button
        type="button"
        onClick={() => window.parent.postMessage(PANEL_CLOSE_EVENT, "*")}
        className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
        aria-label="Panelni yopish"
        title="Yopish"
      >
        <Icon name="close" size={16} />
      </button>
    );
  }
  return null;
}
