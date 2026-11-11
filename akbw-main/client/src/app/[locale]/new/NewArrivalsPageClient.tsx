'use client';

import { useTranslations } from 'next-intl';
import { useRecommendedProducts } from '@/features/products/lib/hooks';
import ProductCard from '@/widgets/product';
import { Button } from '@/shared/ui/button';
import { ArrowRight, Sparkles, Trophy } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

export default function NewArrivalsPageClient() {
  const t = useTranslations('NewArrivalsPage');
  const { data: recommendedData, isLoading } = useRecommendedProducts();

  const newArrivals = recommendedData?.newest || [];

  return (
    <div className="min-h-screen bg-linear-to-b from-white to-gray-50">
      <div className="container section-padding">
        {/* Hero Section */}
        <div className="mb-12 md:mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-8 bg-black rounded-full" />
            <h1 className="font-display text-3xl md:text-4xl font-bold text-black">
              {t('title', { fallback: "Yangi Qo'shilganlar" })}
            </h1>
            <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mb-8">
            {t('description', {
              fallback:
                "So'nggi 30 kun ichida qo'shilgan yangi mahsulotlarimiz",
            })}
          </p>
          <div className="flex flex-wrap gap-4">
            <Button
              asChild
              size="lg"
              className="rounded-full bg-akbw-black/50 hover:bg-akbw-black text-white font-bold uppercase shadow-xl"
            >
              <Link href="/filters">
                {t('view_all_products', { fallback: 'Barcha mahsulotlar' })}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-full border border-black/20 text-akbw-black hover:bg-white/80 hover:border-black font-bold uppercase bg-white/50 shadow-xl"
            >
              <Link href="/best">
                {t('view_best_sellers', {
                  fallback: "Eng ko'p sotilayotganlar",
                })}
                <Trophy className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Products Grid */}
        <Suspense fallback={<ProductsLoadingSkeleton />}>
          {isLoading ? (
            <ProductsLoadingSkeleton />
          ) : newArrivals.length > 0 ? (
            <>
              <div className="mb-8">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-2xl font-bold text-black">
                    {t('latest_arrivals', { fallback: "So'nggi yangiliklar" })}{' '}
                    <span className="text-gray-400">
                      ({newArrivals.length})
                    </span>
                  </h2>
                  <p className="text-sm text-gray-500">
                    {t('updated_daily', { fallback: 'Kunlik yangilanadi' })}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                {newArrivals.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                <Sparkles className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-700 mb-3">
                {t('no_new_arrivals', {
                  fallback: "Hali yangi mahsulotlar yo'q",
                })}
              </h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                {t('check_back_soon', {
                  fallback: "Tez orada yangi mahsulotlar qo'shiladi",
                })}
              </p>
              <Button
                asChild
                size="lg"
                className="rounded-full bg-akbw-black/50 hover:bg-akbw-black text-white font-bold uppercase shadow-xl"
              >
                <Link href="/filters">
                  {t('browse_all_products', {
                    fallback: "Barcha mahsulotlarni ko'rish",
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
