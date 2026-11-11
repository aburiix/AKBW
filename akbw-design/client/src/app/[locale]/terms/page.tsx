import TermsAndConditions from '@/features/terms/ui';
import React from 'react';
import type { Metadata } from 'next';
import { routing } from '@/shared/config/i18n/routing';
import { PRODUCT_INFO } from '@/shared/constants/data';

export const revalidate = 86400;

interface TermsPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({
  params,
}: TermsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const baseUrl = 'https://akbw.uz';
  const canonicalUrl = `${baseUrl}/${locale}/terms`;

  return {
    title: `Terms of Use - ${PRODUCT_INFO.name}`,
    description: `Read the terms of use for ${PRODUCT_INFO.fullName}. Understand our terms and conditions.`,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: canonicalUrl,
      languages: Object.fromEntries(
        routing.locales.map((loc) => [loc, `${baseUrl}/${loc}/terms`]),
      ),
    },
    openGraph: {
      type: 'website',
      locale: locale,
      url: canonicalUrl,
      title: `Terms of Use - ${PRODUCT_INFO.name}`,
      description: `Read the terms of use for ${PRODUCT_INFO.fullName}. Understand our terms and conditions.`,
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
      title: `Terms of Use - ${PRODUCT_INFO.name}`,
      description: `Read the terms of use for ${PRODUCT_INFO.fullName}. Understand our terms and conditions.`,
      images: [PRODUCT_INFO.logo],
    },
  };
}

export default async function page(_params: TermsPageProps) {
  return (
    <>
      <TermsAndConditions />
    </>
  );
}
