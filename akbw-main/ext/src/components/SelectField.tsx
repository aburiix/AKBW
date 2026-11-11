import type { SelectHTMLAttributes } from "react";
import { Icon } from "./Icon";

export interface SelectFieldProps
  extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export function SelectField({
  label,
  className = "",
  children,
  ...props
}: SelectFieldProps) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1.5 block text-[13px] font-medium text-zinc-700 dark:text-zinc-200">
          {label}
        </span>
      )}
      <span className="relative block">
        <select
          className={`h-9 w-full appearance-none rounded-lg border border-zinc-200 bg-white px-3 pr-9 text-[13px] text-zinc-900 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 ${className}`}
          {...props}
        >
          {children}
        </select>
        <Icon
          name="chevron-right"
          size={14}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-zinc-400"
        />
      </span>
    </label>
  );
}
