'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { Heart, Home, LayoutGrid, ShoppingBag, User } from 'lucide-react';
import { Link, usePathname } from '@/shared/config/i18n/navigation';
import { useCartStore } from '@/shared/store/cart.store';
import { cn } from '@/shared/lib/utils';
import { useTranslations } from 'next-intl';

const Profile = dynamic(() => import('@/widgets/profile'), { ssr: false });

const item =
  'relative flex flex-col items-center gap-1 py-1.5 text-[9px] leading-none tracking-[0.1em] uppercase font-[family-name:var(--font-futura)] transition-colors';

/** Telefon uchun pastki menyu (md dan kichik ekranlarda) */
export default function MobileTabbar() {
  const pathname = usePathname();
  const t = useTranslations('Ui');
  const [mounted, setMounted] = useState(false);
  const cartCount = useCartStore((s) =>
    s.items.reduce((sum, i) => sum + i.quantity, 0),
  );
  useEffect(() => setMounted(true), []);

  const tab = (
    href: string,
    label: string,
    Icon: typeof Home,
    extra?: React.ReactNode,
  ) => {
    const on = href === '/' ? pathname === '/' : pathname.startsWith(href);
    return (
      <Link
        href={href}
        className={cn(item, on ? 'text-ivory' : 'text-ivory/40')}
      >
        {on && <span className="absolute -top-2 w-6 h-0.5 rounded bg-ivory" />}
        <Icon size={21} strokeWidth={1.4} />
        {label}
        {extra}
      </Link>
    );
  };

  return (
    <nav className="tabbar md:hidden fixed z-[60] inset-x-0 bottom-0 grid grid-cols-5 px-1.5 pt-2 pb-[calc(8px+env(safe-area-inset-bottom))] bg-night/90 backdrop-blur-xl border-t border-line">
      {tab('/', t('tab_home'), Home)}
      {tab('/filters', t('tab_catalog'), LayoutGrid)}
      {tab(
        '/cart',
        t('tab_cart'),
        ShoppingBag,
        mounted && cartCount > 0 ? (
          <span className="absolute top-0 left-[55%] min-w-4 h-4 px-1 rounded-full bg-ivory text-night text-[9px] font-semibold leading-4 text-center tracking-normal">
            {cartCount}
          </span>
        ) : null,
      )}
      {tab('/favorites', t('tab_fav'), Heart)}
      <Profile>
        <button className={cn(item, 'text-ivory/40 w-full')}>
          <User size={21} strokeWidth={1.4} />
          {t('tab_profile')}
        </button>
      </Profile>
    </nav>
  );
}
