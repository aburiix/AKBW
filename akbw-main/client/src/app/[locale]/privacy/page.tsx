import Privacy from '@/features/privacy/ui';
import React from 'react';
import type { Metadata } from 'next';
import { routing } from '@/shared/config/i18n/routing';
import { PRODUCT_INFO } from '@/shared/constants/data';

export const revalidate = 86400;

interface PrivacyPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({
  params,
}: PrivacyPageProps): Promise<Metadata> {
  const { locale } = await params;
  const baseUrl = 'https://akbw.uz';
  const canonicalUrl = `${baseUrl}/${locale}/privacy`;

  return {
    title: `Privacy Policy - ${PRODUCT_INFO.name}`,
    description: `Read the privacy policy of ${PRODUCT_INFO.fullName}. Learn how we protect your data and privacy.`,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: canonicalUrl,
      languages: Object.fromEntries(
        routing.locales.map((loc) => [loc, `${baseUrl}/${loc}/privacy`]),
      ),
    },
    openGraph: {
      type: 'website',
      locale: locale,
      url: canonicalUrl,
      title: `Privacy Policy - ${PRODUCT_INFO.name}`,
      description: `Read the privacy policy of ${PRODUCT_INFO.fullName}. Learn how we protect your data and privacy.`,
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
      title: `Privacy Policy - ${PRODUCT_INFO.name}`,
      description: `Read the privacy policy of ${PRODUCT_INFO.fullName}. Learn how we protect your data and privacy.`,
      images: [PRODUCT_INFO.logo],
    },
  };
}

export default async function page(_params: PrivacyPageProps) {
  return (
    <>
      <Privacy />
    </>
  );
}
