'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import {
  Bell,
  Menu,
  Moon,
  PanelLeft,
  Plus,
  Search,
  Sun,
  ShoppingBag,
  Headphones,
} from 'lucide-react';
import { Link, useRouter } from '@/shared/config/i18n/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { useAdminMe } from '../lib/hooks';
import { useBadges } from '@/widgets/layout/model/use-badges';
import CommandPalette from './command-palette';

type Props = {
  onBurger: () => void;
  onCollapse: () => void;
};

const iconBtn =
  'relative w-[38px] h-[38px] grid place-items-center rounded-[10px] text-mute border border-line hover:text-ink hover:border-line2 transition-colors cursor-pointer shrink-0';

const timeAgo = (d: string) => {
  const m = Math.max(1, Math.round((Date.now() - +new Date(d)) / 60000));
  if (m < 60) return `${m} daq oldin`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} soat oldin`;
  return `${Math.round(h / 24)} kun oldin`;
};

export default function Header({ onBurger, onCollapse }: Props) {
  const { data: admin, isError } = useAdminMe();
  const { resolvedTheme, setTheme } = useTheme();
  const router = useRouter();
  const badges = useBadges();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (isError) window.location.replace('/login');
  }, [isError]);

  // ⌘K / Ctrl+K — qidiruv
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const notifCount = badges.orders + badges.support;
  const isDark = mounted ? resolvedTheme === 'dark' : true;

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center gap-3 h-[60px] md:h-[68px] px-4 md:px-7 border-b border-line bg-[color-mix(in_srgb,var(--bg)_82%,transparent)] backdrop-blur-[14px]">
        <button className={`${iconBtn} md:hidden`} onClick={onBurger} aria-label="Menyu">
          <Menu size={18} strokeWidth={1.6} />
        </button>
        <button
          className={`${iconBtn} hidden md:grid`}
          onClick={onCollapse}
          aria-label="Yon panelni yig'ish"
          title="Yon panelni yig'ish"
        >
          <PanelLeft size={18} strokeWidth={1.6} />
        </button>

        <button
          onClick={() => setSearchOpen(true)}
          className="flex-1 max-w-[460px] min-w-0 flex items-center gap-2.5 h-[38px] px-3 rounded-[10px] bg-s1 border border-line text-mute2 hover:border-line2 cursor-pointer text-left"
        >
          <Search size={18} strokeWidth={1.6} className="shrink-0" />
          <span className="flex-1 truncate text-[14px]">
            Buyurtma, mijoz yoki mahsulot qidirish…
          </span>
          <kbd className="hidden sm:inline text-[11px] border border-line2 rounded px-1.5 py-0.5">
            ⌘K
          </kbd>
        </button>

        <div className="hidden sm:block flex-1" />

        <button
          className={iconBtn}
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
          aria-label="Mavzuni almashtirish"
          title={isDark ? 'Kunduzgi rejim' : 'Tungi rejim'}
        >
          {isDark ? <Sun size={18} strokeWidth={1.6} /> : <Moon size={18} strokeWidth={1.6} />}
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={iconBtn} aria-label="Bildirishnomalar">
              <Bell size={18} strokeWidth={1.6} />
              {notifCount > 0 && (
                <span className="absolute top-2 right-[9px] w-[7px] h-[7px] rounded-full bg-sale shadow-[0_0_0_2px_var(--bg)]" />
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-[340px] bg-s1 border-line2 rounded-[14px] p-2"
          >
            <div className="flex items-center justify-between px-2 pt-1 pb-2">
              <b className="text-sm font-semibold">E'tibor talab qiladi</b>
              <span className="lbl">{notifCount} ta</span>
            </div>
            {notifCount === 0 && (
              <p className="text-center text-mute2 text-sm py-6">
                Hammasi joyida ✓
              </p>
            )}
            {badges.pendingOrders.slice(0, 5).map((o) => (
              <DropdownMenuItem
                key={o.id}
                onClick={() => router.push(`/orders?order=${o.id}`)}
                className="gap-3 rounded-[10px] px-2 py-2 cursor-pointer"
              >
                <span className="w-8 h-8 rounded-full grid place-items-center bg-yellow-50 text-star shrink-0">
                  <ShoppingBag size={15} />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-[13px] truncate">
                    #{o.id} · {o.user?.name} — to'lov kutilmoqda
                  </span>
                  <span className="block text-[11.5px] text-mute2">
                    {o.total_price.toLocaleString('ru-RU')} so'm · {timeAgo(o.createdAt)}
                  </span>
                </span>
              </DropdownMenuItem>
            ))}
            {badges.support > 0 && (
              <DropdownMenuItem
                onClick={() => router.push('/support')}
                className="gap-3 rounded-[10px] px-2 py-2 cursor-pointer"
              >
                <span className="w-8 h-8 rounded-full grid place-items-center bg-blue-50 text-info shrink-0">
                  <Headphones size={15} />
                </span>
                <span className="flex-1 text-[13px]">
                  {badges.support} ta javobsiz murojaat
                </span>
              </DropdownMenuItem>
            )}
            {badges.orders > 5 && (
              <DropdownMenuItem
                onClick={() => router.push('/orders?status=PENDING')}
                className="justify-center rounded-[10px] py-2 text-star cursor-pointer text-[13px]"
              >
                Barcha kutilayotgan buyurtmalar ({badges.orders}) →
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <Link
          href="/products?new=1"
          className="hidden sm:inline-flex items-center gap-2 h-[38px] px-4 rounded-[10px] bg-ivory text-on-ivory font-medium text-[14px] hover:opacity-90 whitespace-nowrap"
        >
          <Plus size={18} strokeWidth={1.8} />
          Mahsulot
        </Link>

        {admin?.admin && (
          <div className="hidden lg:flex w-[38px] h-[38px] rounded-full bg-bronze text-[#f6f0e6] items-center justify-center text-xs font-semibold shrink-0" title={admin.admin.name}>
            {(admin.admin.name || 'A').slice(0, 2).toUpperCase()}
          </div>
        )}
      </header>

      <CommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
