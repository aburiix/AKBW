'use client';

import { colorToCss } from '@/shared/lib/colorToCss';
import { useProduct, useProducts } from '@/features/products/lib/hooks';
import React, { Suspense, useMemo, useRef, useState } from 'react';
import { useCartStore } from '@/shared/store/cart.store';
import { Star, Minus, Plus, Check, ShoppingBag } from 'lucide-react';
import ProductCard from '@/widgets/product';
import { cn } from '@/shared/lib/utils';
import { toast } from '@/shared/ui/toast';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import ReviewView from './ReviewView';
import Faq from './Faq';

interface ProductProps {
  id: string;
}

export default function Product({ id }: ProductProps) {
  const [selectedColor, setSelectedColor] = useState<number | null>(null);
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<string>('reviews');
  const [activeImage, setActiveImage] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);

  const { data: relatedProducts } = useProducts({ limit: 4 });
  const { data: product, isLoading, error } = useProduct(id);
  const addItem = useCartStore((s) => s.addItem);

  const t = useTranslations('ProductPage');
  const tUi = useTranslations('Ui');

  const productImages = useMemo(() => {
    if (product?.product_images && product.product_images.length > 0) {
      return product.product_images;
    }
    return ['/assets/product.png'];
  }, [product?.product_images]);

  const defaultsApplied = useRef(false);
  React.useEffect(() => {
    if (product && !defaultsApplied.current) {
      defaultsApplied.current = true;
      if (product.colors?.length > 0) {
        setSelectedColor(product.colors[0].id);
      }
      if (product.sizes?.length > 0) {
        setSelectedSize(product.sizes[0].id);
      }
    }
  }, [product]);

  if (isLoading) {
    return (
      <div className="wrap pt-6 md:pt-10 pb-16 animate-pulse">
        <div className="h-3 w-48 rounded bg-ivory/[0.06] mb-8" />
        <div className="grid lg:grid-cols-[1.15fr_1fr] gap-8 xl:gap-14">
          <div className="aspect-[4/5] rounded-[28px] bg-ivory/[0.05]" />
          <div className="space-y-4 pt-4">
            <div className="h-3 w-24 rounded bg-ivory/[0.06]" />
            <div className="h-12 w-3/4 rounded-xl bg-ivory/[0.07]" />
            <div className="h-8 w-40 rounded-xl bg-ivory/[0.06]" />
            <div className="h-24 w-full rounded-2xl bg-ivory/[0.04]" />
            <div className="h-14 w-full rounded-full bg-ivory/[0.06]" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="wrap min-h-[70vh] grid place-items-center text-center">
        <div className="flex flex-col items-center gap-3">
          <span className="font-display text-[44px] text-ivory/15">AKBW</span>
          <h2 className="serif text-[32px] text-ivory">{tUi('pnf_title')}</h2>
          <p className="text-ivory/50">{tUi('pnf_text')}</p>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!product) return;

    const colorName = product.colors?.find((c) => c.id === selectedColor)?.name;
    const sizeName = product.sizes?.find((s) => s.id === selectedSize)?.name;

    addItem(product, quantity, sizeName, colorName);

    toast.success(t('add_to_cart_success', { name: product.name }), {
      description: `${quantity} dona, ${colorName ? `rang: ${colorName}, ` : ''}${sizeName ? `o'lcham: ${sizeName}` : ''}`,
    });
  };

  const colorName = product.colors?.find((c) => c.id === selectedColor)?.name;
  const sizeName = product.sizes?.find((s) => s.id === selectedSize)?.name;
  const oldPrice =
    product.discount > 0
      ? Math.round(product.price * (1 + product.discount / 100))
      : null;
  const categoryName = product.categories?.[0]?.name;

  return (
    <div className="min-h-screen">
      <div className="wrap pt-5 md:pt-8 pb-28 md:pb-10">
        {/* Yo'l */}
        <nav className="flex items-center gap-2 lbl text-ivory/40 mb-6 md:mb-8 overflow-hidden">
          <span className="shrink-0">{t('breadcrumbs.0')}</span>
          <span className="shrink-0">/</span>
          <span className="shrink-0">{t('breadcrumbs.1')}</span>
          <span className="shrink-0">/</span>
          <span className="text-ivory/75 truncate">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-6 md:gap-10 xl:gap-16 items-start">
          {/* Galereya */}
          <div className="flex flex-col-reverse md:flex-row gap-3 md:gap-4 lg:sticky lg:top-28">
            {productImages.length > 1 && (
              <div className="flex md:flex-col gap-2.5 overflow-x-auto md:overflow-y-auto no-scrollbar md:w-[84px] md:max-h-[640px] shrink-0">
                {productImages.map((img, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={cn(
                      'relative shrink-0 w-[68px] md:w-full aspect-[3/4] rounded-2xl overflow-hidden border transition-all cursor-pointer',
                      activeImage === idx
                        ? 'border-ivory'
                        : 'border-line opacity-55 hover:opacity-100',
                    )}
                  >
                    <Image
                      src={img}
                      alt={`thumbnail-${idx}`}
                      fill
                      className="object-cover"
                      sizes="84px"
                    />
                  </button>
                ))}
              </div>
            )}
            <div className="relative flex-1 aspect-[4/5] rounded-[28px] overflow-hidden border border-line bg-surface-2">
              <Image
                key={activeImage}
                src={productImages[activeImage]}
                alt={product.name}
                fill
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-cover animate-in fade-in duration-500"
                priority
              />
              {product.discount > 0 && (
                <span className="absolute top-4 left-4 rounded-full bg-sale text-night px-3 py-1.5 lbl !tracking-[0.12em]">
                  −{product.discount}%
                </span>
              )}
              {productImages.length > 1 && (
                <span className="absolute bottom-4 right-4 glass !bg-night/40 rounded-full px-3 py-1.5 lbl text-ivory tabular-nums">
                  {activeImage + 1} / {productImages.length}
                </span>
              )}
            </div>
          </div>

          {/* Ma'lumot */}
          <div className="flex flex-col">
            {categoryName && (
              <span className="lbl text-ivory/45 mb-3">{categoryName}</span>
            )}
            <h1 className="serif text-[34px] sm:text-[44px] xl:text-[54px] leading-[1.02] text-ivory">
              {product.name}
            </h1>

            <div className="flex items-center gap-3 mt-4">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star
                    key={idx}
                    size={15}
                    className={
                      product.rating != null && idx < product.rating
                        ? 'text-star'
                        : 'text-ivory/20'
                    }
                    fill="currentColor"
                  />
                ))}
              </div>
              <span className="text-[13px] text-ivory/55">
                {product.rating == null
                  ? t('rating.notRated')
                  : `${product.rating} / 5`}
              </span>
            </div>

            <div className="flex items-baseline gap-3 mt-6">
              <span
                className={cn(
                  'text-[28px] sm:text-[32px] tabular-nums',
                  oldPrice ? 'text-sale' : 'text-ivory',
                )}
              >
                {product.price.toLocaleString()} so&apos;m
              </span>
              {oldPrice && (
                <span className="text-ivory/35 line-through tabular-nums">
                  {oldPrice.toLocaleString()}
                </span>
              )}
            </div>

            {product.description && (
              <p className="mt-5 text-ivory/60 leading-relaxed text-[15px] max-w-xl">
                {product.description}
              </p>
            )}

            <div className="mt-8 rounded-[26px] border border-line bg-surface p-5 md:p-6 flex flex-col gap-7">
              {product.colors?.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    <h3 className="lbl text-ivory/45">{t('selectColor')}</h3>
                    <span className="text-[13px] text-ivory/75">
                      {colorName}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {product.colors.map((color) => (
                      <button
                        type="button"
                        key={color.id}
                        title={color.name}
                        aria-label={color.name}
                        onClick={() => setSelectedColor(color.id)}
                        className={cn(
                          'size-11 rounded-full grid place-items-center transition-all cursor-pointer ring-offset-[3px] ring-offset-surface',
                          selectedColor === color.id
                            ? 'ring-2 ring-ivory'
                            : 'hover:ring-1 hover:ring-ivory/40',
                        )}
                      >
                        <span
                          style={{ backgroundColor: colorToCss(color.name) }}
                          className="size-9 rounded-full border border-line-2 grid place-items-center"
                        >
                          {selectedColor === color.id && (
                            <Check
                              size={15}
                              className="text-ivory mix-blend-difference"
                            />
                          )}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {product.sizes?.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    <h3 className="lbl text-ivory/45">{t('selectSize')}</h3>
                    <span className="text-[13px] text-ivory/75">
                      {sizeName}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                    {product.sizes.map((size) => (
                      <button
                        type="button"
                        key={size.id}
                        onClick={() => setSelectedSize(size.id)}
                        className={cn(
                          'h-12 rounded-xl border text-[14px] transition-all cursor-pointer',
                          selectedSize === size.id
                            ? 'bg-ivory text-night border-ivory'
                            : 'border-line-2 text-ivory/70 hover:border-ivory/50 hover:text-ivory',
                        )}
                      >
                        {size.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <div className="flex items-center justify-between h-[52px] w-[132px] shrink-0 rounded-full border border-line-2 px-2">
                  <button
                    type="button"
                    aria-label={t('quantity.decrease')}
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="grid place-items-center size-9 rounded-full text-ivory/60 hover:text-ivory hover:bg-ivory/[0.06] cursor-pointer"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="text-[16px] text-ivory tabular-nums">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    aria-label={t('quantity.increase')}
                    onClick={() => setQuantity((q) => q + 1)}
                    className="grid place-items-center size-9 rounded-full text-ivory/60 hover:text-ivory hover:bg-ivory/[0.06] cursor-pointer"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="pill pill-ivory flex-1 !h-[52px] cursor-pointer active:scale-[0.98]"
                >
                  <ShoppingBag size={16} />
                  {t('addToCart')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Izohlar / savollar */}
        <div className="mt-16 md:mt-24">
          <div className="inline-flex p-1 rounded-full border border-line-2 bg-ivory/[0.03]">
            {[
              { name: t('tabs.reviews'), id: 'reviews' },
              { name: t('tabs.faqs'), id: 'faqs' },
            ].map((tab) => (
              <button
                type="button"
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'h-10 px-5 md:px-7 rounded-full lbl !tracking-[0.14em] transition-all cursor-pointer',
                  activeTab === tab.id
                    ? 'bg-ivory text-night'
                    : 'text-ivory/55 hover:text-ivory',
                )}
              >
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 mb-16">
          <Suspense fallback={<div className="text-ivory/40">…</div>}>
            <ReviewView activeTab={activeTab} productId={id} />
          </Suspense>

          <Suspense fallback={<div className="text-ivory/40">…</div>}>
            <Faq activeTab={activeTab} />
          </Suspense>
        </div>

        {/* O'xshash mahsulotlar */}
        {relatedProducts?.data?.length ? (
          <section className="mt-10 pt-12 md:pt-16 border-t border-line">
            <div className="flex items-end justify-between mb-6 md:mb-8">
              <h2 className="serif text-[30px] md:text-[44px] leading-none text-ivory">
                {t('relatedProductsTitle')}
              </h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-2.5 gap-y-6 md:gap-x-3.5 md:gap-y-7">
              {relatedProducts.data.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </section>
        ) : null}
      </div>

      {/* Telefonda pastda doim ko'rinadigan "savatga" paneli */}
      <div className="md:hidden fixed left-0 right-0 bottom-[calc(72px+env(safe-area-inset-bottom))] z-30 px-3 pb-2">
        <div className="glass !bg-surface-2/95 rounded-full flex items-center gap-3 pl-5 pr-1.5 py-1.5 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.8)]">
          <div className="flex flex-col min-w-0">
            <span className="text-[15px] text-ivory tabular-nums leading-tight">
              {product.price.toLocaleString()} so&apos;m
            </span>
            <span className="text-[11px] text-ivory/45 truncate">
              {[sizeName, colorName, `${quantity} dona`]
                .filter(Boolean)
                .join(' · ')}
            </span>
          </div>
          <button
            type="button"
            onClick={handleAddToCart}
            className="pill pill-ivory pill-sm ml-auto !h-11 cursor-pointer active:scale-[0.98]"
          >
            <ShoppingBag size={15} />
            {t('addToCart')}
          </button>
        </div>
      </div>
    </div>
  );
}
