import Cart from '@/features/cart/ui';
import React from 'react';
import type { Metadata } from 'next';
import { routing } from '@/shared/config/i18n/routing';
import { PRODUCT_INFO } from '@/shared/constants/data';

interface CartPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({
  params,
}: CartPageProps): Promise<Metadata> {
  const { locale } = await params;
  const baseUrl = 'https://akbw.uz';
  const canonicalUrl = `${baseUrl}/${locale}/cart`;

  return {
    title: `Shopping Cart - ${PRODUCT_INFO.name}`,
    description: `View your shopping cart at ${PRODUCT_INFO.fullName}. Checkout your selected fashion items.`,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: canonicalUrl,
      languages: Object.fromEntries(
        routing.locales.map((loc) => [loc, `${baseUrl}/${loc}/cart`]),
      ),
    },
    openGraph: {
      type: 'website',
      locale: locale,
      url: canonicalUrl,
      title: `Shopping Cart - ${PRODUCT_INFO.name}`,
      description: `View your shopping cart at ${PRODUCT_INFO.fullName}. Checkout your selected fashion items.`,
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
      title: `Shopping Cart - ${PRODUCT_INFO.name}`,
      description: `View your shopping cart at ${PRODUCT_INFO.fullName}. Checkout your selected fashion items.`,
      images: [PRODUCT_INFO.logo],
    },
  };
}

export default async function page(_params: CartPageProps) {
  return (
    <>
      <Cart />
    </>
  );
}
