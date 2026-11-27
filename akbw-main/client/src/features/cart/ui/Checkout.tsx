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
  const thumbs = (size: 'lg' | 'sm') => (
    <div
      className={cn(
        'flex no-scrollbar',
        size === 'lg'
          ? '-space-x-6 overflow-x-auto py-1'
          : 'justify-center -space-x-3',
      )}
    >
      {selectedOrder?.orderItems.map((item: any, i: number) => (
        <div
          key={i}
          className={cn(
            'relative shrink-0 overflow-hidden border-2 border-surface-2 bg-surface-3 shadow-[0_14px_30px_-12px_rgba(0,0,0,0.8)] transition-transform hover:-translate-y-1.5',
            size === 'lg'
              ? 'w-[76px] aspect-[3/4] rounded-2xl'
              : 'size-14 rounded-full',
          )}
        >
          <Image
            src={item.product?.product_images?.[0] || ProductImage.src}
            alt={item.product?.translations?.[0]?.name || 'product'}
            fill
            sizes="80px"
            className="object-cover"
          />
        </div>
      ))}
    </div>
  );

  const header = (title: string, desc: string, center = false) => (
    <div className={cn('space-y-2', center && 'text-center')}>
      <ModalTitle className="serif text-[30px] md:text-[36px] leading-[1.05] text-ivory font-normal tracking-normal">
        {title}
      </ModalTitle>
      <ModalDescription className="text-[13.5px] leading-relaxed text-ivory/55">
        {desc}
      </ModalDescription>
    </div>
  );

  return (
    <Modal open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
      <ModalContent className="max-w-[560px] p-0 no-scrollbar">
        {modalMode === 'checkout' ? (
          <div className="p-6 md:p-9 flex flex-col gap-7">
            <div className="pr-10">
              <span className="lbl text-ivory/40">
                AKBW · {t('payment_method')}
              </span>
              <div className="mt-3">
                {header(t('modal_finalize_title'), t('modal_finalize_desc'))}
              </div>
            </div>

            {thumbs('lg')}

            <div>
              <h3 className="lbl text-ivory/45 mb-3 flex items-center gap-2">
                <CreditCard size={14} />
                {t('payment_method')}
              </h3>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: 'payme', name: 'Payme', icon: paymentIcons.payme },
                  { id: 'click', name: 'Click', icon: paymentIcons.click },
                  { id: 'paynet', name: 'Paynet', icon: paymentIcons.paynet },
                ].map((method) => {
                  const on = paymentMethod === method.id;
                  return (
                    <button
                      type="button"
                      key={method.id}
                      aria-pressed={on}
                      onClick={() => setPaymentMethod(method.id as any)}
                      className={cn(
                        'relative flex flex-col items-center gap-2 p-2 pb-2.5 rounded-2xl border transition-all cursor-pointer',
                        on
                          ? 'border-ivory bg-ivory/[0.08]'
                          : 'border-line-2 hover:border-ivory/40',
                      )}
                    >
                      <span className="grid place-items-center w-full h-12 rounded-xl bg-[#f6f1e7] px-3">
                        <Image
                          src={method.icon}
                          alt={method.name}
                          width={90}
                          height={30}
                          className="h-6 w-auto object-contain"
                        />
                      </span>
                      <span
                        className={cn(
                          'lbl !tracking-[0.14em]',
                          on ? 'text-ivory' : 'text-ivory/50',
                        )}
                      >
                        {method.name}
                      </span>
                      {on && (
                        <span className="absolute -top-2 -right-2 grid place-items-center size-6 rounded-full bg-ivory text-night">
                          <Check size={13} strokeWidth={3} />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[24px] border border-line-2 bg-[radial-gradient(90%_120%_at_100%_0%,rgba(200,152,106,0.18),transparent_60%)] p-5 md:p-6">
              <div className="flex items-end justify-between gap-4 flex-wrap">
                <div className="flex flex-col">
                  <span className="lbl text-ivory/45 mb-1.5">
                    {t('total_to_pay')}
                  </span>
                  <span className="text-[28px] md:text-[32px] text-ivory tabular-nums leading-none">
                    {Number(selectedOrder?.total_price).toLocaleString()} söm
                  </span>
                </div>
                <Button
                  onClick={finalizePayment}
                  className="!h-[52px] px-8 max-sm:w-full"
                >
                  {t('pay_now_btn')}
                </Button>
              </div>
              <p className="mt-5 pt-4 border-t border-line text-[12px] text-ivory/50 leading-relaxed">
                {t('rest_will_be_paid_at_delivery')}
              </p>
            </div>
          </div>
        ) : modalMode === 'shipments' ? (
          <div className="p-6 md:p-9 flex flex-col gap-7">
            {header(
              t('shipments_progress_title'),
              t('shipments_progress_desc'),
              true,
            )}
            {(selectedOrder?.shipments?.length ?? 0) > 0 && (
              <div className="rounded-[24px] border border-line bg-surface p-5 md:p-6">
                <OrderProgress shipments={selectedOrder?.shipments || []} />
              </div>
            )}
            <Button onClick={() => setIsCheckoutOpen(false)} className="w-full">
              {t('close_btn')}
            </Button>
          </div>
        ) : (
          <div className="p-6 md:p-9 flex flex-col gap-7">
            <div className="flex flex-col items-center">
              <span className="relative grid place-items-center size-16 rounded-full border border-ok/40 bg-ok/10 text-ok mb-5">
                <span className="absolute inset-0 rounded-full border border-ok/30 animate-ping [animation-iteration-count:2]" />
                <Check size={28} strokeWidth={2.5} />
              </span>
              {header(
                t('order_received_title'),
                t('order_received_desc'),
                true,
              )}
            </div>
            {thumbs('sm')}
            {(selectedOrder?.shipments?.length ?? 0) > 0 && (
              <div className="rounded-[24px] border border-line bg-surface p-5 md:p-6">
                <OrderProgress shipments={selectedOrder?.shipments || []} />
              </div>
            )}
            <Button onClick={() => setIsCheckoutOpen(false)} className="w-full">
              {t('close_btn')}
            </Button>
          </div>
        )}
        <ModalClose>
          <X />
        </ModalClose>
      </ModalContent>
    </Modal>
  );
}

export default React.memo(Checkout);
