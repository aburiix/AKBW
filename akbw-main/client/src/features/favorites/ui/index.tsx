'use client';

import React from 'react';
import { Heart, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/shared/ui/button';
import { useTranslations } from 'next-intl';
import { useWishlistStore } from '@/shared/store/wishlist.store';
import ProductCard from '@/widgets/product';

export default function FavoritesPage() {
  const favoriteProducts = useWishlistStore((s) => s.items);
  const t = useTranslations('FavoritesPage');

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gray-50 border-b border-gray-100 py-16 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-4xl md:text-5xl text-black mb-4 uppercase tracking-tight">
            {t('title')}
          </h1>
          <p className="text-gray-500 max-w-lg mx-auto">{t('description')}</p>
        </div>
      </div>

      <div className="section-padding container mx-auto px-4 py-10">
        {favoriteProducts.length > 0 ? (
          <div className="space-y-8">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <span className="text-gray-500 font-medium">
                {t('productCount', { count: favoriteProducts.length })}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
              {favoriteProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <Heart className="w-8 h-8 text-gray-300" />
            </div>
            <h2 className="text-2xl font-bold text-black mb-3">
              {t('emptyTitle')}
            </h2>
            <p className="text-gray-500 mb-8 max-w-sm">
              {t('emptyDescription')}
            </p>
            <Link href="/filters">
              <Button className="bg-black text-white rounded-full px-8 py-6 text-lg hover:bg-neutral-800 transition-all font-medium flex items-center gap-2">
                <ShoppingBag size={20} />
                {t('viewProducts')}
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
