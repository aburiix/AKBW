export interface ProgressBarProps {
  value?: number | null;
  className?: string;
}

export function ProgressBar({ value = null, className = "" }: ProgressBarProps) {
  const indeterminate = value === null;
  return (
    <div
      className={`h-1 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800 ${className}`}
      role="progressbar"
      aria-valuenow={indeterminate ? undefined : value}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={`h-full rounded-full bg-blue-600 transition-[width] duration-300 ease-out ${
          indeterminate ? "animate-progress w-1/3" : ""
        }`}
        style={indeterminate ? undefined : { width: `${Math.max(0, Math.min(100, value ?? 0))}%` }}
      />
    </div>
  );
}
