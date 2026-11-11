import type { ReactNode } from "react";
import { Icon } from "./Icon";

export interface ImageGridProps {
  images: string[];
  onRemove?: (index: number) => void;
  maxVisible?: number;
  empty?: ReactNode;
}

export function ImageGrid({
  images,
  onRemove,
  maxVisible = 8,
  empty,
}: ImageGridProps) {
  if (images.length === 0) {
    return empty ?? null;
  }

  const visible = images.slice(0, maxVisible);
  const overflow = images.length - visible.length;

  return (
    <div className="grid grid-cols-4 gap-2">
      {visible.map((src, index) => (
        <div
          key={`${src}-${index}`}
          className="group relative aspect-square overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800"
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
          {onRemove && (
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="absolute right-1 top-1 rounded-md bg-zinc-900/70 p-1 text-white opacity-0 transition-opacity hover:bg-red-600 focus:opacity-100 group-hover:opacity-100"
              aria-label="Rasmni olib tashlash"
            >
              <Icon name="close" size={12} />
            </button>
          )}
        </div>
      ))}
      {overflow > 0 && (
        <div className="flex aspect-square items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-zinc-50 text-xs font-medium text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
          +{overflow}
        </div>
      )}
    </div>
  );
}
