export const revalidate = 3600;

import type { Metadata } from 'next';
import { routing } from '@/shared/config/i18n/routing';
import { PRODUCT_INFO } from '@/shared/constants/data';
import NewArrivalsPageClient from './NewArrivalsPageClient';

interface NewPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({
  params,
}: NewPageProps): Promise<Metadata> {
  const { locale } = await params;
  const baseUrl = 'https://akbw.uz';
  const canonicalUrl = `${baseUrl}/${locale}/new`;

  return {
    title: `New Arrivals - ${PRODUCT_INFO.name}`,
    description: `Discover the latest fashion arrivals at ${PRODUCT_INFO.fullName}. New products added regularly.`,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: canonicalUrl,
      languages: Object.fromEntries(
        routing.locales.map((loc) => [loc, `${baseUrl}/${loc}/new`]),
      ),
    },
    openGraph: {
      type: 'website',
      locale: locale,
      url: canonicalUrl,
      title: `New Arrivals - ${PRODUCT_INFO.name}`,
      description: `Discover the latest fashion arrivals at ${PRODUCT_INFO.fullName}. New products added regularly.`,
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
      title: `New Arrivals - ${PRODUCT_INFO.name}`,
      description: `Discover the latest fashion arrivals at ${PRODUCT_INFO.fullName}. New products added regularly.`,
      images: [PRODUCT_INFO.logo],
    },
  };
}

export default async function NewPage(_params: NewPageProps) {
  return <NewArrivalsPageClient />;
}
