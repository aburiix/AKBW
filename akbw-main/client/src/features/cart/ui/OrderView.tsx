'use client';

import { IOrder } from '@/shared/config/api/order/order.model';
import { useOrders } from '@/features/order/lib/hooks';
import { useTranslations } from 'next-intl';
import OrderCard from './OrderCard';
import React from 'react';

interface OrderViewProps {
  token: string;
  setSelectedOrder: (order: IOrder | null) => void;
  setModalMode: (mode: 'checkout' | 'tracking' | 'shipments') => void;
  setIsCheckoutOpen: (checkout: boolean) => void;
}

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
        <div
          id="orders"
          className="mt-16 md:mt-24 pt-12 border-t border-line scroll-mt-24"
        >
          <h2 className="serif text-[34px] md:text-[48px] leading-none text-ivory mb-8">
            {t('active_orders')}
          </h2>
          <div className="space-y-3">
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
