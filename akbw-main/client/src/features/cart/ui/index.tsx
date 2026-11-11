'use client';

import React, { useEffect, useMemo, useState, Suspense } from 'react';
import { ArrowRight, Tag, MapPin, ChevronDown } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { cn } from '@/shared/lib/utils';
import { monsterrat } from '@/shared/fonts';
import { toast } from '@/shared/ui/toast';
import { useCartStore } from '@/shared/store/cart.store';
import { useCreateOrder } from '@/features/order/lib/hooks';
import { useUserStore } from '@/shared/store/user.store';
import { IOrder } from '@/shared/config/api/order/order.model';
import {
  useBtsRegions,
  useBtsCities,
  useApplyCoupon,
  useGetBranches,
  useCalculateDelivery,
} from '../lib/hooks';
import { IBtsBranch } from '@/shared/config/api/bts/bts.model';
import { useTranslations } from 'next-intl';
import DeliveryBranches from './deliveryBranches';
import Checkout from './Checkout';
import OrderView from './OrderView';
import CartItems from './CartItems';

export default function Cart() {
  const cartItems = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const { token } = useUserStore();

  const [paymentMethod, setPaymentMethod] = useState<
    'payme' | 'click' | 'paynet'
  >('payme');
  const [selectedBranch, setSelectedBranch] = useState<IBtsBranch | null>(null);
  const [modalMode, setModalMode] = useState<
    'checkout' | 'tracking' | 'shipments'
  >('checkout');
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);
  const [deliveryPrice, setDeliveryPrice] = useState<number>(0);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [detailedAddress, setDetailedAddress] = useState<string>('');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [discountId, setDiscountId] = useState<number>(0);
  const [promoCode, setPromoCode] = useState<string>('');
  const [district, setDistrict] = useState<string>('');
  const [region, setRegion] = useState<string>('');

  const {
    data: citiesData,
    isLoading: isCitiesLoading,
    error: btsCitiesGettingError,
  } = useBtsCities(region);
  const {
    data: regionsData,
    isLoading: isRegionsLoading,
    error: btsGettingError,
  } = useBtsRegions();
  const { data: branchesData, error: btsBranchesGettingError } = useGetBranches(
    { regionCode: region, cityCode: district },
  );

  const calculateDelivery = useCalculateDelivery();
  const createOrderMutation = useCreateOrder();
  const applyCouponMutation = useApplyCoupon();

  useEffect(() => {
    if (btsGettingError) {
      toast.error(t('bts_getting_error'));
    } else if (btsCitiesGettingError) {
      toast.error(t('bts_cities_getting_error'));
    } else if (btsBranchesGettingError) {
      toast.error(t('bts_branches_getting_error'));
    }
  }, [btsGettingError, btsCitiesGettingError, btsBranchesGettingError]);

  useEffect(() => {
    if (selectedBranch === null) {
      return;
    }

    calculateDelivery.mutate(
      {
        receiverCityCode: selectedBranch.cityCode,
        products: cartItems.map((item) => ({
          productId: item.id.toString(),
          quantity: item.quantity.toString(),
        })),
      },
      {
        onSuccess: (data) => {
          setDeliveryPrice(data.total_price);
        },
        onError: () => {
          setDeliveryPrice(0);
        },
      },
    );
  }, [selectedBranch?.code]);

  useEffect(() => {
    if (!isCheckoutOpen) {
      setSelectedBranch(null);
      setDeliveryPrice(0);
      setRegion('');
      setDistrict('');
      setDetailedAddress('');
    }
  }, [isCheckoutOpen]);

  const t = useTranslations('Cart');

  const handleApplyPromoCode = async () => {
    if (!promoCode) {
      toast.error(t('promo_code_required'));
      return;
    }

    if (appliedDiscount > 0) {
      toast.error(t('promo_code_already_applied'));
      return;
    }

    try {
      const res = await applyCouponMutation.mutateAsync({ code: promoCode });
      if (res.success) {
        setAppliedDiscount(res.coupon.discount);
        setDiscountId(res.coupon.id);
        toast.success(t('promo_code_success'), {
          description: t('promo_code_discount_desc', {
            discount: res.coupon.discount,
          }),
        });
      }
    } catch (error: any) {
      toast.error(t('promo_code_invalid'), {
        description:
          error?.response?.data?.error || t('promo_code_not_found_or_expired'),
      });
    }
  };

  const subtotal = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0),
    [cartItems],
  );
  const discount = useMemo(
    () => Math.round(subtotal * (appliedDiscount / 100)),
    [appliedDiscount, subtotal],
  );
  const deliveryFee = useMemo(
    () => (cartItems.length > 0 ? deliveryPrice : 0),
    [cartItems, deliveryPrice],
  );
  const total = useMemo(
    () => (cartItems.length > 0 ? subtotal - discount + deliveryFee : 0),
    [cartItems, subtotal, discount, deliveryFee],
  );

  const handleCheckout = async () => {
    if (!token) {
      toast.error(t('login_required'));
      return;
    }

    try {
      const items = cartItems.map((item) => {
        const sizeId = item.selectedSize
          ? item.sizes.find((s) => s.name === item.selectedSize)?.id
          : null;
        const colorId = item.selectedColor
          ? item.colors.find((c) => c.name === item.selectedColor)?.id
          : null;

        return {
          productId: item.id,
          sizeId: sizeId || null,
          colorId: colorId || null,
          quantity: item.quantity,
        };
      });

      if (selectedBranch === null) {
        toast.error(t('branch_selection_required'));
        return;
      }

      await createOrderMutation.mutateAsync({
        items,
        total_price: total,
        coupon_id: appliedDiscount > 0 ? discountId : undefined,
        selectedBranch,
      });

      clearCart();
      toast.success(t('order_submitted'));
    } catch {
      toast.error(t('order_submit_error'));
    }
  };

  const handleRemovePromoCode = () => {
    setAppliedDiscount(0);
    setDiscountId(0);
    setPromoCode('');
    toast.success(t('promo_code_removed'));
  };

  return (
    <div className={cn('min-h-screen', 'bg-[#F6F4F0]')}>
      <div className={cn('container', 'py-10', 'px-4', 'md:px-6')}>
        <div
          className={cn('flex', 'gap-2', 'text-sm', 'text-gray-500', 'mb-10')}
        >
          <span>{t('breadcrumb_home')}</span>
          <span>/</span>
          <span className={cn('text-black', 'font-medium')}>
            {t('breadcrumb_cart')}
          </span>
        </div>

        <h1
          className={cn(
            'text-4xl md:text-5xl font-black uppercase mb-10',
            monsterrat.className,
          )}
        >
          {t('title')}
        </h1>

        <div
          className={cn(
            'flex',
            'flex-col',
            'lg:flex-row',
            'gap-8',
            'items-start',
            'mb-20',
          )}
        >
          <CartItems />

          <div
            className={cn(
              'w-full',
              'lg:w-105',
              'bg-[#D6D3CC]',
              'border',
              'border-white/20',
              'shadow-2xl',
              'shadow-black/5',
              'rounded-[40px]',
              'p-8',
              'space-y-8',
              'sticky',
              'top-24',
            )}
          >
            <h2
              className={cn(
                'text-2xl',
                'font-black',
                'uppercase',
                'tracking-tight',
              )}
            >
              {t('order_summary')}
            </h2>

            <div className="space-y-4">
              <div className="space-y-4">
                <h3
                  className={cn(
                    'font-bold',
                    'text-lg',
                    'flex',
                    'items-center',
                    'gap-2',
                    'text-black',
                  )}
                >
                  <MapPin size={20} />
                  {t('delivery_address')}
                </h3>
                <div className={cn('grid', 'grid-cols-2', 'gap-4', "max-sm:grid-cols-1")}>
                  <div className="space-y-1.5">
                    {btsCitiesGettingError || btsGettingError ? (
                      <label
                        className={cn(
                          'text-[10px]',
                          'font-bold',
                          'uppercase',
                          'tracking-widest',
                          'px-1',
                        )}
                      >
                        {t('bts_try_again_error')}
                      </label>
                    ) : (
                      <label
                        className={cn(
                          'text-[10px]',
                          'font-bold',
                          'uppercase',
                          'tracking-widest',
                          'text-black/50',
                          'px-1',
                        )}
                      >
                        {t('region')}
                      </label>
                    )}
                    <div className="relative">
                      <select
                        value={region}
                        onChange={(e) => {
                          setRegion(e.target.value);
                          setDistrict('');
                        }}
                        className={cn(
                          'w-full',
                          'bg-gray-50',
                          'border-none',
                          'rounded-2xl',
                          'h-14',
                          'px-5',
                          'text-sm',
                          'font-semibold',
                          'appearance-none',
                          'cursor-pointer',
                          'focus:ring-2',
                          'focus:ring-black/5',
                        )}
                        disabled={isRegionsLoading}
                      >
                        <option value="">
                          {isRegionsLoading ? t('loading') : t('select_region')}
                        </option>
                        {regionsData?.data?.items?.map((r) => (
                          <option key={r.code} value={r.code}>
                            {r.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={18}
                        className={cn(
                          'absolute',
                          'right-4',
                          'top-1/2',
                          '-translate-y-1/2',
                          'text-black/50',
                          'pointer-events-none',
                        )}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label
                      className={cn(
                        'text-[10px]',
                        'font-bold',
                        'uppercase',
                        'tracking-widest',
                        'text-black/50',
                        'px-1',
                      )}
                    >
                      {t('district')}
                    </label>
                    <div className="relative">
                      <select
                        value={district}
                        disabled={!region || isCitiesLoading}
                        onChange={(e) => setDistrict(e.target.value)}
                        className={cn(
                          'w-full',
                          'bg-gray-50',
                          'border-none',
                          'rounded-2xl',
                          'h-14',
                          'px-5',
                          'text-sm',
                          'font-semibold',
                          'appearance-none',
                          'cursor-pointer',
                          'focus:ring-2',
                          'focus:ring-black/5',
                          'disabled:opacity-50',
                        )}
                      >
                        <option value="">
                          {isCitiesLoading
                            ? t('loading')
                            : t('select_district')}
                        </option>
                        {citiesData?.data?.items?.map((d) => (
                          <option key={d.code} value={d.code}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={18}
                        className={cn(
                          'absolute',
                          'right-4',
                          'top-1/2',
                          '-translate-y-1/2',
                          'text-gray-400',
                          'pointer-events-none',
                        )}
                      />
                    </div>
                  </div>
                </div>
                {region &&
                  district &&
                  branchesData?.data?.items.length &&
                  branchesData.data.items.length > 0 && (
                    <div className="space-y-1.5">
                      {btsBranchesGettingError || btsGettingError ? (
                        <label
                          className={cn(
                            'text-[10px]',
                            'font-bold',
                            'uppercase',
                            'tracking-widest',
                            'text-black/50',
                            'px-1',
                          )}
                        >
                          {t('bts_try_again_error')}
                        </label>
                      ) : (
                        <label
                          className={cn(
                            'text-[10px]',
                            'font-bold',
                            'uppercase',
                            'tracking-widest',
                            'text-black/50',
                            'px-1',
                          )}
                        >
                          {t('choose_delivery_branch')}
                        </label>
                      )}

                      <DeliveryBranches
                        branches={branchesData?.data?.items || []}
                        selectedBranch={selectedBranch}
                        onSelectBranch={setSelectedBranch}
                      />
                    </div>
                  )}

                <div className="space-y-1.5">
                  <label
                    className={cn(
                      'text-[10px]',
                      'font-bold',
                      'uppercase',
                      'tracking-widest',
                      'text-black/50',
                      'px-1',
                    )}
                  >
                    {t('detailed_address_label')}
                  </label>
                  <Input
                    value={detailedAddress}
                    onChange={(e) => setDetailedAddress(e.target.value)}
                    placeholder={t('detailed_address_placeholder')}
                    className={cn(
                      'h-14',
                      'rounded-2xl',
                      'bg-gray-50',
                      'border-none',
                      'placeholder:text-black/50',
                      'placeholder:opacity-50',
                      'px-5',
                      'text-sm',
                      'font-semibold',
                      'focus:ring-2',
                      'focus:ring-black/5',
                    )}
                  />
                </div>
              </div>

              <hr className="border-gray-50" />

              <div className={cn('flex', 'justify-between', 'items-center')}>
                <span
                  className={cn(
                    'text-black/50',
                    'font-bold',
                    'uppercase',
                    'tracking-widest',
                    'text-[10px]',
                  )}
                >
                  {t('subtotal')}
                </span>
                <span className={cn('font-black', 'text-lg')}>
                  {subtotal.toLocaleString()} so&apos;m
                </span>
              </div>
              <div className={cn('flex', 'justify-between', 'items-center')}>
                <span
                  className={cn(
                    'text-black/50',
                    'font-bold',
                    'uppercase',
                    'tracking-widest',
                    'text-[10px]',
                  )}
                >
                  {t('discount')}{' '}
                  {appliedDiscount > 0 ? `(-${appliedDiscount}%)` : ''}
                </span>
                <span className={cn('font-black', 'text-lg', 'text-red-600')}>
                  -{discount.toLocaleString()} so&apos;m
                </span>
              </div>
              <div className={cn('flex', 'justify-between', 'items-center')}>
                <span
                  className={cn(
                    'text-black/50',
                    'font-bold',
                    'uppercase',
                    'tracking-widest',
                    'text-[10px]',
                  )}
                >
                  {t('delivery_fee')}
                </span>
                <span className={cn('font-black', 'text-lg')}>
                  {deliveryFee.toLocaleString()} so&apos;m
                </span>
              </div>

              <div
                className={cn(
                  'flex',
                  'justify-between',
                  'items-center',
                  'py-2',
                )}
              >
                <span
                  className={cn(
                    'text-xs',
                    'font-black',
                    'uppercase',
                    'tracking-widest',
                  )}
                >
                  {t('total')}
                </span>
                <span className={cn('text-3xl', 'font-black')}>
                  {total.toLocaleString()} so&apos;m
                </span>
              </div>
            </div>

            {cartItems.length > 0 && (
              <div className={cn('flex', 'gap-3')}>
                <div className={cn('relative', 'flex-1')}>
                  <span
                    className={cn(
                      'absolute',
                      'left-4',
                      'top-1/2',
                      '-translate-y-1/2',
                      'text-gray-400',
                    )}
                  >
                    <Tag size={20} />
                  </span>
                  <Input
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder={t('promo_placeholder')}
                    className={cn(
                      'pl-12',
                      'rounded-full',
                      'placeholder:text-black/50',
                      'h-14',
                      'bg-white/50',
                      'border-none',
                      'shadow-inner',
                      'text-sm',
                      'focus:bg-white',
                      'transition-all',
                      'font-bold',
                    )}
                  />
                </div>
                <Button
                  onClick={
                    appliedDiscount > 0
                      ? handleRemovePromoCode
                      : handleApplyPromoCode
                  }
                  className={cn(
                    'rounded-full',
                    'px-8',
                    'py-7',
                    'h-14',
                    'font-black',
                    'uppercase',
                    'text-[10px]',
                    'tracking-widest',
                    'bg-black',
                    'text-white',
                    'hover:bg-black/80',
                    'transition-all',
                    'cursor-pointer',
                  )}
                >
                  {appliedDiscount > 0 ? t('remove_promo_btn') : t('apply_btn')}
                </Button>
              </div>
            )}

            <Button
              onClick={handleCheckout}
              disabled={cartItems.length === 0}
              className={cn(
                'w-full',
                'rounded-full',
                'py-9',
                'max-sm:text-[15px]',
                'font-black',
                'text-xs',
                'bg-white',
                'text-black',
                'hover:bg-white/90',
                'shadow-2xl',
                'shadow-black/5',
                'hover:scale-[1.02]',
                'active:scale-[0.98]',
                'transition-all',
                'uppercase',
                'tracking-[0.2em]',
                'flex',
                'items-center',
                'justify-center',
                'gap-3',
                'cursor-pointer',
                'border-none',
                'mt-4',
                "max-sm:text-[10px]",
                "cursor-pointer"
              )}
            >
              {t('checkout_btn')}
              <ArrowRight size={22} />
            </Button>
          </div>
        </div>

        <Suspense fallback={<div>Loading...</div>}>
          <OrderView
            token={token || ''}
            setSelectedOrder={setSelectedOrder}
            setModalMode={setModalMode}
            setIsCheckoutOpen={setIsCheckoutOpen}
          />
        </Suspense>
      </div>

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
