'use client';

import Image from 'next/image';
import { useCartStore } from '@/shared/store/cart.store';
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from '@/shared/ui/toast';
import React from 'react';
import { Link } from '@/shared/config/i18n/navigation';

export default function CartItems() {
  const t = useTranslations('Cart');
  const cartItems = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  const handleRemoveItem = (id: number, name: string) => {
    removeItem(id);
    toast.success(t('item_removed_success', { name }), {
      description: t('item_removed_desc'),
    });
  };

  return (
    <div className="flex-1 w-full min-w-0 flex flex-col gap-3">
      {cartItems.length > 0 ? (
        cartItems.map((item) => (
          <div
            key={item.id}
            className="flex gap-4 md:gap-5 p-3 md:p-4 rounded-[24px] border border-line bg-surface"
          >
            <div className="relative w-[92px] md:w-[120px] aspect-[3/4] rounded-2xl overflow-hidden bg-surface-2 shrink-0">
              <Image
                src={item.product_images?.[0] || '/assets/product.png'}
                alt={item.name}
                fill
                className="object-cover"
                sizes="120px"
              />
            </div>

            <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
              <div className="flex justify-between items-start gap-3">
                <div className="min-w-0">
                  <h3 className="serif text-[20px] md:text-[24px] leading-tight text-ivory truncate">
                    {item.name}
                  </h3>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {item.selectedSize && (
                      <span className="rounded-full border border-line-2 px-2.5 py-1 text-[11px] text-ivory/60">
                        {t('size')}: {item.selectedSize}
                      </span>
                    )}
                    {item.selectedColor && (
                      <span className="rounded-full border border-line-2 px-2.5 py-1 text-[11px] text-ivory/60">
                        {t('color')}: {item.selectedColor}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="delete"
                  onClick={() => handleRemoveItem(item.id, item.name)}
                  className="grid place-items-center size-9 shrink-0 rounded-full text-ivory/40 hover:text-sale hover:bg-sale/10 transition-colors cursor-pointer"
                >
                  <Trash2 size={17} />
                </button>
              </div>

              <div className="flex justify-between items-end gap-2 mt-3">
                <span className="text-[16px] md:text-[20px] text-ivory tabular-nums whitespace-nowrap">
                  {Math.round(
                    item.price * (1 - (item.discount || 0) / 100),
                  ).toLocaleString()}{' '}
                  söm
                  {!!item.discount && (
                    <span className="ml-2 text-[12px] text-ivory/40 line-through">
                      {item.price.toLocaleString()}
                    </span>
                  )}
                </span>
                <div className="flex items-center h-10 rounded-full border border-line-2 px-1">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="grid place-items-center size-8 rounded-full text-ivory/60 hover:text-ivory hover:bg-ivory/[0.06] cursor-pointer"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-7 text-center text-ivory tabular-nums">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="grid place-items-center size-8 rounded-full text-ivory/60 hover:text-ivory hover:bg-ivory/[0.06] cursor-pointer"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="py-20 px-6 flex flex-col items-center text-center rounded-[28px] border border-dashed border-line-2">
          <span className="grid place-items-center size-16 rounded-full glass mb-5">
            <ShoppingBag size={22} className="text-ivory/70" />
          </span>
          <p className="serif text-[26px] text-ivory">{t('empty_cart_text')}</p>
          <Link href="/filters" className="mt-6 pill pill-ivory">
            {t('view_products_btn')}
          </Link>
        </div>
      )}
    </div>
  );
}
