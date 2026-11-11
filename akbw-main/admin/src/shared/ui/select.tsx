import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  containerClassName?: string;
  icon?: React.ReactNode;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, containerClassName, children, icon, ...props }, ref) => {
    return (
      <div className={cn('relative w-full flex items-center gap-3 group', containerClassName)}>
        <select
          className={cn(
            'w-full appearance-none rounded-2xl border border-gray-100 bg-white px-4 py-2 pr-10 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-black/5 disabled:cursor-not-allowed disabled:opacity-50 transition-all cursor-pointer hover:border-gray-200',
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 group-hover:translate-y-0.5 transition-transform duration-200">
          {icon || <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-black transition-colors" />}
        </div>
      </div>
    );
  }
);

Select.displayName = 'Select';

export { Select };
