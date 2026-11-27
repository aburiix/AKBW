'use client';

import React, { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/shared/config/i18n/navigation';
import { useWishlistStore } from '@/shared/store/wishlist.store';
import ProductCard from '@/widgets/product';

/** Sevimlilar — ilovadagi ekran bilan bir xil (sarlavha + 2 ustunli setka) */
export default function FavoritesPage() {
  const t = useTranslations('FavoritesPage');
  const items = useWishlistStore((s) => s.items);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const list = mounted ? items : [];

  return (
    <div className="wrap min-h-[70vh] pt-6 md:pt-10 pb-16">
      <span className="lbl text-ivory/45 block mb-2">
        AKBW · {t('productCount', { count: list.length })}
      </span>
      <h1 className="serif text-[36px] md:text-[56px] leading-none text-ivory mb-6 md:mb-10">
        {t('title')}
      </h1>

      {list.length > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-2.5 gap-y-6 md:gap-x-3.5 md:gap-y-8">
          {list.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        mounted && (
          <div className="py-16 md:py-24 flex flex-col items-center text-center gap-4 rounded-[26px] border border-dashed border-line-2">
            <span className="size-14 rounded-full bg-surface-2 grid place-items-center text-ivory/60">
              <Heart size={22} />
            </span>
            <h2 className="serif text-[24px] text-ivory">{t('emptyTitle')}</h2>
            <p className="text-ivory/55 text-sm max-w-[34ch]">
              {t('emptyDescription')}
            </p>
            <Link href="/filters" className="pill pill-ghost mt-1">
              {t('viewProducts')}
            </Link>
          </div>
        )
      )}
    </div>
  );
}
