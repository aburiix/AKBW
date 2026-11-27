'use client';

import { useEffect, useState } from 'react';
import { Home, LayoutGrid, ShoppingBag, Sparkles, User } from 'lucide-react';
import { Link, usePathname } from '@/shared/config/i18n/navigation';
import { useCartStore } from '@/shared/store/cart.store';
import { cn } from '@/shared/lib/utils';
import { useTranslations } from 'next-intl';

const item =
  'relative h-[52px] rounded-[26px] flex flex-col items-center justify-center gap-[3px] text-[10px] leading-none font-medium tracking-[0.02em] uppercase whitespace-nowrap font-[family-name:var(--font-inter)] transition-colors';

/** Telefon uchun pastki menyu (md dan kichik ekranlarda) */
export default function MobileTabbar() {
  const pathname = usePathname();
  const t = useTranslations('Ui');
  const [mounted, setMounted] = useState(false);
  const cartCount = useCartStore((s) =>
    s.items.reduce((sum, i) => sum + i.quantity, 0),
  );
  useEffect(() => setMounted(true), []);

  // iPhone'dagi Google ilovasi (GSA): uning pastki paneli sahifa ustida suzib turadi va sahifaga
  // hech qanday o'lcham bermaydi, shuning uchun menyu doimiy 77pt yuqoriga ko'tariladi (CSS: html.ios-gsa).
  // Oldin menyu sahifa aylantirilganda JS bilan qayta joylashtirilardi — Google paneli yashirinib-chiqqanda
  // u kechikib, menyu ekran o'rtasida "suzib" qolardi. Endi joylashuv faqat CSS'da, qo'zg'almas.
  // Boshqa brauzerlarda (Safari, Chrome, Instagram) oddiy `bottom: 0` ishlaydi; Telegram — html.tg-app.
  useEffect(() => {
    const ua = navigator.userAgent;
    const root = document.documentElement;
    if (
      !/GSA\//.test(ua) ||
      !/iPhone|iPod/.test(ua) ||
      root.classList.contains('tg-app')
    )
      return;
    root.classList.add('ios-gsa');
    // Sahifa body ichida aylanadi — window.scrollTo (Next.js sahifa almashganda, savat va h.k.) body'ga yo'naltiriladi
    const orig = window.scrollTo.bind(window);
    window.scrollTo = ((...args: Parameters<typeof window.scrollTo>) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (document.body.scrollTo as any)(...args);
    }) as typeof window.scrollTo;
    return () => {
      root.classList.remove('ios-gsa');
      window.scrollTo = orig;
    };
  }, []);

  // Google ilovasi: yangi sahifaga o'tganda tepadan boshlansin (body aylanadi, window emas)
  useEffect(() => {
    if (document.documentElement.classList.contains('ios-gsa'))
      document.body.scrollTop = 0;
  }, [pathname]);

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
        className={cn(item, on ? 'text-ivory bg-surface-2' : 'text-ivory/85')}
      >
        <Icon size={22} strokeWidth={1.5} />
        {label}
        {extra}
      </Link>
    );
  };

  return (
    <nav className="tabbar md:hidden fixed z-[60] inset-x-0 bottom-0 px-3.5 pb-[calc(10px+env(safe-area-inset-bottom))] pointer-events-none">
      <div className="glass !bg-[var(--c-tabbar)] pointer-events-auto h-16 rounded-[32px] border border-line grid grid-cols-5 items-center px-1.5 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.45)]">
        {tab('/', t('tab_home'), Home)}
        {tab('/filters', t('tab_catalog'), LayoutGrid)}
        <button
          onClick={() =>
            window.dispatchEvent(new CustomEvent('akbw:assistant'))
          }
          className={cn(item, 'text-ivory/85 hover:text-ivory cursor-pointer')}
          aria-label="AKBW AI"
        >
          <Sparkles size={22} strokeWidth={1.5} />
          AI
        </button>
        {tab(
          '/cart',
          t('tab_cart'),
          ShoppingBag,
          mounted && cartCount > 0 ? (
            <span className="absolute top-1 left-[56%] min-w-4 h-4 px-1 rounded-full bg-ivory text-night text-[9px] font-semibold leading-4 text-center tracking-normal">
              {cartCount}
            </span>
          ) : null,
        )}
        {tab('/profile', t('tab_profile'), User)}
      </div>
    </nav>
  );
}
