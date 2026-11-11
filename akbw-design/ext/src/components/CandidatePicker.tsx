import type { TextCandidate } from "@/types/product";
import { Icon } from "./Icon";

export interface CandidatePickerProps {
  candidates: TextCandidate[];
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  mono?: boolean;
  placeholder?: string;
  maxRows?: number;
  unit?: string;
}

export function CandidatePicker({
  candidates,
  value,
  onChange,
  multiline = false,
  mono = false,
  placeholder = "",
  maxRows = 6,
  unit,
}: CandidatePickerProps) {
  const inputClass = `w-full rounded-lg border border-zinc-200 bg-white px-2.5 py-2 text-[13px] text-zinc-900 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 ${
    mono ? "font-mono" : ""
  } ${unit ? "pr-8" : ""}`;

  return (
    <div className="space-y-2">
      {multiline ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={3}
          placeholder={placeholder}
          className={`${inputClass} resize-none leading-relaxed`}
        />
      ) : (
        <div className="relative">
          <input
            type="text"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            className={inputClass}
          />
          {unit && (
            <span className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-[13px] font-medium text-zinc-400 dark:text-zinc-500">
              {unit}
            </span>
          )}
        </div>
      )}

      {candidates.length > 0 && (
        <div className="max-h-40 space-y-1 overflow-y-auto pr-0.5">
          {candidates.slice(0, maxRows).map((candidate, index) => {
            const active = candidate.value === value;
            return (
              <button
                key={`${candidate.value}-${index}`}
                type="button"
                onClick={() => onChange(candidate.value)}
                className={`flex w-full items-center gap-2 rounded-lg border px-2 py-1.5 text-left transition-colors ${
                  active
                    ? "border-blue-500/60 bg-blue-50 dark:border-blue-500/40 dark:bg-blue-500/10"
                    : "border-zinc-200 bg-zinc-50 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800/60 dark:hover:border-zinc-600"
                }`}
              >
                <span
                  className={`min-w-0 flex-1 truncate text-[12px] ${
                    mono ? "font-mono" : ""
                  } ${active ? "font-medium text-blue-700 dark:text-blue-300" : "text-zinc-700 dark:text-zinc-300"}`}
                >
                  {candidate.value}
                </span>
                <span className="shrink-0 text-[10px] text-zinc-400 dark:text-zinc-500">
                  {candidate.source}
                </span>
                {active && <Icon name="check" size={12} className="shrink-0 text-blue-500" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
