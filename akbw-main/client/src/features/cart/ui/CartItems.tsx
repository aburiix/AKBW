'use client';

import Image from 'next/image';
import { useCartStore } from '@/shared/store/cart.store';
import { Minus, Plus, Trash2 } from 'lucide-react';
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
    <div className="flex-1 w-full bg-white/40 backdrop-blur-sm border border-white/60 rounded-[32px] p-4 md:p-8 space-y-8">
      {cartItems.length > 0 ? (
        cartItems.map((item, idx) => (
          <React.Fragment key={item.id}>
            <div className="flex gap-4 md:gap-6 items-center">
              <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                <Image
                  src={item.product_images?.[0] || '/assets/product.png'}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="128px"
                />
              </div>

              <div className="flex-1 flex flex-col justify-between h-24 md:h-32">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg md:text-xl">
                      {item.name}
                    </h3>
                    {item.selectedSize && (
                      <p className="text-sm text-gray-500">
                        {t('size')}:{' '}
                        <span className="text-gray-400">
                          {item.selectedSize}
                        </span>
                      </p>
                    )}
                    {item.selectedColor && (
                      <p className="text-sm text-gray-500">
                        {t('color')}:{' '}
                        <span className="text-gray-400">
                          {item.selectedColor}
                        </span>
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleRemoveItem(item.id, item.name)}
                    className="text-red-500 hover:text-red-600 transition-colors p-1 cursor-pointer"
                  >
                    <Trash2 size={24} />
                  </button>
                </div>

                <div className="flex justify-between items-end">
                  <span className="text-xl md:text-2xl font-bold">
                    {item.price.toLocaleString()} so&apos;m
                  </span>
                  <div className="flex items-center gap-4 bg-gray-100 rounded-full px-4 py-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="hover:text-black transition-colors opacity-60 hover:opacity-100 cursor-pointer"
                    >
                      <Minus size={18} />
                    </button>
                    <span className="font-bold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="hover:text-black transition-colors opacity-60 hover:opacity-100 cursor-pointer"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            {idx !== cartItems.length - 1 && (
              <hr className="border-gray-50 my-8" />
            )}
          </React.Fragment>
        ))
      ) : (
        <div className="py-20 text-center">
          <p className="text-gray-400 text-lg">{t('empty_cart_text')}</p>
          <Link
            href="/filters"
            className="mt-6 inline-block rounded-full px-5 py-3 font-bold bg-black text-white hover:bg-black/90 transition-colors"
          >
            {t('view_products_btn')}
          </Link>
        </div>
      )}
    </div>
  );
}
