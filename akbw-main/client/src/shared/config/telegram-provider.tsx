'use client';

import { useEffect } from 'react';
import { useTheme } from 'next-themes';
import { usePathname, useRouter } from '@/shared/config/i18n/navigation';
import { getTelegram, haptic } from '@/shared/lib/telegram';

/** Sahifa fonining haqiqiy rangi (tungi/kunduzgi mavzuga qarab) */
const pageBg = () =>
  getComputedStyle(document.body).backgroundColor || '#0e0d0b';

/**
 * Sayt Telegram Mini App sifatida ochilganda:
 * to'liq ekran, Telegram panellari sayt rangida, "Orqaga" tugmasi va haptika.
 * Oddiy brauzerda hech narsa qilmaydi.
 */
export default function TelegramProvider() {
  const pathname = usePathname();
  const router = useRouter();

  // Bir martalik sozlash
  useEffect(() => {
    const tg = getTelegram();
    if (!tg) return;
    document.documentElement.classList.add('tg-app');
    tg.ready();
    tg.expand();
    try {
      // Ro'yxatni pastga aylantirganda ilova yopilib ketmasin
      if (tg.isVersionAtLeast('7.7')) tg.disableVerticalSwipes?.();
    } catch {
      /* eski Telegram versiyasi */
    }

    // Tugma va havolalar bosilganda yengil titrash
    const onDown = (e: PointerEvent) => {
      const el = (e.target as HTMLElement)?.closest?.(
        'button, a, [role="button"], [data-href]',
      );
      if (el && !(el as HTMLButtonElement).disabled) haptic('light');
    };
    document.addEventListener('pointerdown', onDown, { passive: true });
    return () => document.removeEventListener('pointerdown', onDown);
  }, []);

  // Telegram panellari sayt mavzusiga mos (ilovadagidek: tungi — to'q, kunduzgi — och)
  const { resolvedTheme } = useTheme();
  useEffect(() => {
    const tg = getTelegram();
    if (!tg) return;
    const id = requestAnimationFrame(() => {
      try {
        const bg = toHex(pageBg());
        tg.setHeaderColor(bg);
        tg.setBackgroundColor(bg);
        if (tg.isVersionAtLeast('7.10')) tg.setBottomBarColor?.(bg);
      } catch {
        /* eski Telegram versiyasi */
      }
    });
    return () => cancelAnimationFrame(id);
  }, [resolvedTheme]);

  // Telegram'ning "Orqaga" tugmasi: bosh sahifadan boshqa joyda ko'rinadi
  useEffect(() => {
    const tg = getTelegram();
    if (!tg) return;
    const back = () => {
      if (window.history.length > 1) router.back();
      else router.push('/');
    };
    if (pathname === '/') tg.BackButton.hide();
    else tg.BackButton.show();
    tg.BackButton.onClick(back);
    return () => tg.BackButton.offClick(back);
  }, [pathname, router]);

  return null;
}

/** Telegram faqat #RRGGBB qabul qiladi: "rgb(14, 13, 11)" → "#0e0d0b" */
function toHex(c: string): `#${string}` {
  const m = c.match(/\d+/g);
  if (!m || m.length < 3) return '#0e0d0b';
  return `#${m
    .slice(0, 3)
    .map((n) => Number(n).toString(16).padStart(2, '0'))
    .join('')}`;
}
