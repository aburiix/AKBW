import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Icon, type IconName } from "./Icon";
import {
  ToastContext,
  type ToastContextValue,
  type ToastItem,
  type ToastType,
} from "@/hooks/useToasts";

const TOAST_STYLE: Record<ToastType, { icon: IconName; classes: string }> = {
  success: { icon: "check", classes: "text-emerald-600 dark:text-emerald-400" },
  error: { icon: "alert", classes: "text-red-600 dark:text-red-400" },
  warning: { icon: "alert", classes: "text-amber-600 dark:text-amber-400" },
  info: { icon: "info", classes: "text-blue-600 dark:text-blue-400" },
};

const TOAST_DURATION_MS = 4200;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef(new Map<string, number>());

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      window.clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const notify = useCallback(
    (type: ToastType, message: string) => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev.slice(-2), { id, type, message }]);
      const timer = window.setTimeout(() => dismiss(id), TOAST_DURATION_MS);
      timers.current.set(id, timer);
    },
    [dismiss],
  );

  const value = useMemo<ToastContextValue>(
    () => ({ toasts, notify, dismiss }),
    [toasts, notify, dismiss],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-3 z-50 flex flex-col items-center gap-2 px-4">
        {toasts.map((toast) => {
          const style = TOAST_STYLE[toast.type];
          return (
            <div
              key={toast.id}
              role="status"
              className="pointer-events-auto flex w-full max-w-[360px] items-start gap-2.5 rounded-xl border border-zinc-200 bg-white/95 px-3.5 py-2.5 shadow-lg shadow-zinc-900/5 backdrop-blur animate-toast-in dark:border-zinc-800 dark:bg-zinc-900/95"
            >
              <Icon
                name={style.icon}
                size={16}
                className={`mt-0.5 shrink-0 ${style.classes}`}
              />
              <p className="min-w-0 flex-1 text-[13px] leading-snug text-zinc-700 dark:text-zinc-200">
                {toast.message}
              </p>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                className="shrink-0 rounded p-0.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                aria-label="Yopish"
              >
                <Icon name="close" size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
