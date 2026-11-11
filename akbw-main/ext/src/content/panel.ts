const PANEL_LAUNCHER_ID = "akbw-panel-launcher";
const PANEL_CONTAINER_ID = "akbw-panel-container";
const PANEL_CLOSE_EVENT = "AKBW_PANEL_CLOSE";
const PANEL_OPEN_KEY = "akbwPanelOpen";

const MARGIN = 16;
const LAUNCHER_SIZE = 48;
const PANEL_WIDTH = 420;
const PANEL_MAX_HEIGHT = 620;
const TOP_Z = "2147483647";

let mounted = false;
let launcher: HTMLButtonElement | null = null;
let container: HTMLDivElement | null = null;
let frame: HTMLIFrameElement | null = null;

function addStyles(): void {
  const style = document.createElement("style");
  style.id = "akbw-panel-styles";
  style.textContent = `
    #${PANEL_LAUNCHER_ID} {
      transition: transform 0.15s ease, background-color 0.15s ease;
    }
    #${PANEL_LAUNCHER_ID}:hover {
      transform: scale(1.06);
      background-color: #27272a !important;
    }
    #${PANEL_LAUNCHER_ID}:active {
      transform: scale(0.96);
    }
  `;
  document.head.appendChild(style);
}

function createLauncher(): HTMLButtonElement {
  const button = document.createElement("button");
  button.id = PANEL_LAUNCHER_ID;
  button.type = "button";
  button.setAttribute("aria-label", "AKBW Importer panelini ochish");
  button.title = "AKBW Importer";
  button.innerHTML = `
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="m7 10 5 5 5-5" />
      <path d="M12 15V3" />
    </svg>
  `;
  Object.assign(button.style, {
    position: "fixed",
    right: `${MARGIN}px`,
    bottom: `${MARGIN}px`,
    width: `${LAUNCHER_SIZE}px`,
    height: `${LAUNCHER_SIZE}px`,
    borderRadius: "50%",
    border: "none",
    padding: "0",
    background: "#18181b",
    color: "#ffffff",
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.28)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: TOP_Z,
  });
  button.addEventListener("click", () => show());
  return button;
}

function syncSize(): void {
  if (!container) return;
  container.style.height = `${Math.min(
    PANEL_MAX_HEIGHT,
    window.innerHeight - MARGIN * 2,
  )}px`;
}

function createContainer(): HTMLDivElement {
  const container = document.createElement("div");
  container.id = PANEL_CONTAINER_ID;

  frame = document.createElement("iframe");
  frame.src = chrome.runtime.getURL("popup.html");
  frame.setAttribute("aria-label", "AKBW Importer paneli");
  frame.setAttribute("title", "AKBW Importer");
  Object.assign(frame.style, {
    width: "100%",
    height: "100%",
    border: "none",
    display: "block",
    background: "#ffffff",
  });

  Object.assign(container.style, {
    position: "fixed",
    right: `${MARGIN}px`,
    bottom: `${MARGIN}px`,
    width: `${PANEL_WIDTH}px`,
    zIndex: TOP_Z,
    background: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 12px 40px rgba(0, 0, 0, 0.3)",
    overflow: "hidden",
  });

  container.appendChild(frame);
  return container;
}

function mount(): void {
  if (mounted) return;
  if (document.getElementById(PANEL_LAUNCHER_ID)) return;

  addStyles();
  const root = document.body ?? document.documentElement;

  launcher = createLauncher();
  container = createContainer();

  root.appendChild(launcher);
  root.appendChild(container);
  syncSize();

  mounted = true;
}

export function show(): void {
  mount();
  if (container) container.style.display = "block";
  if (launcher) launcher.style.display = "none";
  void chrome.storage.local.set({ [PANEL_OPEN_KEY]: true });
}

export function hide(): void {
  mount();
  if (container) container.style.display = "none";
  if (launcher) launcher.style.display = "flex";
  void chrome.storage.local.set({ [PANEL_OPEN_KEY]: false });
}

export function toggle(): void {
  if (container && container.style.display !== "none") {
    hide();
  } else {
    show();
  }
}

export async function initPanel(): Promise<void> {
  mount();
  window.addEventListener("message", (event) => {
    if (event.data === PANEL_CLOSE_EVENT) hide();
  });
  window.addEventListener("resize", syncSize);

  const stored = await chrome.storage.local.get(PANEL_OPEN_KEY);
  if (stored.akbwPanelOpen === true) {
    show();
  } else {
    hide();
  }
}
