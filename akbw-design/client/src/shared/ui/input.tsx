import * as React from 'react';

import { cn } from '@/shared/lib/utils';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'file:text-foreground placeholder:text-ivory/35 selection:bg-ivory selection:text-night flex h-12 w-full min-w-0 rounded-2xl border border-line-2 bg-ivory/[0.04] px-4 py-1 text-[15px] text-ivory transition-[color,background,border-color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 hover:border-ivory/30',
        'focus-visible:border-ivory/60 focus-visible:bg-ivory/[0.07] focus-visible:ring-4 focus-visible:ring-ivory/10',
        'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
        className,
      )}
      {...props}
    />
  );
}

export { Input };
