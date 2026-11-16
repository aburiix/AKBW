'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '@/widgets/sidebar/ui';
import Header from '@/widgets/header/ui';
import { Link, usePathname } from '@/shared/config/i18n/navigation';
import { Menu } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { BOTTOM_NAV, NAV_ITEMS } from '@/widgets/layout/model/nav';

const COLLAPSE_KEY = 'akbw-admin-sidebar-mini';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(COLLAPSE_KEY) === '1');
    } catch {}
  }, []);

  // sahifa almashganda mobil menyu yopiladi
  useEffect(() => setMobileOpen(false), [pathname]);

  const toggleCollapse = () =>
    setCollapsed((v) => {
      try {
        localStorage.setItem(COLLAPSE_KEY, v ? '0' : '1');
      } catch {}
      return !v;
    });

  const bottom = BOTTOM_NAV.map((h) => NAV_ITEMS.find((i) => i.href === h)!);

  return (
    <div className="min-h-dvh bg-bg text-ink flex">
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onNavigate={() => setMobileOpen(false)}
      />

      {/* mobil parda */}
      <div
        onClick={() => setMobileOpen(false)}
        className={cn(
          'fixed inset-0 z-[65] bg-[rgb(0_0_0/0.5)] transition-opacity md:hidden',
          mobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none',
        )}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        <Header
          onBurger={() => setMobileOpen(true)}
          onCollapse={toggleCollapse}
        />
        <main
          key={pathname}
          className="akbw-main akbw-page-in flex-1 w-full max-w-[1480px] p-4 pb-28 md:p-7 md:pb-10"
        >
          {children}
        </main>
      </div>

      {/* mobil pastki panel */}
      <nav className="md:hidden fixed left-0 right-0 bottom-0 z-50 grid grid-cols-5 bg-[color-mix(in_srgb,var(--s1)_92%,transparent)] backdrop-blur-[14px] border-t border-line px-1 pt-1.5 pb-[calc(6px+env(safe-area-inset-bottom))]">
        {bottom.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'grid justify-items-center gap-1 py-1.5 text-[10.5px]',
                active ? 'text-ink' : 'text-mute2',
              )}
            >
              <Icon size={19} strokeWidth={1.6} />
              {item.name}
            </Link>
          );
        })}
        <button
          onClick={() => setMobileOpen(true)}
          className="grid justify-items-center gap-1 py-1.5 text-[10.5px] text-mute2 cursor-pointer"
        >
          <Menu size={19} strokeWidth={1.6} />
          Yana
        </button>
      </nav>
    </div>
  );
}
