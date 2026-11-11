import { IProduct } from '@/shared/config/api/product/product.model';
import { useWishlistStore } from '@/shared/store/wishlist.store';
import { useCartStore } from '@/shared/store/cart.store';
import { Button } from '@/shared/ui/button';
import { toast } from '@/shared/ui/toast';
import { Heart } from 'lucide-react';
import Image from 'next/image';
import React from 'react';
import { useTranslations } from 'next-intl';

export default function FavoriteTab() {
  const { items, toggleWishlist } = useWishlistStore();
  const { addItem } = useCartStore();
  const t = useTranslations('Profile');
  const tPrice = useTranslations('ProductPage');

  return (
    <div className="space-y-4">
      {items.length === 0 ? (
        <div className="text-center py-20 bg-[var(--color-akbw-filter-bg)]/10 rounded-3xl border border-dashed border-[var(--color-akbw-filter-bg)]">
          <Heart
            size={48}
            className="mx-auto mb-4 text-[var(--color-akbw-filter-bg)]"
          />
          <p className="text-gray-500 font-medium tracking-tight">
            {t('favorites_empty')}
          </p>
        </div>
      ) : (
        items.map((item: IProduct) => (
          <div
            key={item.id}
            className="flex items-center gap-4 p-4 bg-surface rounded-2xl hover:border-line-2 transition-all border border-line group"
          >
            <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-[var(--color-gray-100)] flex-shrink-0">
              <Image
                src={item.product_images?.[0] || '/assets/product.png'}
                alt={item.name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-base truncate">{item.name}</h4>
              <p className="text-lg font-black mt-0.5">
                {tPrice('price', { price: item.price.toLocaleString() })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => {
                  addItem(item);
                  toast.success(t('added_to_cart', { name: item.name }));
                }}
                size="sm"
                className="rounded-full cursor-pointer px-5 py-5 font-bold text-xs shadow-lg shadow-night/5"
              >
                {t('to_cart')}
              </Button>
              <button
                onClick={() => toggleWishlist(item)}
                className="p-2.5 cursor-pointer text-sale hover:bg-sale/10 rounded-full transition-colors"
              >
                <Heart size={20} fill="currentColor" />
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
