'use client';

import { markNotified, notifyError } from '@/shared/lib/notify-error';
import React, { useEffect, useMemo, useState, Suspense } from 'react';
import {
  ArrowRight,
  Tag,
  MapPin,
  ChevronDown,
  ChevronLeft,
} from 'lucide-react';
import { Link, useRouter } from '@/shared/config/i18n/navigation';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { cn } from '@/shared/lib/utils';
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
  const router = useRouter();
  // Telefon: ilovadagidek 2 bosqich — savat ro'yxati, keyin buyurtma berish
  const [step, setStep] = useState<'cart' | 'checkout'>('cart');
  const itemCount = cartItems.reduce((n, i) => n + i.quantity, 0);
  const goCheckout = () => {
    if (!token) {
      toast.error(t('login_first'));
      router.push('/profile');
      return;
    }
    setStep('checkout');
    window.scrollTo({ top: 0 });
  };

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

  // BTS xatolari umumiy ushlagichda (QueryProvider) haqiqiy sabab bilan ko'rsatiladi

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
      markNotified(error);
      toast.error(t('promo_code_invalid'), {
        description:
          error?.response?.data?.error || t('promo_code_not_found_or_expired'),
      });
    }
  };

  const subtotal = useMemo(
    // Server bilan bir xil: mahsulot chegirmasi (discount %) har bir dona narxiga qo'llanadi
    () =>
      cartItems.reduce(
        (acc, item) =>
          acc +
          Math.round(item.price * (1 - (item.discount || 0) / 100)) *
            item.quantity,
        0,
      ),
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
    } catch (e) {
      notifyError(e, t('order_submit_error'));
    }
  };

  const handleRemovePromoCode = () => {
    setAppliedDiscount(0);
    setDiscountId(0);
    setPromoCode('');
    toast.success(t('promo_code_removed'));
  };

  return (
    <div className="min-h-screen">
      <div className="wrap pt-6 md:pt-10 pb-10">
        {/* Telefon sarlavhasi (ilovadagidek) */}
        <div className="md:hidden mb-5">
          {step === 'checkout' ? (
            <button
              type="button"
              onClick={() => setStep('cart')}
              className="flex items-center gap-1 lbl text-ivory/50 mb-2"
            >
              <ChevronLeft size={15} /> {t('back_to_cart')}
            </button>
          ) : (
            <span className="lbl text-ivory/45 block mb-2">
              {t('kicker', { n: itemCount })}
            </span>
          )}
          <h1 className="serif text-[36px] leading-none text-ivory">
            {step === 'checkout' ? t('checkout_title') : t('cart_title')}
          </h1>
        </div>

        <div className="hidden md:flex gap-2 lbl text-ivory/40 mb-4">
          <span>{t('breadcrumb_home')}</span>
          <span>/</span>
          <span className="text-ivory/75">{t('breadcrumb_cart')}</span>
        </div>

        <h1 className="hidden md:block serif text-[60px] leading-none text-ivory mb-12">
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
          <div
            className={cn(
              'w-full lg:flex-1 min-w-0',
              step === 'checkout' && 'max-md:hidden',
            )}
          >
            <CartItems />
          </div>

          <div
            className={cn(
              step === 'cart' && 'max-md:hidden',
              'max-md:!p-5',
              'w-full',
              'lg:w-[420px]',
              'shrink-0',
              'bg-surface',
              'border',
              'border-line',
              'rounded-[28px]',
              'p-6 md:p-8',
              'space-y-7',
              'lg:sticky',
              'lg:top-28',
            )}
          >
            <h2 className="serif text-[28px] leading-none text-ivory">
              {t('order_summary')}
            </h2>

            <div className="space-y-4">
              <div className="space-y-4">
                <h3 className="lbl text-ivory/70 flex items-center gap-2">
                  <MapPin size={15} />
                  {t('delivery_address')}
                </h3>
                <div
                  className={cn(
                    'grid',
                    'grid-cols-2',
                    'gap-4',
                    'max-sm:grid-cols-1',
                  )}
                >
                  <div className="space-y-1.5">
                    {btsCitiesGettingError || btsGettingError ? (
                      <label className="lbl text-ivory/45 px-1">
                        {t('bts_try_again_error')}
                      </label>
                    ) : (
                      <label className="lbl text-ivory/45 px-1">
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
                        className="w-full h-12 rounded-2xl border border-line-2 bg-ivory/[0.04] px-4 text-[14px] text-ivory appearance-none cursor-pointer outline-none focus-visible:border-ivory/60 focus-visible:ring-4 focus-visible:ring-ivory/10 disabled:opacity-50 disabled:cursor-not-allowed"
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
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-ivory/45 pointer-events-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="lbl text-ivory/45 px-1">
                      {t('district')}
                    </label>
                    <div className="relative">
                      <select
                        value={district}
                        disabled={!region || isCitiesLoading}
                        onChange={(e) => setDistrict(e.target.value)}
                        className="w-full h-12 rounded-2xl border border-line-2 bg-ivory/[0.04] px-4 text-[14px] text-ivory appearance-none cursor-pointer outline-none focus-visible:border-ivory/60 focus-visible:ring-4 focus-visible:ring-ivory/10 disabled:opacity-50 disabled:cursor-not-allowed"
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
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-ivory/45 pointer-events-none"
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
                        <label className="lbl text-ivory/45 px-1">
                          {t('bts_try_again_error')}
                        </label>
                      ) : (
                        <label className="lbl text-ivory/45 px-1">
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
                  <label className="lbl text-ivory/45 px-1">
                    {t('detailed_address_label')}
                  </label>
                  <Input
                    value={detailedAddress}
                    onChange={(e) => setDetailedAddress(e.target.value)}
                    placeholder={t('detailed_address_placeholder')}
                    className="h-12 rounded-2xl px-4"
                  />
                </div>
              </div>

              <hr className="border-line" />

              <div className={cn('flex', 'justify-between', 'items-center')}>
                <span className="lbl text-ivory/45 px-1">{t('subtotal')}</span>
                <span className="text-[16px] text-ivory tabular-nums">
                  {subtotal.toLocaleString()} söm
                </span>
              </div>
              <div className={cn('flex', 'justify-between', 'items-center')}>
                <span className="lbl text-ivory/45 px-1">
                  {t('discount')}{' '}
                  {appliedDiscount > 0 ? `(-${appliedDiscount}%)` : ''}
                </span>
                <span className="text-[16px] text-sale tabular-nums">
                  -{discount.toLocaleString()} söm
                </span>
              </div>
              <div className={cn('flex', 'justify-between', 'items-center')}>
                <span className="lbl text-ivory/45 px-1">
                  {t('delivery_fee')}
                </span>
                <span className="text-[16px] text-ivory tabular-nums">
                  {deliveryFee.toLocaleString()} söm
                </span>
              </div>

              <div className="flex justify-between items-end pt-4 border-t border-line">
                <span className="lbl text-ivory/70">{t('total')}</span>
                <span className="serif text-[34px] leading-none text-ivory tabular-nums">
                  {total.toLocaleString()} söm
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
                      'text-ivory/40',
                    )}
                  >
                    <Tag size={18} />
                  </span>
                  <Input
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder={t('promo_placeholder')}
                    className="pl-12 rounded-full h-[52px] text-sm"
                  />
                </div>
                <Button
                  onClick={
                    appliedDiscount > 0
                      ? handleRemovePromoCode
                      : handleApplyPromoCode
                  }
                  variant="outline"
                  className="h-[52px] px-6"
                >
                  {appliedDiscount > 0 ? t('remove_promo_btn') : t('apply_btn')}
                </Button>
              </div>
            )}

            <Button
              onClick={handleCheckout}
              disabled={cartItems.length === 0}
              className="w-full !h-14 gap-3 mt-2"
            >
              {t('checkout_btn')}
              <ArrowRight size={18} />
            </Button>
          </div>
        </div>

        {/* Telefon: pastdagi Jami + Buyurtma berish (ilovadagidek) */}
        {step === 'cart' && cartItems.length > 0 && (
          <div className="md:hidden fixed inset-x-0 above-tabbar bottom-[calc(80px+env(safe-area-inset-bottom))] z-30 px-3.5 pb-2">
            <div className="glass !bg-[var(--c-tabbar)] rounded-[26px] border border-line p-3.5 flex flex-col gap-3 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.5)]">
              <div className="flex items-center justify-between px-1.5">
                <span className="lbl text-ivory/50">{t('total')}</span>
                <span className="text-[20px] text-ivory tabular-nums">
                  {total.toLocaleString()} söm
                </span>
              </div>
              <button
                type="button"
                onClick={goCheckout}
                className="pill pill-ivory w-full"
              >
                {t('checkout_title')}
              </button>
            </div>
          </div>
        )}
        {step === 'cart' && cartItems.length > 0 && (
          <div className="md:hidden h-32" aria-hidden />
        )}

        <div className="md:hidden">
          {token && (
            <Link
              href="/orders"
              className="flex items-center justify-between h-[58px] px-4 rounded-[20px] bg-surface border border-line text-[15px] text-ivory"
            >
              {t('my_orders')}{' '}
              <ArrowRight size={17} className="text-ivory/50" />
            </Link>
          )}
        </div>

        <Suspense fallback={<div>Loading...</div>}>
          <div className="hidden md:block">
            <OrderView
              token={token || ''}
              setSelectedOrder={setSelectedOrder}
              setModalMode={setModalMode}
              setIsCheckoutOpen={setIsCheckoutOpen}
            />
          </div>
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
