import { useEffect, useState } from "react";
import type { ImportHistoryEntry } from "@/types/product";
import { Icon } from "@/components/Icon";
import { EmptyState } from "@/components/EmptyState";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { PanelCloseButton } from "@/components/PanelCloseButton";
import { useToasts } from "@/hooks/useToasts";
import { storage, onStorageChanged } from "@/storage";
import { truncate, timeAgo } from "@/utils/text";

interface HistoryViewProps {
  onBack: () => void;
}

export function HistoryView({ onBack }: HistoryViewProps) {
  const { notify } = useToasts();
  const [entries, setEntries] = useState<ImportHistoryEntry[]>([]);
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    let alive = true;
    void storage.getHistory().then((value) => {
      if (alive) setEntries(value);
    });
    const unsubscribe = onStorageChanged((changes) => {
      if (changes.history) {
        setEntries(changes.history.newValue as ImportHistoryEntry[]);
      }
    });
    return () => {
      alive = false;
      unsubscribe();
    };
  }, []);

  const handleClear = async (): Promise<void> => {
    await storage.clearHistory();
    setEntries([]);
    notify("success", "Import tarixi tozalandi.");
  };

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-2.5 py-2 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onBack}
            className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            aria-label="Orqaga"
          >
            <Icon name="back" size={16} />
          </button>
          <h2 className="text-[13px] font-semibold text-zinc-800 dark:text-zinc-100">
            Import tarixi
          </h2>
        </div>
        {entries.length > 0 && (
          <button
            type="button"
            onClick={() => setConfirmClear(true)}
            className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-red-500 dark:text-zinc-400 dark:hover:bg-zinc-800"
            aria-label="Tarixni tozalash"
          >
            <Icon name="trash" size={15} />
          </button>
        )}
        <PanelCloseButton />
      </header>

      <div className="flex-1 overflow-y-auto">
        {entries.length === 0 ? (
          <EmptyState
            icon="history"
            title="Hozircha tarix bo'sh"
            description="Import qilingan mahsulotlar shu yerda ko'rinadi."
          />
        ) : (
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {entries.map((entry) => (
              <li key={entry.id} className="flex items-center gap-3 px-3.5 py-2.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800">
                  {entry.image ? (
                    <img
                      src={entry.image}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <Icon name="box" size={16} className="text-zinc-400" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-zinc-800 dark:text-zinc-100">
                    {truncate(entry.title || "Nomsiz mahsulot", 60)}
                  </p>
                  <p className="truncate text-[11px] text-zinc-500 dark:text-zinc-400">
                    {entry.hostname || entry.url}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  {entry.price && (
                    <p className="text-[13px] font-semibold text-zinc-700 dark:text-zinc-200">
                      {entry.price}
                    </p>
                  )}
                  <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
                    {timeAgo(entry.importedAt)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ConfirmDialog
        open={confirmClear}
        title="Import tarixini tozalash?"
        description="Barcha tarix yozuvlari o'chiriladi."
        confirmLabel="Tozalash"
        danger
        onConfirm={() => void handleClear()}
        onClose={() => setConfirmClear(false)}
      />
    </div>
  );
}
