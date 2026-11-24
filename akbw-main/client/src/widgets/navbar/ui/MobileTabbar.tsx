'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import {
  Heart,
  Home,
  LayoutGrid,
  ShoppingBag,
  Sparkles,
  User,
} from 'lucide-react';
import { Link, usePathname } from '@/shared/config/i18n/navigation';
import { useCartStore } from '@/shared/store/cart.store';
import { cn } from '@/shared/lib/utils';
import { useTranslations } from 'next-intl';

const Profile = dynamic(() => import('@/widgets/profile'), { ssr: false });

const item =
  'relative flex flex-col items-center gap-1 py-1.5 text-[8.5px] leading-none tracking-[0.06em] uppercase whitespace-nowrap font-[family-name:var(--font-futura)] transition-colors';

/** Telefon uchun pastki menyu (md dan kichik ekranlarda) */
export default function MobileTabbar() {
  const pathname = usePathname();
  const t = useTranslations('Ui');
  const [mounted, setMounted] = useState(false);
  const cartCount = useCartStore((s) =>
    s.items.reduce((sum, i) => sum + i.quantity, 0),
  );
  useEffect(() => setMounted(true), []);

  // iPhone'dagi ichki brauzerlar (Google ilovasi, Instagram, Chrome va h.k.) — Safari emas.
  // Ularda `bottom: 0` panel ilovaning pastki paneli ortida qolib ketadi, shuning uchun
  // menyuni haqiqiy ko'rinadigan maydon (visualViewport) pastiga mahkamlaymiz.
  // Telegram'ning o'z yechimi bor (html.tg-app), Safari'da esa oddiy `bottom: 0` ishlaydi.
  useEffect(() => {
    const ua = navigator.userAgent;
    const isIOS =
      /iPhone|iPad|iPod/.test(ua) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isSafari = /Version\/[\d.]+.*Safari\//.test(ua) && !/GSA\//.test(ua);
    const vv = window.visualViewport;
    const root = document.documentElement;
    if (!isIOS || isSafari || !vv || root.classList.contains('tg-app')) return;

    root.classList.add('ios-webview');
    // Google ilovasi (GSA) pastki paneli sahifa ustida suzib turadi va sahifaga hech qanday
    // o'lcham bermaydi (visualViewport/safe-area ham uni hisobga olmaydi). Skrinshotdan
    // o'lchangan balandligi (panel + uy chizig'i) ≈ 77pt — menyuni shuncha yuqoriga ko'taramiz.
    const overlayBar = /GSA\//.test(ua) && /iPhone|iPod/.test(ua) ? 77 : 0;
    if (overlayBar) root.classList.add('ios-gsa');

    // Diagnostika: akbw.uz/?vvdebug=1 — ekran o'lchamlarini ko'rsatadi
    let dbg: HTMLDivElement | null = null;
    if (/[?&]vvdebug=1/.test(location.search)) {
      dbg = document.createElement('div');
      dbg.style.cssText =
        'position:fixed;top:0;left:0;right:0;z-index:99999;background:#000c;color:#0f0;font:11px/1.35 monospace;padding:6px;white-space:pre-wrap;pointer-events:none';
      document.body.appendChild(dbg);
    }

    let raf = 0;
    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const bottom = vv.offsetTop + vv.height - overlayBar;
        root.style.setProperty('--vv-bottom', `${bottom}px`);
        if (dbg) {
          const sa = getComputedStyle(root).getPropertyValue('--sab');
          dbg.textContent = [
            ua,
            `inner ${innerWidth}x${innerHeight} client ${root.clientHeight} screen ${screen.width}x${screen.height}`,
            `vv ${vv.width.toFixed(1)}x${vv.height.toFixed(1)} offTop ${vv.offsetTop.toFixed(1)} scale ${vv.scale}`,
            `overlayBar ${overlayBar} -> --vv-bottom ${bottom.toFixed(1)} sab ${sa}`,
          ].join('\n');
        }
      });
    };
    update();
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    window.addEventListener('orientationchange', update);
    return () => {
      cancelAnimationFrame(raf);
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
      window.removeEventListener('orientationchange', update);
      root.classList.remove('ios-webview', 'ios-gsa');
      dbg?.remove();
    };
  }, []);

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
    <nav className="tabbar md:hidden fixed z-[60] inset-x-0 bottom-0 grid grid-cols-6 px-1 pt-2 pb-[calc(8px+env(safe-area-inset-bottom))] bg-night/90 backdrop-blur-xl border-t border-line">
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
      <button
        onClick={() => window.dispatchEvent(new CustomEvent('akbw:assistant'))}
        className={cn(item, 'text-ivory/40 hover:text-ivory cursor-pointer')}
        aria-label="AKBW AI"
      >
        <Sparkles size={21} strokeWidth={1.4} />
        AI
      </button>
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
