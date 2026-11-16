import React from 'react';
import { cn } from '@/shared/lib/utils';

/** Buyurtma holatlari: o'zbekcha nom + brend rangi */
export const ORDER_STATE: Record<string, { label: string; cls: string; color: string }> = {
  PAID: { label: "To'langan", cls: 'text-ok bg-green-50', color: 'var(--ok)' },
  PENDING: { label: 'Kutilmoqda', cls: 'text-star bg-yellow-50', color: 'var(--star)' },
  REVIEW: { label: "Ko'rib chiqilmoqda", cls: 'text-info bg-blue-50', color: 'var(--info)' },
  SENT: { label: "Jo'natilgan", cls: 'text-info bg-blue-50', color: 'var(--info)' },
  CANCELLED: { label: 'Bekor qilingan', cls: 'text-sale bg-red-50', color: 'var(--sale)' },
  CALCELLED: { label: 'Bekor qilingan', cls: 'text-sale bg-red-50', color: 'var(--sale)' },
};
export const stateOf = (s: string) =>
  ORDER_STATE[s] || { label: s, cls: 'text-mute bg-s2', color: 'var(--mute2)' };

export function Pill({ state, className }: { state: string; className?: string }) {
  const st = stateOf(state);
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap',
        st.cls,
        className,
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {st.label}
    </span>
  );
}

