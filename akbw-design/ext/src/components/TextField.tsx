import { useState, type InputHTMLAttributes } from "react";
import { Icon } from "./Icon";

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  icon?: "server" | "key" | "link";
  mono?: boolean;
}

export function TextField({
  label,
  hint,
  icon,
  mono = false,
  type = "text",
  className = "",
  ...props
}: TextFieldProps) {
  const [revealed, setRevealed] = useState(false);
  const isSecret = type === "password";

  return (
    <label className="block">
      {label && (
        <span className="mb-1.5 block text-[13px] font-medium text-zinc-700 dark:text-zinc-200">
          {label}
        </span>
      )}
      <span className="relative block">
        {icon && (
          <Icon
            name={icon}
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
          />
        )}
        <input
          type={isSecret && revealed ? "text" : type}
          spellCheck={false}
          autoComplete="off"
          className={`h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 text-[13px] text-zinc-900 shadow-sm transition-colors placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500 ${
            icon ? "pl-9" : ""
          } ${isSecret ? "pr-9" : ""} ${mono ? "font-mono text-xs" : ""} ${className}`}
          {...props}
        />
        {isSecret && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setRevealed((value) => !value)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            aria-label={revealed ? "Yashirish" : "Ko'rsatish"}
          >
            <Icon name={revealed ? "eye-off" : "eye"} size={14} />
          </button>
        )}
      </span>
      {hint && (
        <span className="mt-1 block text-xs leading-snug text-zinc-500 dark:text-zinc-400">
          {hint}
        </span>
      )}
    </label>
  );
}
