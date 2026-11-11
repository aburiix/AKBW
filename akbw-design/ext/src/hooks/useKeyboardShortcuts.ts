import { useEffect, useRef } from "react";

export interface KeyboardShortcutHandlers {
  onImport?: () => void;
  onClear?: () => void;
}

export function useKeyboardShortcuts(handlers: KeyboardShortcutHandlers): void {
  const ref = useRef(handlers);
  ref.current = handlers;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      const mod = event.metaKey || event.ctrlKey;
      if (mod && event.key === "Enter") {
        event.preventDefault();
        ref.current.onImport?.();
      } else if (mod && event.shiftKey && event.key.toLowerCase() === "c") {
        event.preventDefault();
        ref.current.onClear?.();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
}
