'use client';

import { Check, Truck, X, ChevronDown, ChevronUp } from 'lucide-react';
import ProductImage from '../../../../public/assets/product.png';
import { IOrder } from '@/shared/config/api/order/order.model';
import { Button } from '@/shared/ui/button';
import { useTranslations } from 'next-intl';
import { cn } from '@/shared/lib/utils';
import React, { useState } from 'react';
import Image from 'next/image';

interface OrderCardProps {
  order: IOrder | null;
  setSelectedOrder: (order: IOrder | null) => void;
  setModalMode: (mode: 'checkout' | 'tracking' | 'shipments') => void;
  setIsCheckoutOpen: (checkout: boolean) => void;
}

function OrderCard({
  order,
  setSelectedOrder,
  setModalMode,
  setIsCheckoutOpen,
}: OrderCardProps) {
  const t = useTranslations('Cart');
  const [showItems, setShowItems] = useState(false);

  if (!order) return null;

  const handleOrderNow = (order: any) => {
    setSelectedOrder(order);
    setModalMode('checkout');
    setIsCheckoutOpen(true);
  };

  return (
    <div
      key={order.id}
      className="relative overflow-hidden rounded-[26px] border border-line bg-surface p-5 md:p-7 transition-colors hover:border-line-2"
    >
      {order.status === 'review' && (
        <div className="absolute inset-0 bg-night/30 z-10" />
      )}
      <div
        className={cn(
          'flex',
          'flex-col',
          'md:flex-row',
          'justify-between',
          'items-start',
          'md:items-center',
          'gap-6',
          'relative',
          'z-20',
        )}
      >
        <div className={cn('flex', 'gap-4', 'items-center')}>
          <div>
            <p className="lbl text-ivory/45">
              {t('order_id')}:{' '}
              <span className="text-ivory">
                #{order.id.toString().slice(-6)}
              </span>
            </p>
            <p className="serif text-[28px] leading-none text-ivory tabular-nums mt-2">
              {order.total_price.toLocaleString()} so&apos;m
            </p>
            <p className="text-[12px] text-ivory/40 mt-1.5">
              {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div
          className={cn(
            'flex',
            'items-center',
            'gap-6',
            'w-full',
            'md:w-auto',
            'max-md:flex-col',
            'max-md:items-start',
          )}
        >
          {/* Status Badge */}
          <div
            className={cn(
              'h-10 px-4 rounded-full border lbl !tracking-[0.14em] flex items-center gap-2 max-md:w-full',
              order.status === 'review'
                ? 'border-line-2 text-ivory/55'
                : order.status === 'delivering'
                  ? 'border-star/40 bg-star/10 text-star'
                  : order.status === 'cancelled'
                    ? 'border-sale/40 bg-sale/10 text-sale'
                    : 'border-ok/40 bg-ok/10 text-ok',
            )}
          >
            {order.status === 'review' && (
              <>
                <div className="w-2 h-2 rounded-full bg-ivory/50 animate-pulse" />
                {t('status_review')}
              </>
            )}
            {order.status === 'paid' && (
              <>
                <Check size={16} strokeWidth={3} />
                {t('status_paid')}
              </>
            )}
            {order.status === 'approved' && (
              <>
                <Check size={16} strokeWidth={3} />
                {t('status_approved')}
              </>
            )}
            {order.status === 'delivering' && (
              <>
                <Truck size={16} strokeWidth={2.5} />
                {t('status_delivering')}
              </>
            )}
            {order.status === 'cancelled' && (
              <>
                <X size={16} strokeWidth={3} />
                {t('status_cancelled')}
              </>
            )}
          </div>

          {order.shipments &&
            order.status === 'paid' &&
            order.shipments.length > 0 && (
              <Button
                onClick={() => {
                  setSelectedOrder(order);
                  setModalMode('shipments');
                  setIsCheckoutOpen(true);
                }}
                variant="outline"
                className="max-md:w-full"
              >
                {t('watch_progress_btn')}
              </Button>
            )}

          {order.status === 'approved' && (
            <Button
              onClick={() => handleOrderNow(order)}
              className="max-md:w-full !h-12 px-8"
            >
              {t('order_now_btn')}
            </Button>
          )}

          {order.status === 'delivering' && (
            <Button
              onClick={() => {
                setSelectedOrder(order);
                setModalMode('tracking');
                setIsCheckoutOpen(true);
              }}
              variant="outline"
              className="max-md:w-full"
            >
              {t('track_order_btn')}
            </Button>
          )}
        </div>
      </div>

      {/* Order Items Section */}
      <div className="mt-6 border-t border-line pt-5">
        <button
          onClick={() => setShowItems(!showItems)}
          className="flex items-center gap-2 lbl text-ivory/55 hover:text-ivory transition-colors cursor-pointer"
        >
          {showItems ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          {t('order_items')} ({order.orderItems?.length || 0})
        </button>

        {showItems && order.orderItems && (
          <div className={cn('mt-4', 'space-y-3')}>
            {order.orderItems.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-4 p-3 rounded-2xl border border-line bg-ivory/[0.03]"
              >
                <div className="w-14 h-[72px] rounded-xl overflow-hidden bg-surface-2 shrink-0">
                  <Image
                    src={item.product?.product_images?.[0] || ProductImage.src}
                    alt={item.product?.translations?.[0]?.name || 'product'}
                    width={64}
                    height={64}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className={cn('flex-1', 'min-w-0')}>
                  <p className="text-[14px] text-ivory truncate">
                    {item.product?.translations?.[0]?.name ||
                      `Product ${item.productId}`}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[12px] text-ivory/45">
                    {item.size && (
                      <span>
                        {t('size')}:{' '}
                        {item.size.translations?.[0]?.name || item.size.name}
                      </span>
                    )}
                    {item.color && (
                      <span>
                        {t('color')}:{' '}
                        {item.color.translations?.[0]?.name || item.color.name}
                      </span>
                    )}
                    <span>
                      {t('quantity')}: {item.quantity}
                    </span>
                  </div>
                </div>
                <div className={cn('text-right', 'shrink-0')}>
                  <p className="text-[14px] text-ivory tabular-nums">
                    {(item.price * item.quantity).toLocaleString()} so&apos;m
                  </p>
                  <p className="text-[12px] text-ivory/40 mt-1.5">
                    {item.price.toLocaleString()} so&apos;m × {item.quantity}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default React.memo(OrderCard);
