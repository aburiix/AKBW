import type { ReactNode } from "react";
import { Badge } from "./Badge";

export interface SectionCardProps {
  title: string;
  description?: string;
  badge?: ReactNode;
  action?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
}

export function SectionCard({
  title,
  description,
  badge,
  action,
  children,
  footer,
}: SectionCardProps) {
  return (
    <section className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <header className="flex items-center justify-between gap-2 px-3.5 pt-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-[13px] font-semibold text-zinc-800 dark:text-zinc-100">
              {title}
            </h3>
            {badge}
          </div>
          {description && (
            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
              {description}
            </p>
          )}
        </div>
        {action}
      </header>
      <div className="px-3.5 pb-3 pt-2.5">{children}</div>
      {footer && (
        <footer className="border-t border-zinc-100 px-3.5 py-2 dark:border-zinc-800">
          {footer}
        </footer>
      )}
    </section>
  );
}

export function CardBadge({ selected }: { selected: boolean }) {
  return selected ? (
    <Badge tone="success" dot>
      Tanlangan
    </Badge>
  ) : (
    <Badge tone="neutral" dot>
      Tanlanmagan
    </Badge>
  );
}
