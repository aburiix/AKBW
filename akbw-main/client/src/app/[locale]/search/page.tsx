import SearchPage from '@/features/search/ui';
import React from 'react';
import type { Metadata } from 'next';
import { routing } from '@/shared/config/i18n/routing';
import { PRODUCT_INFO } from '@/shared/constants/data';

interface SearchPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({
  params,
}: SearchPageProps): Promise<Metadata> {
  const { locale } = await params;
  const baseUrl = 'https://akbw.uz';
  const canonicalUrl = `${baseUrl}/${locale}/search`;

  return {
    title: `Search - ${PRODUCT_INFO.name}`,
    description: `Search for fashion products at ${PRODUCT_INFO.fullName}. Find exactly what you're looking for.`,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: canonicalUrl,
      languages: Object.fromEntries(
        routing.locales.map((loc) => [loc, `${baseUrl}/${loc}/search`]),
      ),
    },
    openGraph: {
      type: 'website',
      locale: locale,
      url: canonicalUrl,
      title: `Search - ${PRODUCT_INFO.name}`,
      description: `Search for fashion products at ${PRODUCT_INFO.fullName}. Find exactly what you're looking for.`,
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
      title: `Search - ${PRODUCT_INFO.name}`,
      description: `Search for fashion products at ${PRODUCT_INFO.fullName}. Find exactly what you're looking for.`,
      images: [PRODUCT_INFO.logo],
    },
  };
}

export default async function page(_params: SearchPageProps) {
  return <SearchPage />;
}
