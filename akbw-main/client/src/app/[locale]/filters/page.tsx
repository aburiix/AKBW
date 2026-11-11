import FilterPage from '@/features/filters/ui';
import React, { Suspense } from 'react';
import { LoaderCircle } from 'lucide-react';
import type { Metadata } from 'next';
import { routing } from '@/shared/config/i18n/routing';
import { PRODUCT_INFO } from '@/shared/constants/data';

interface FiltersPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({
  params,
}: FiltersPageProps): Promise<Metadata> {
  const { locale } = await params;
  const baseUrl = 'https://akbw.uz';
  const canonicalUrl = `${baseUrl}/${locale}/filters`;

  return {
    title: `Shop All Products - ${PRODUCT_INFO.name}`,
    description: `Browse and filter all fashion products at ${PRODUCT_INFO.fullName}. Find your perfect style.`,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: canonicalUrl,
      languages: Object.fromEntries(
        routing.locales.map((loc) => [loc, `${baseUrl}/${loc}/filters`]),
      ),
    },
    openGraph: {
      type: 'website',
      locale: locale,
      url: canonicalUrl,
      title: `Shop All Products - ${PRODUCT_INFO.name}`,
      description: `Browse and filter all fashion products at ${PRODUCT_INFO.fullName}. Find your perfect style.`,
      siteName: PRODUCT_INFO.name,
      images: [
        {
          url: PRODUCT_INFO.logo,
          width: 1200,
          height: 630,
          alt: PRODUCT_INFO.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `Shop All Products - ${PRODUCT_INFO.name}`,
      description: `Browse and filter all fashion products at ${PRODUCT_INFO.fullName}. Find your perfect style.`,
      images: [PRODUCT_INFO.logo],
    },
  };
}

export default async function page(_params: FiltersPageProps) {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center w-full h-full">
          <LoaderCircle className="w-8 h-8 text-gray-400 animate-spin" />
        </div>
      }
    >
      <FilterPage />
    </Suspense>
  );
}
