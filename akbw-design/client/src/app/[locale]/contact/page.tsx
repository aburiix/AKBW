import ContactPage from '@/features/contact/ui';
import React from 'react';
import type { Metadata } from 'next';
import { routing } from '@/shared/config/i18n/routing';
import { PRODUCT_INFO } from '@/shared/constants/data';
import Script from 'next/script';

export const revalidate = 86400;

interface ContactPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({
  params,
}: ContactPageProps): Promise<Metadata> {
  const { locale } = await params;
  const baseUrl = 'https://akbw.uz';
  const canonicalUrl = `${baseUrl}/${locale}/contact`;

  return {
    title: `Contact Us - ${PRODUCT_INFO.name}`,
    description: `Get in touch with ${PRODUCT_INFO.fullName}. Contact us for any questions or support.`,
    keywords:
      'contact AKBW, ABURIIX KRAFT BRAND WEAR, customer service, support, phone, email, address',
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: canonicalUrl,
      languages: Object.fromEntries(
        routing.locales.map((loc) => [loc, `${baseUrl}/${loc}/contact`]),
      ),
    },
    openGraph: {
      type: 'website',
      locale: locale,
      url: canonicalUrl,
      title: `Contact Us - ${PRODUCT_INFO.name}`,
      description: `Get in touch with ${PRODUCT_INFO.fullName}. Contact us for any questions or support.`,
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
      title: `Contact Us - ${PRODUCT_INFO.name}`,
      description: `Get in touch with ${PRODUCT_INFO.fullName}. Contact us for any questions or support.`,
      images: [PRODUCT_INFO.logo],
    },
  };
}

export default async function page({ params }: ContactPageProps) {
  const { locale } = await params;
  const baseUrl = 'https://akbw.uz';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: `Contact Us - ${PRODUCT_INFO.name}`,
    description: `Get in touch with ${PRODUCT_INFO.fullName}. Contact us for any questions or support.`,
    url: `${baseUrl}/${locale}/contact`,
    mainEntity: {
      '@type': 'Organization',
      name: PRODUCT_INFO.fullName,
      alternateName: PRODUCT_INFO.name,
      url: baseUrl,
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: PRODUCT_INFO.contact.phone,
        email: PRODUCT_INFO.contact.email,
        contactType: 'customer service',
        areaServed: 'UZ',
        availableLanguage: ['en', 'ru', 'uz'],
      },
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
        name: 'Contact Us',
        item: `${baseUrl}/${locale}/contact`,
      },
    ],
  };

  return (
    <>
      <Script
        id="contact-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Script
        id="contact-breadcrumb-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ContactPage />
    </>
  );
}
