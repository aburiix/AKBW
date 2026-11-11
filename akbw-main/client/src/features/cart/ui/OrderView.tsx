'use client';

import { IOrder } from '@/shared/config/api/order/order.model';
import { useOrders } from '@/features/order/lib/hooks';
import { useTranslations } from 'next-intl';
import { monsterrat } from '@/shared/fonts';
import { cn } from '@/shared/lib/utils';
import OrderCard from './OrderCard';
import React from 'react';

interface OrderViewProps {
  token: string;
  setSelectedOrder: (order: IOrder | null) => void;
  setModalMode: (mode: 'checkout' | 'tracking' | 'shipments') => void;
  setIsCheckoutOpen: (checkout: boolean) => void;
};

export default function OrderView({
  token,
  setSelectedOrder,
  setModalMode,
  setIsCheckoutOpen,
}: OrderViewProps) {
  const t = useTranslations('Cart');
  const { data: ordersData } = useOrders();

  return (
    <>
      {token && (
        <div className="mt-20">
          <h2
            className={cn(
              'text-3xl font-black uppercase mb-10 text-gray-400',
              monsterrat.className,
            )}
          >
            {t('active_orders')}
          </h2>
          <div className="space-y-6">
            {ordersData?.data.map((order: IOrder) => (
              <OrderCard
                key={order.id}
                order={order}
                setSelectedOrder={setSelectedOrder}
                setModalMode={setModalMode}
                setIsCheckoutOpen={setIsCheckoutOpen}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
