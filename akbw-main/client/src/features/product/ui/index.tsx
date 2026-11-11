'use client';

import { useProduct, useProducts } from '@/features/products/lib/hooks';
import React, { Suspense, useMemo, useRef, useState } from 'react';
import { useCartStore } from '@/shared/store/cart.store';
import { Star, Minus, Plus, Check } from 'lucide-react';
import { monsterrat } from '@/shared/fonts';
import { Button } from '@/shared/ui/button';
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
      <div
        className={cn(
          'min-h-screen',
          'bg-white',
          'flex',
          'items-center',
          'justify-center',
        )}
      >
        <div className="text-center">
          <div
            className={cn(
              'w-16',
              'h-16',
              'border-4',
              'border-black',
              'border-t-transparent',
              'rounded-full',
              'animate-spin',
              'mx-auto',
              'mb-4',
            )}
          />
          <p className="text-gray-500">Mahsulot yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div
        className={cn(
          'min-h-screen',
          'bg-white',
          'flex',
          'items-center',
          'justify-center',
        )}
      >
        <div className="text-center">
          <h2 className={cn('text-2xl', 'font-bold', 'mb-2')}>
            Maxsulot topilmadi!
          </h2>
          <p className="text-gray-500">Siz qidirayotgan maxsulot topilmadi.</p>
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

  return (
    <div className={cn('min-h-screen', 'bg-white')}>
      <div className={cn('container', 'py-4', 'px-4', 'md:px-6')}>
        <div
          className={cn('flex', 'gap-2', 'text-sm', 'text-gray-500', 'mb-10')}
        >
          <span>{t('breadcrumbs.0')}</span>
          <span>/</span>
          <span>{t('breadcrumbs.1')}</span>
          <span>/</span>
          <span className={cn('text-black', 'font-medium')}>
            {product.name}
          </span>
        </div>

        <div
          className={cn(
            'grid',
            'grid-cols-1',
            'lg:grid-cols-2',
            'gap-8',
            'xl:gap-16',
            'items-start',
            'mb-0',
          )}
        >
          <div
            className={cn('flex', 'flex-col-reverse', 'md:flex-row', 'gap-5')}
          >
            <div
              className={cn(
                'flex',
                'md:flex-col',
                'gap-5',
                'overflow-x-auto',
                'md:overflow-y-auto',
                'no-scrollbar',
                'md:w-24',
              )}
            >
              {productImages.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={cn(
                    'relative shrink-0 w-16 h-16',
                    activeImage === idx
                      ? 'border-black shadow-lg scale-95'
                      : 'border-transparent bg-gray-100 opacity-70 hover:opacity-100',
                  )}
                >
                  <Image
                    src={img}
                    alt={`thumbnail-${idx}`}
                    fill
                    className="object-cover rounded-lg cursor-pointer"
                    sizes="64px"
                  />
                </div>
              ))}
            </div>
            <div className={cn('relative', 'w-full', 'overflow-hidden')}>
              <Image
                src={productImages[activeImage]}
                alt="product-main"
                width={800}
                height={1000}
                className={cn(
                  'object-cover',
                  'transition-transform',
                  'duration-700',
                  'w-full',
                  'h-auto',
                  'rounded-2xl',
                )}
                priority
              />
            </div>
          </div>

          <div className={cn('flex', 'flex-col')}>
            <h1
              className={cn(
                'text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-5.5xl font-black uppercase mb-4 leading-tight',
                monsterrat.className,
              )}
            >
              {product.name}
            </h1>

            <div className={cn('flex', 'items-center', 'gap-2 sm:gap-3', 'mb-4 sm:mb-6')}>
              <div className={cn('flex', 'gap-1')}>
                {product.rating == null ? (
                  <Star size={18} className="text-gray-400" />
                ) : (
                  Array.from({ length: product.rating }).map((_, idx) => (
                    <Star
                      key={idx}
                      size={18}
                      className="text-yellow-400"
                      fill="currentColor"
                    />
                  ))
                )}
              </div>
              <span className={cn('text-sm', 'font-medium')}>
                {product.rating === null ? (
                  <p>{t('rating.notRated')}</p>
                ) : (
                  <>
                    {product.rating} /{' '}
                    <span className={cn('text-gray-400', 'font-normal')}>
                      5
                    </span>
                  </>
                )}
              </span>
            </div>

            <div className={cn('flex', 'items-center', 'gap-3 sm:gap-4', 'mb-6 sm:mb-8')}>
              <span className={cn('text-2xl sm:text-3xl', 'font-bold')}>
                {product.price.toLocaleString()} so&apos;m
              </span>
            </div>

            <p
              className={cn(
                'text-gray-500',
                'leading-relaxed',
                'mb-8 sm:mb-10',
                'text-sm sm:text-base md:text-lg',
                'max-w-xl',
              )}
            >
              {product.description}
            </p>

            <hr className={cn('border-gray-100', 'mb-8')} />

            <div className="mb-8">
              <h3
                className={cn(
                  'text-gray-500',
                  'font-medium',
                  'mb-4',
                  'uppercase',
                  'tracking-widest',
                  'text-xs',
                )}
              >
                {t('selectColor')}
              </h3>
              <div className={cn('flex', 'gap-4')}>
                {product.colors?.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => setSelectedColor(color.id)}
                    style={{ backgroundColor: color.name }}
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-sm border-2 cursor-pointer',
                      selectedColor === color.id
                        ? 'border-black ring-4 ring-black/5'
                        : 'border-transparent',
                    )}
                  >
                    {selectedColor === color.id && (
                      <Check size={18} className="text-white" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <hr className={cn('border-gray-100', 'mb-8')} />

            <div className="mb-10">
              <h3
                className={cn(
                  'text-gray-500',
                  'font-medium',
                  'mb-4',
                  'uppercase',
                  'tracking-widest',
                  'text-xs',
                )}
              >
                {t('selectSize')}
              </h3>
              <div className={cn('flex', 'flex-wrap', 'gap-3')}>
                {product.sizes?.map((size) => (
                  <button
                    key={size.id}
                    onClick={() => setSelectedSize(size.id)}
                    className={cn(
                      'px-7 py-3 rounded-full text-sm font-semibold transition-all border cursor-pointer',
                      selectedSize === size.id
                        ? 'bg-black text-white border-black shadow-xl scale-105'
                        : 'bg-gray-100 border-transparent text-gray-500 hover:border-black/20 hover:text-black',
                    )}
                  >
                    {size.name}
                  </button>
                ))}
              </div>
            </div>

            <hr className={cn('border-gray-100', 'mb-10')} />

            <div className={cn('flex', 'flex-col', 'sm:flex-row', 'gap-5')}>
              <div
                className={cn(
                  'flex',
                  'items-center',
                  'justify-between',
                  'bg-gray-100',
                  'rounded-full',
                  'px-6',
                  'py-4',
                  'w-full',
                  'sm:w-44',
                )}
              >
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className={cn(
                    'hover:text-black',
                    'transition-colors',
                    'opacity-60',
                    'hover:opacity-100',
                    'cursor-pointer',
                  )}
                >
                  <Minus size={22} />
                </button>
                <span className={cn('font-bold', 'text-lg')}>{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className={cn(
                    'hover:text-black',
                    'transition-colors',
                    'opacity-60',
                    'hover:opacity-100',
                    'cursor-pointer',
                  )}
                >
                  <Plus size={22} />
                </button>
              </div>
              <Button
                onClick={handleAddToCart}
                className={cn(
                  'flex-1',
                  'rounded-full',
                  'cursor-pointer',
                  'h-full',
                  'py-8',
                  'font-black',
                  'text-lg',
                  'bg-black',
                  'hover:bg-black/90',
                  'shadow-2xl',
                  'hover:shadow-black/20',
                  'transition-all',
                  'uppercase',
                  'tracking-widest',
                )}
              >
                {t('addToCart')}
              </Button>
            </div>
          </div>
        </div>

        <div className={cn('border-b', 'border-gray-100', 'mt-10')}>
          <div
            className={cn(
              'flex',
              'justify-between',
              'md:justify-around',
              'overflow-x-auto',
              'no-scrollbar',
            )}
          >
            {[
              { name: t('tabs.reviews'), id: 'reviews' },
              { name: t('tabs.faqs'), id: 'faqs' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'pb-4 sm:pb-6 px-6 sm:px-10 text-sm sm:text-base md:text-lg font-medium transition-all relative shrink-0 cursor-pointer',
                  activeTab === tab.id
                    ? 'text-black'
                    : 'text-gray-400 hover:text-gray-600',
                )}
              >
                {tab.name}
                {activeTab === tab.id && (
                  <div
                    className={cn(
                      'absolute',
                      'bottom-0',
                      'left-0',
                      'w-full',
                      'h-0.5',
                      'bg-black',
                      'transition-all',
                    )}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-20">
          <Suspense fallback={<div>Loading...</div>}>
            <ReviewView activeTab={activeTab} productId={id} />
          </Suspense>

          <Suspense fallback={<div>Loading...</div>}>
            <Faq activeTab={activeTab} />
          </Suspense>
        </div>

        <div
          className={cn(
            'mt-32',
            'border-t',
            'border-gray-100',
            'pt-32',
            'pb-20',
          )}
        >
          <h2
            className={cn(
              'text-4xl font-bold text-center uppercase my-10 max-sm:text-[20px]',
              monsterrat.className,
            )}
          >
            {t('relatedProductsTitle')}
          </h2>
          <div
            className={cn(
              'grid',
              'grid-cols-1',
              'sm:grid-cols-2',
              'lg:grid-cols-4',
              'gap-8',
            )}
          >
            {relatedProducts?.data?.map((relatedProduct) => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
