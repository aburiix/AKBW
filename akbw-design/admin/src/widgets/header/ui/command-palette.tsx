'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search, ShoppingBag, Package, CornerDownLeft } from 'lucide-react';
import { useRouter } from '@/shared/config/i18n/navigation';
import { cn } from '@/shared/lib/utils';
import { useDebounce } from '@/shared/lib/hooks';
import { NAV_ITEMS } from '@/widgets/layout/model/nav';
import { useOrders } from '@/features/orders/lib/hooks';
import { useProducts } from '@/features/products/lib/hooks';
import type { IOrder } from '@/shared/config/api/order/order.model';

type Result = {
  key: string;
  group: string;
  title: string;
  sub?: string;
  icon: React.ElementType;
  href: string;
};

const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[ʻʼ'`‘’]/g, '')
    .trim();

export default function CommandPalette({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [idx, setIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dq = useDebounce(q, 300);

  const { data: ordersData } = useOrders();
  const searchProducts = open && dq.trim().length >= 2;
  const { data: productsData, isFetching } = useProducts(
    { page: 1, limit: 5, q: dq.trim() },
    searchProducts,
  );

  useEffect(() => {
    if (open) {
      setQ('');
      setIdx(0);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [open]);

  const results = useMemo<Result[]>(() => {
    const nq = norm(q);
    const pages: Result[] = NAV_ITEMS.filter(
      (i) =>
        !nq || norm(i.name).includes(nq) || norm(i.keywords || '').includes(nq),
    ).map((i) => ({
      key: 'p' + i.href,
      group: "Bo'limlar",
      title: i.name,
      icon: i.icon,
      href: i.href,
    }));

    if (!nq) return pages;

    const orders: Result[] = ((ordersData?.data || []) as IOrder[])
      .filter((o) => {
        const hay = norm(
          `${o.id} ${o.user?.name || ''} ${o.user?.lastName || ''} ${o.user?.phone || ''}`,
        );
        return hay.includes(nq.replace(/^#/, ''));
      })
      .slice(0, 5)
      .map((o) => ({
        key: 'o' + o.id,
        group: 'Buyurtmalar',
        title: `#${o.id} · ${o.user?.name || ''} ${o.user?.lastName || ''}`.trim(),
        sub: `${o.total_price.toLocaleString('ru-RU')} so'm · ${o.state}`,
        icon: ShoppingBag,
        href: `/orders?order=${o.id}`,
      }));

    const products: Result[] =
      dq.trim().length >= 2
        ? (productsData?.data || []).slice(0, 5).map((p) => ({
            key: 'm' + p.id,
            group: 'Mahsulotlar',
            title: p.name,
            sub: `${p.price.toLocaleString('ru-RU')} so'm`,
            icon: Package,
            href: `/products?view=${p.id}&q=${encodeURIComponent(p.name)}`,
          }))
        : [];

    return [...orders, ...products, ...pages];
  }, [q, dq, ordersData, productsData]);

  useEffect(() => setIdx(0), [q]);

  const go = (r?: Result) => {
    if (!r) return;
    onClose();
    router.push(r.href);
  };

  if (!open) return null;

  let lastGroup = '';
  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4"
      role="dialog"
      aria-label="Qidiruv"
    >
      <div
        className="absolute inset-0 bg-[rgb(0_0_0/0.5)] backdrop-blur-[3px]"
        onClick={onClose}
      />
      <div className="relative w-full max-w-[560px] bg-s1 border border-line2 rounded-[18px] overflow-hidden akbw-page-in">
        <div className="flex items-center gap-3 px-4 h-14 border-b border-line">
          <Search size={18} className="text-mute2" />
          <input
            ref={inputRef}
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setIdx((i) => Math.min(i + 1, results.length - 1));
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setIdx((i) => Math.max(i - 1, 0));
              } else if (e.key === 'Enter') {
                go(results[idx]);
              } else if (e.key === 'Escape') {
                onClose();
              }
            }}
            placeholder="Buyurtma ID, mijoz, telefon, mahsulot yoki bo'lim…"
            className="flex-1 bg-transparent outline-none text-[15px] text-ink"
          />
          {isFetching && searchProducts && (
            <span className="lbl">qidirilmoqda…</span>
          )}
          <kbd className="text-[11px] border border-line2 rounded px-1.5 py-0.5 text-mute2">
            Esc
          </kbd>
        </div>
        <div className="max-h-[52vh] overflow-y-auto p-2">
          {results.length === 0 && (
            <p className="text-center text-mute2 py-10 text-sm">
              Hech narsa topilmadi
            </p>
          )}
          {results.map((r, i) => {
            const showGroup = r.group !== lastGroup;
            lastGroup = r.group;
            const Icon = r.icon;
            return (
              <React.Fragment key={r.key}>
                {showGroup && (
                  <div className="lbl px-3 pt-3 pb-2">{r.group}</div>
                )}
                <button
                  onMouseEnter={() => setIdx(i)}
                  onClick={() => go(r)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-left cursor-pointer',
                    i === idx ? 'bg-s3 text-ink' : 'text-mute',
                  )}
                >
                  <Icon size={17} strokeWidth={1.6} className="shrink-0" />
                  <span className="flex-1 min-w-0">
                    <span className="block truncate text-[14px]">
                      {r.title}
                    </span>
                    {r.sub && (
                      <span className="block text-[12px] text-mute2 truncate">
                        {r.sub}
                      </span>
                    )}
                  </span>
                  {i === idx && (
                    <CornerDownLeft size={14} className="text-mute2" />
                  )}
                </button>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
