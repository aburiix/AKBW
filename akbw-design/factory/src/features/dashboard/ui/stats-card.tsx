import React from 'react';
import { Skeleton } from '@/shared/ui/skeleton';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  isLoading?: boolean;
  trend?: string;
  className?: string;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  isLoading,
  trend,
  className,
}: StatsCardProps) {
  if (isLoading) {
    return (
      <div className="p-8 bg-white rounded-[32px] border border-gray-100 shadow-sm space-y-4">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <div className={cn(
      "p-8 bg-white rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-black/5 transition-all duration-300",
      className
    )}>
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
            {title}
          </p>
          <h2 className="text-3xl font-black tracking-tight">{value}</h2>
          {trend && (
            <p className="text-[10px] font-bold text-green-500 uppercase tracking-widest">
              {trend}
            </p>
          )}
        </div>
        <div className="p-4 bg-gray-50 rounded-2xl">
          <Icon size={24} className="text-black" />
        </div>
      </div>
    </div>
  );
}
