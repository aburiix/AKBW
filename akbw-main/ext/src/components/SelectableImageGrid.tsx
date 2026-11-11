import type { ReactNode } from "react";
import { Icon } from "./Icon";

export interface SelectableImageGridProps {
  images: string[];
  selected: string[];
  onToggle: (url: string) => void;
  maxVisible?: number;
  empty?: ReactNode;
}

export function SelectableImageGrid({
  images,
  selected,
  onToggle,
  maxVisible = 40,
  empty,
}: SelectableImageGridProps) {
  if (images.length === 0) {
    return (
      empty ?? (
        <p className="py-2 text-xs text-zinc-400 dark:text-zinc-500">
          Rasm topilmadi
        </p>
      )
    );
  }

  const visible = images.slice(0, maxVisible);
  const overflow = images.length - visible.length;

  return (
    <div>
      <div className="grid grid-cols-4 gap-2">
        {visible.map((src, index) => {
          const isSelected = selected.includes(src);
          return (
            <button
              key={`${src}-${index}`}
              type="button"
              onClick={() => onToggle(src)}
              className={`group relative aspect-square overflow-hidden rounded-lg border bg-zinc-100 transition-all dark:bg-zinc-800 ${
                isSelected
                  ? "border-blue-500 ring-2 ring-blue-500/40"
                  : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600"
              }`}
              aria-pressed={isSelected}
            >
              <img
                src={src}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover"
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
              />
              {isSelected && (
                <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm">
                  <Icon name="check" size={12} />
                </span>
              )}
            </button>
          );
        })}
        {overflow > 0 && (
          <div className="flex aspect-square items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-zinc-50 text-xs font-medium text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
            +{overflow}
          </div>
        )}
      </div>
      {overflow > 0 && (
        <p className="mt-1.5 text-[11px] text-zinc-400 dark:text-zinc-500">
          Faqat eng katta {maxVisible} ta rasm ko'rsatilmoqda
        </p>
      )}
    </div>
  );
}
