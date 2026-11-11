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
      className={cn(
        'border',
        'border-white/20',
        'rounded-4xl',
        'p-8',
        'bg-white/60',
        'backdrop-blur-md',
        'shadow-xl',
        'shadow-black/5',
        'overflow-hidden',
        'relative',
        'group',
        'hover:bg-white/80',
        'transition-all',
        'duration-500',
      )}
    >
      {order.status === 'review' && (
        <div className={cn('absolute', 'inset-0', 'bg-white/40', 'z-10')} />
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
          <div className="ml-4">
            <p className={cn('text-sm', 'text-gray-400', 'font-medium')}>
              {t('order_id')}:{' '}
              <span className="text-black">
                #{order.id.toString().slice(-6)}
              </span>
            </p>
            <p className={cn('font-bold', 'text-lg')}>
              {order.total_price.toLocaleString()} so&apos;m
            </p>
            <p className={cn('text-xs', 'text-gray-400')}>
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
              'px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 max-md:w-full',
              order.status === 'review'
                ? 'bg-gray-200 text-gray-500'
                : order.status === 'delivering'
                  ? 'bg-blue-100 text-blue-600'
                  : order.status === 'approved'
                    ? 'bg-green-100 text-green-600'
                    : 'bg-green-100 text-green-600',
              order.status === 'paid' ? 'bg-green-100 text-green-600' : '',
              order.status === 'cancelled' ? 'bg-red-100 text-red-600' : '',
            )}
          >
            {order.status === 'review' && (
              <>
                <div
                  className={cn(
                    'w-2',
                    'h-2',
                    'rounded-full',
                    'bg-gray-400',
                    'animate-pulse',
                  )}
                />
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
                className={cn(
                  'rounded-full',
                  'px-8',
                  'py-5',
                  'font-bold',
                  'uppercase',
                  'text-xs',
                  'bg-white',
                  'text-black',
                  'border-2',
                  'border-black',
                  'hover:bg-gray-50',
                  'transition-all',
                  'cursor-pointer',
                  'max-md:w-full',
                )}
              >
                {t('watch_progress_btn')}
              </Button>
            )}

          {order.status === 'approved' && (
            <Button
              onClick={() => handleOrderNow(order)}
              className={cn(
                'rounded-full',
                'px-10',
                'py-6',
                'font-black',
                'uppercase',
                'text-sm',
                'bg-black',
                'hover:bg-black/90',
                'shadow-xl',
                'transition-all',
                'cursor-pointer',
                'max-md:w-full',
              )}
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
              className={cn(
                'rounded-full',
                'px-10',
                'py-6',
                'font-bold',
                'uppercase',
                'text-sm',
                'bg-white',
                'text-black',
                'border-2',
                'border-black',
                'hover:bg-gray-50',
                'transition-all',
                'cursor-pointer',
                'max-md:w-full',
              )}
            >
              {t('track_order_btn')}
            </Button>
          )}
        </div>
      </div>

      {/* Order Items Section */}
      <div className={cn('mt-6', 'border-t', 'border-white/20', 'pt-6')}>
        <button
          onClick={() => setShowItems(!showItems)}
          className={cn(
            'flex',
            'items-center',
            'gap-2',
            'text-sm',
            'font-bold',
            'text-gray-600',
            'hover:text-black',
            'transition-colors',
            'cursor-pointer',
          )}
        >
          {showItems ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          {t('order_items')} ({order.orderItems?.length || 0})
        </button>

        {showItems && order.orderItems && (
          <div className={cn('mt-4', 'space-y-3')}>
            {order.orderItems.map((item, idx) => (
              <div
                key={idx}
                className={cn(
                  'flex',
                  'items-center',
                  'gap-4',
                  'p-3',
                  'bg-white/40',
                  'rounded-2xl',
                  'border',
                  'border-white/20',
                )}
              >
                <div
                  className={cn(
                    'w-16',
                    'h-16',
                    'rounded-xl',
                    'overflow-hidden',
                    'bg-gray-100',
                    'shrink-0',
                  )}
                >
                  <Image
                    src={item.product?.product_images?.[0] || ProductImage.src}
                    alt={item.product?.translations?.[0]?.name || 'product'}
                    width={64}
                    height={64}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className={cn('flex-1', 'min-w-0')}>
                  <p
                    className={cn(
                      'font-semibold',
                      'text-sm',
                      'text-black',
                      'truncate',
                    )}
                  >
                    {item.product?.translations?.[0]?.name ||
                      `Product ${item.productId}`}
                  </p>
                  <div
                    className={cn(
                      'flex',
                      'items-center',
                      'gap-3',
                      'mt-1',
                      'text-xs',
                      'text-gray-500',
                    )}
                  >
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
                  <p className={cn('font-bold', 'text-sm', 'text-black')}>
                    {(item.price * item.quantity).toLocaleString()} so&apos;m
                  </p>
                  <p className={cn('text-xs', 'text-gray-400')}>
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
