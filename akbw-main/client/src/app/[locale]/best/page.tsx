export const revalidate = 3600;

import type { Metadata } from 'next';
import { routing } from '@/shared/config/i18n/routing';
import { PRODUCT_INFO } from '@/shared/constants/data';
import BestSellersPageClient from './BestSellersPageClient';

interface BestPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({
  params,
}: BestPageProps): Promise<Metadata> {
  const { locale } = await params;
  const baseUrl = 'https://akbw.uz';
  const canonicalUrl = `${baseUrl}/${locale}/best`;

  return {
    title: `Best Sellers - ${PRODUCT_INFO.name}`,
    description: `Shop the best-selling fashion products at ${PRODUCT_INFO.fullName}. Top-rated and most popular items.`,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: canonicalUrl,
      languages: Object.fromEntries(
        routing.locales.map((loc) => [loc, `${baseUrl}/${loc}/best`]),
      ),
    },
    openGraph: {
      type: 'website',
      locale: locale,
      url: canonicalUrl,
      title: `Best Sellers - ${PRODUCT_INFO.name}`,
      description: `Shop the best-selling fashion products at ${PRODUCT_INFO.fullName}. Top-rated and most popular items.`,
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
      title: `Best Sellers - ${PRODUCT_INFO.name}`,
      description: `Shop the best-selling fashion products at ${PRODUCT_INFO.fullName}. Top-rated and most popular items.`,
      images: [PRODUCT_INFO.logo],
    },
  };
}

export default async function BestPage(_props: BestPageProps) {
  return <BestSellersPageClient />;
}
