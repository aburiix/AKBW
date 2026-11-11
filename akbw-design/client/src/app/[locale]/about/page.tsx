import AboutPage from '@/features/about/ui';
import React from 'react';
import type { Metadata } from 'next';
import { routing } from '@/shared/config/i18n/routing';
import { PRODUCT_INFO } from '@/shared/constants/data';
import Script from 'next/script';

export const revalidate = 86400;

interface AboutPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({
  params,
}: AboutPageProps): Promise<Metadata> {
  const { locale } = await params;
  const baseUrl = 'https://akbw.uz';
  const canonicalUrl = `${baseUrl}/${locale}/about`;

  return {
    title: `About Us - ${PRODUCT_INFO.name}`,
    description: `Learn more about ${PRODUCT_INFO.fullName} and our mission to provide quality fashion products.`,
    keywords:
      'about AKBW, ABURIIX KRAFT BRAND WEAR, company info, fashion brand, our story, mission, vision',
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: canonicalUrl,
      languages: Object.fromEntries(
        routing.locales.map((loc) => [loc, `${baseUrl}/${loc}/about`]),
      ),
    },
    openGraph: {
      type: 'website',
      locale: locale,
      url: canonicalUrl,
      title: `About Us - ${PRODUCT_INFO.name}`,
      description: `Learn more about ${PRODUCT_INFO.fullName} and our mission to provide quality fashion products.`,
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
      title: `About Us - ${PRODUCT_INFO.name}`,
      description: `Learn more about ${PRODUCT_INFO.fullName} and our mission to provide quality fashion products.`,
      images: [PRODUCT_INFO.logo],
    },
  };
}

export default async function page({ params }: AboutPageProps) {
  const { locale } = await params;
  const baseUrl = 'https://akbw.uz';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: `About Us - ${PRODUCT_INFO.name}`,
    description: `Learn more about ${PRODUCT_INFO.fullName} and our mission to provide quality fashion products.`,
    url: `${baseUrl}/${locale}/about`,
    mainEntity: {
      '@type': 'Organization',
      name: PRODUCT_INFO.fullName,
      alternateName: PRODUCT_INFO.name,
      url: baseUrl,
    },
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: PRODUCT_INFO.name,
        item: `${baseUrl}/${locale}`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'About Us',
        item: `${baseUrl}/${locale}/about`,
      },
    ],
  };

  return (
    <>
      <Script
        id="about-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Script
        id="about-breadcrumb-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <AboutPage />
    </>
  );
}
