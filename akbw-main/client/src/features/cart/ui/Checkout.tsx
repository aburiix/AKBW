'use client';

import React from 'react';
import {
  Modal,
  ModalContent,
  ModalTitle,
  ModalDescription,
  ModalClose,
} from '@/shared/ui/modal';
import { OrderProgress } from './order-progress';
import { Radiant } from '@/shared/fonts';
import Image from 'next/image';
import ProductImage from '../../../../public/assets/product.png';
import { IOrder } from '@/shared/config/api/order/order.model';
import { Check, CreditCard, X } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { usePaymeLink } from '@/features/order/lib/hooks';
import { toast } from '@/shared/ui/toast';
import { useTranslations } from 'next-intl';
import { cn } from '@/shared/lib/utils';
import { useClickLink, usePaynetLink } from '../lib/hooks';
import { inter } from '@/shared/config/fonts';

interface CheckoutProps {
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  modalMode: 'checkout' | 'tracking' | 'shipments';
  selectedOrder: IOrder | null;
  setPaymentMethod: (method: 'payme' | 'click' | 'paynet') => void;
  paymentMethod: 'payme' | 'click' | 'paynet';
  setModalMode: (mode: 'checkout' | 'tracking' | 'shipments') => void;
}

function Checkout({
  isCheckoutOpen,
  setIsCheckoutOpen,
  modalMode,
  selectedOrder,
  setPaymentMethod,
  paymentMethod,
  setModalMode,
}: CheckoutProps) {
  const paynetLinkMutation = usePaynetLink();
  const paymeLinkMutation = usePaymeLink();
  const clickLinkMutation = useClickLink();
  const t = useTranslations('Cart');

  const paymentIcons = React.useMemo(
    () => ({
      payme: '/icons/payme.png',
      click: '/icons/click.png',
      paynet: '/icons/paynet.svg',
    }),
    [],
  );

  const finalizePayment = async () => {
    if (!selectedOrder) return;

    try {
      await processLink();
    } catch {
      toast.error(t('payment_error'));
      return;
    }

    toast.promise(new Promise((resolve) => setTimeout(resolve, 2000)), {
      loading: t('payment_loading'),
      success: t('payment_success'),
      error: t('payment_error'),
    });
    setTimeout(() => {
      setModalMode('tracking');
    }, 2500);
  };

  const processLink = async () => {
    if (!selectedOrder) return;
    switch (paymentMethod) {
      case 'payme':
        return await paymeLinkMutation.mutateAsync({
          orderId: selectedOrder.id,
          amount: selectedOrder.total_price,
        });
      case 'click':
        return await clickLinkMutation.mutateAsync({
          orderId: String(selectedOrder.id),
          amount: selectedOrder.total_price,
        });
      case 'paynet':
        return await paynetLinkMutation.mutateAsync({
          orderId: String(selectedOrder.id),
          amount: selectedOrder.total_price,
        });
    }
  };
  return (
    <Modal open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
      <ModalContent
        className={cn(
          'max-w-2xl',
          'bg-white',
          'p-0',
          'overflow-hidden',
          'border-none',
          'rounded-[32px]',
          'shadow-2xl',
          'max-h-[90vh]',
          'overflow-y-auto',
          'no-scrollbar',
        )}
      >
        {modalMode === 'checkout' ? (
          <div className={cn('p-8', 'space-y-8')}>
            <div className="space-y-2">
              <ModalTitle
                className={cn(
                  'text-3xl font-black uppercase tracking-tight',
                  inter.className,
                  inter.variable,
                )}
              >
                {t('modal_finalize_title')}
              </ModalTitle>
              <ModalDescription className={cn('text-gray-400', 'font-medium')}>
                {t('modal_finalize_desc')}
              </ModalDescription>
            </div>

            <div
              className={cn(
                'flex',
                '-space-x-10',
                'overflow-x-auto',
                'py-2',
                'no-scrollbar',
              )}
            >
              {selectedOrder?.orderItems.map((item: any, i: number) => (
                <div
                  key={i}
                  className={cn(
                    'w-24',
                    'h-24',
                    'rounded-2xl',
                    'overflow-hidden',
                    'border-4',
                    'border-white',
                    'shadow-xl',
                    'hover:-translate-y-2',
                    'transition-transform',
                    'shrink-0',
                  )}
                >
                  <Image
                    src={item.product?.product_images?.[0] || ProductImage.src}
                    alt={item.product?.translations?.[0]?.name || 'product'}
                    width={96}
                    height={96}
                    className="object-cover"
                  />
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <h3
                className={cn(
                  'font-bold',
                  'text-lg',
                  'flex',
                  'items-center',
                  'gap-2',
                )}
              >
                <CreditCard size={20} className="text-black" />
                {t('payment_method')}
              </h3>
              <div className={cn('grid', 'grid-cols-3', 'gap-4')}>
                {[
                  { id: 'payme', name: 'Payme', icon: paymentIcons.payme },
                  { id: 'click', name: 'Click', icon: paymentIcons.click },
                  { id: 'paynet', name: 'Paynet', icon: paymentIcons.paynet },
                ].map((method) => {
                  return (
                    <div
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id as any)}
                      className={cn(
                        'flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all cursor-pointer gap-2',
                        paymentMethod === method.id
                          ? 'border-black bg-black/5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]'
                          : 'border-gray-50 bg-gray-50/50 hover:border-black/10',
                      )}
                    >
                      <Image
                        src={method.icon}
                        alt={method.name}
                        width={120}
                        height={120}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            <div
              className={cn(
                'bg-black',
                'rounded-[28px]',
                'p-6',
                'space-y-4',
                'text-white',
                'shadow-xl',
                'shadow-black/10',
              )}
            >
              <div className={cn('flex', 'justify-between', 'items-start')}>
                <div className={cn('flex', 'flex-col')}>
                  <span
                    className={cn(
                      'text-gray-400',
                      'text-xs',
                      'font-bold',
                      'uppercase',
                      'tracking-widest',
                      'mb-1',
                    )}
                  >
                    {t('total_to_pay')}
                  </span>
                  <span className={cn('text-3xl', 'font-black')}>
                    {Number(selectedOrder?.total_price).toLocaleString()}{' '}
                    so&apos;m
                  </span>
                </div>
                <Button
                  onClick={finalizePayment}
                  className={cn(
                    'rounded-full',
                    'px-10',
                    'py-7',
                    'font-black',
                    'text-lg',
                    'bg-white',
                    'text-black',
                    'hover:bg-white/90',
                    'transition-all',
                    'uppercase',
                    'tracking-widest',
                    'cursor-pointer',
                    'border-none',
                  )}
                >
                  {t('pay_now_btn')}
                </Button>
              </div>

              <div className={cn('pt-4', 'border-t', 'border-white/20')}>
                <p
                  className={cn('text-xs', 'text-gray-300', 'leading-relaxed')}
                >
                  {t('rest_will_be_paid_at_delivery')}
                </p>
              </div>
            </div>
          </div>
        ) : modalMode === 'shipments' ? (
          <div className="p-8">
            <div className={cn('text-center', 'mb-8', 'space-y-2')}>
              <ModalTitle
                className={cn(
                  'text-3xl font-black uppercase tracking-tight',
                  inter.className,
                  inter.variable,
                )}
              >
                {t('shipments_progress_title')}
              </ModalTitle>
              <ModalDescription className={cn('text-gray-400', 'font-medium')}>
                {t('shipments_progress_desc')}
              </ModalDescription>
            </div>

            <div
              className={cn(
                'bg-gray-50',
                'rounded-[24px]',
                'p-6',
                'shadow-sm',
                'border',
                'border-gray-100',
              )}
            >
              <OrderProgress shipments={selectedOrder?.shipments || []} />
            </div>

            <div className="mt-8">
              <Button
                onClick={() => setIsCheckoutOpen(false)}
                className={cn(
                  'w-full',
                  'rounded-full',
                  'py-7',
                  'font-bold',
                  'text-lg',
                  'bg-black',
                  'text-white',
                  'hover:bg-black/80',
                  'transition-all',
                  'cursor-pointer',
                )}
              >
                {t('close_btn')}
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-8">
            <div className={cn('text-center', 'mb-10', 'space-y-2')}>
              <div
                className={cn(
                  'w-16',
                  'h-16',
                  'bg-green-100',
                  'text-green-600',
                  'rounded-full',
                  'flex',
                  'items-center',
                  'justify-center',
                  'mx-auto',
                  'mb-6',
                )}
              >
                <Check size={32} strokeWidth={3} />
              </div>
              <ModalTitle
                className={cn(
                  'text-3xl font-black uppercase tracking-tight',
                  Radiant.className,
                )}
              >
                {t('order_received_title')}
              </ModalTitle>
              <ModalDescription className={cn('text-gray-400', 'font-medium')}>
                {t('order_received_desc')}
              </ModalDescription>
            </div>

            <div
              className={cn('flex', 'justify-center', '-space-x-4', 'mb-10')}
            >
              {selectedOrder?.orderItems.map((item: any, i: number) => (
                <div
                  key={i}
                  className={cn(
                    'w-16',
                    'h-16',
                    'rounded-full',
                    'overflow-hidden',
                    'border-2',
                    'border-white',
                    'shadow-lg',
                  )}
                >
                  <Image
                    src={item.product?.product_images?.[0] || ProductImage.src}
                    alt={item.product?.translations?.[0]?.name || 'product'}
                    width={64}
                    height={64}
                    className="object-cover"
                  />
                </div>
              ))}
            </div>

            <div
              className={cn(
                'bg-gray-50',
                'rounded-[24px]',
                'p-6',
                'shadow-sm',
                'border',
                'border-gray-100',
              )}
            >
              <OrderProgress shipments={selectedOrder?.shipments || []} />
            </div>

            <div className="mt-8">
              <Button
                onClick={() => setIsCheckoutOpen(false)}
                className={cn(
                  'w-full',
                  'rounded-full',
                  'py-7',
                  'font-bold',
                  'text-lg',
                  'bg-black',
                  'text-white',
                  'hover:bg-black/80',
                  'transition-all',
                  'cursor-pointer',
                )}
              >
                {t('close_btn')}
              </Button>
            </div>
          </div>
        )}
        <ModalClose
          className={cn(
            'bg-white/80',
            'backdrop-blur-md',
            'rounded-full',
            'p-2',
            'hover:bg-white',
            'transition-all',
            'shadow-sm',
            'absolute',
            'top-4',
            'right-4',
            'focus:ring-0',
          )}
        >
          <X size={20} />
        </ModalClose>
      </ModalContent>
    </Modal>
  );
}

export default React.memo(Checkout);
