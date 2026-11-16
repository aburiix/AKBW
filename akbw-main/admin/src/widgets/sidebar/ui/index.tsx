'use client';

import React from 'react';
import { Link, usePathname } from '@/shared/config/i18n/navigation';
import { cn } from '@/shared/lib/utils';
import { LogOut } from 'lucide-react';
import { useAdminAuthStore } from '@/shared/store/auth.store';
import { useAdminMe } from '@/widgets/header/lib/hooks';
import { NAV_GROUPS } from '@/widgets/layout/model/nav';
import { useBadges } from '@/widgets/layout/model/use-badges';

type Props = {
  collapsed: boolean;
  mobileOpen: boolean;
  onNavigate: () => void;
};

export default function Sidebar({ collapsed, mobileOpen, onNavigate }: Props) {
  const pathname = usePathname(); // locale'siz: /dashboard
  const { logout } = useAdminAuthStore();
  const { data: me } = useAdminMe();
  const badges = useBadges();

  const name: string = me?.admin?.name || 'Admin';
  const initials = name
    .split(' ')
    .map((p: string) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <aside
      className={cn(
        'fixed md:sticky left-0 top-0 z-[70] md:z-30 h-dvh flex flex-col bg-s1 border-r border-line overflow-hidden shrink-0',
        'transition-[width,transform] duration-300',
        'w-[280px]',
        collapsed ? 'md:w-[76px]' : 'md:w-[264px]',
        mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
      )}
    >
      {/* Logo */}
      <Link
        href="/dashboard"
        onClick={onNavigate}
        className={cn(
          'flex items-center gap-2.5 px-[22px] pt-[22px] pb-[18px] whitespace-nowrap',
          collapsed && 'md:justify-center md:px-0',
        )}
      >
        <span className="font-logo text-[26px] leading-none tracking-wide">
          {collapsed ? <span className="hidden md:inline">AK</span> : null}
          <span className={cn(collapsed && 'md:hidden')}>AKBW</span>
        </span>
        <span
          className={cn(
            'lbl border border-line2 rounded-md px-1.5 py-1',
            collapsed && 'md:hidden',
          )}
        >
          Admin
        </span>
      </Link>

      {/* Navigatsiya */}
      <nav className="flex-1 overflow-y-auto no-scrollbar px-3 pb-3">
        {NAV_GROUPS.map((group) => (
          <div
            key={group.title}
            className={cn(
              'mt-[18px]',
              collapsed && 'md:mt-2.5 md:pt-2.5 md:border-t md:border-line',
            )}
          >
            <span
              className={cn(
                'lbl block px-3 pb-2 whitespace-nowrap',
                collapsed && 'md:hidden',
              )}
            >
              {group.title}
            </span>
            {group.items.map((item) => {
              const active =
                pathname === item.href ||
                pathname.startsWith(item.href + '/') ||
                ((pathname === '/' || pathname === '') &&
                  item.href === '/dashboard');
              const Icon = item.icon;
              const count = item.badge ? badges[item.badge] : 0;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  title={collapsed ? item.name : undefined}
                  className={cn(
                    'relative flex items-center gap-3 h-[38px] px-3 rounded-[10px] whitespace-nowrap text-[14px] transition-colors',
                    active
                      ? 'bg-ivory text-on-ivory'
                      : 'text-mute hover:bg-s2 hover:text-ink',
                    collapsed && 'md:justify-center md:px-0',
                  )}
                >
                  <Icon size={18} strokeWidth={1.6} className="shrink-0" />
                  <span className={cn(collapsed && 'md:hidden')}>
                    {item.name}
                  </span>
                  {count > 0 && (
                    <em
                      className={cn(
                        'not-italic ml-auto text-[11px] font-semibold leading-none px-[7px] py-1 rounded-full',
                        active
                          ? 'bg-on-ivory text-ivory'
                          : 'bg-bronze text-[#f6f0e6]',
                        collapsed &&
                          'md:absolute md:top-1 md:right-2 md:px-1.5 md:py-0.5 md:text-[9px]',
                      )}
                    >
                      {count > 99 ? '99+' : count}
                    </em>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Pastki qism */}
      <div className="border-t border-line p-3 grid gap-1">
        <div
          className={cn(
            'flex items-center gap-2.5 p-2 rounded-xl whitespace-nowrap',
            collapsed && 'md:justify-center',
          )}
        >
          <div className="w-[34px] h-[34px] rounded-full bg-bronze text-[#f6f0e6] grid place-items-center text-xs font-semibold shrink-0">
            {initials}
          </div>
          <div className={cn('min-w-0', collapsed && 'md:hidden')}>
            <b className="block text-[13px] font-semibold truncate">{name}</b>
            <small className="text-mute2 text-[11.5px]">
              {me?.admin?.phone || ''}
            </small>
          </div>
        </div>
        <button
          onClick={logout}
          title="Chiqish"
          className={cn(
            'flex items-center gap-3 h-[38px] px-3 rounded-[10px] text-sale hover:bg-s2 cursor-pointer whitespace-nowrap',
            collapsed && 'md:justify-center md:px-0',
          )}
        >
          <LogOut size={18} strokeWidth={1.6} />
          <span className={cn(collapsed && 'md:hidden')}>Chiqish</span>
        </button>
      </div>
    </aside>
  );
}
