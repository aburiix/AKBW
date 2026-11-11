'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from '@/shared/config/i18n/navigation';
import { getTelegram, haptic } from '@/shared/lib/telegram';

const BG = '#0e0d0b';

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
      tg.setHeaderColor(BG);
      tg.setBackgroundColor(BG);
      if (tg.isVersionAtLeast('7.10')) tg.setBottomBarColor?.(BG);
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
