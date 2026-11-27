'use client';

import React, { Suspense, useState } from 'react';
import { useTranslations } from 'next-intl';
import { IOrder } from '@/shared/config/api/order/order.model';
import { useUserStore } from '@/shared/store/user.store';
import { Link } from '@/shared/config/i18n/navigation';
import Checkout from './Checkout';
import OrderView from './OrderView';

/** Ilovadagi "Buyurtmalarim" ekrani — buyurtmalar, to'lov va kuzatuv */
export default function OrdersPage() {
  const t = useTranslations('Cart');
  const { token } = useUserStore();
  const [paymentMethod, setPaymentMethod] = useState<
    'payme' | 'click' | 'paynet'
  >('payme');
  const [modalMode, setModalMode] = useState<
    'checkout' | 'tracking' | 'shipments'
  >('checkout');
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  return (
    <div className="wrap min-h-[70vh] pt-6 md:pt-10 pb-16 [&_#orders]:mt-0 [&_#orders]:pt-0 [&_#orders]:border-0 [&_#orders>h2]:hidden">
      <span className="lbl text-ivory/45 block mb-2">AKBW</span>
      <h1 className="serif text-[36px] md:text-[56px] leading-none text-ivory mb-6 md:mb-10">
        {t('my_orders')}
      </h1>
      {!token ? (
        <Link href="/profile" className="pill pill-ivory">
          {t('login_first')}
        </Link>
      ) : (
        <Suspense fallback={null}>
          <OrderView
            token={token}
            setSelectedOrder={setSelectedOrder}
            setModalMode={setModalMode}
            setIsCheckoutOpen={setIsCheckoutOpen}
          />
        </Suspense>
      )}
      <Checkout
        selectedOrder={selectedOrder}
        setIsCheckoutOpen={setIsCheckoutOpen}
        setModalMode={setModalMode}
        setPaymentMethod={setPaymentMethod}
        isCheckoutOpen={isCheckoutOpen}
        modalMode={modalMode}
        paymentMethod={paymentMethod}
      />
    </div>
  );
}
