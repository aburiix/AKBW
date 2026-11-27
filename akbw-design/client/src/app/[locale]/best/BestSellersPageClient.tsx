'use client';

import { useTranslations } from 'next-intl';
import { useRecommendedProducts } from '@/features/products/lib/hooks';
import ProductCard from '@/widgets/product';
import { Button } from '@/shared/ui/button';
import { ArrowRight, Trophy, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

export default function BestSellersPageClient() {
  const t = useTranslations('BestSellersPage');
  const { data: recommendedData, isLoading } = useRecommendedProducts();

  const bestSellers = recommendedData?.mostSold || [];

  return (
    <div className="min-h-screen bg-linear-to-b from-white to-gray-50">
      <div className="container section-padding">
        {/* Hero Section */}
        <div className="mb-12 md:mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-8 bg-black rounded-full" />
            <h1 className="font-display text-3xl md:text-4xl font-bold text-black">
              {t('title', { fallback: "Eng köp sotilayotganlar" })}
            </h1>
            <Trophy className="w-6 h-6 text-yellow-500" />
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mb-8">
            {t('description', {
              fallback: "Eng maşhur va köp sotilayotgan mahsulotlarimiz",
            })}
          </p>
          <div className="flex flex-wrap gap-4">
            <Button
              asChild
              size="lg"
              className="rounded-full bg-akbw-black/50 hover:bg-akbw-black text-white font-bold uppercase shadow-xl"
            >
              <Link href="/filters">
                {t('view_all_products', { fallback: 'Barça mahsulotlar' })}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-full border border-black/20 text-akbw-black hover:bg-white/80 hover:border-black font-bold uppercase bg-white/50 shadow-xl"
            >
              <Link href="/new">
                {t('view_new_arrivals', { fallback: 'Yangi mahsulotlar' })}
                <Sparkles className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Products Grid */}
        <Suspense fallback={<ProductsLoadingSkeleton />}>
          {isLoading ? (
            <ProductsLoadingSkeleton />
          ) : bestSellers.length > 0 ? (
            <>
              <div className="mb-8">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-2xl font-bold text-black">
                    {t('most_popular', { fallback: 'Eng mashhur mahsulotlar' })}{' '}
                    <span className="text-gray-400">
                      ({bestSellers.length})
                    </span>
                  </h2>
                  <p className="text-sm text-gray-500">
                    {t('based_on_sales', { fallback: 'Sotuvlar asosida' })}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                {bestSellers.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                <Trophy className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-700 mb-3">
                {t('no_best_sellers', {
                  fallback: "Hali eng köp sotilayotgan mahsulotlar yöq",
                })}
              </h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                {t('check_back_soon', {
                  fallback: "Tez orada yangi mahsulotlar qöşiladi",
                })}
              </p>
              <Button
                asChild
                size="lg"
                className="rounded-full bg-akbw-black/50 hover:bg-akbw-black text-white font-bold uppercase shadow-xl"
              >
                <Link href="/filters">
                  {t('browse_all_products', {
                    fallback: "Barça mahsulotlarni köriş",
                  })}
                </Link>
              </Button>
            </div>
          )}
        </Suspense>
      </div>
    </div>
  );
}

function ProductsLoadingSkeleton() {
  return (
    <div className="space-y-8">
      <div className="h-8 w-64 bg-gray-200 rounded-lg animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
          >
            <div className="aspect-square bg-gray-200 rounded-xl mb-4 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-3 animate-pulse" />
            <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
