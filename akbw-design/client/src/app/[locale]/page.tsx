import Welcome from '@/widgets/welcome';
import type { Metadata } from 'next';
import { routing } from '@/shared/config/i18n/routing';
import { PRODUCT_INFO } from '@/shared/constants/data';
import Script from 'next/script';

export const revalidate = 3600;

interface HomePageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({
  params,
}: HomePageProps): Promise<Metadata> {
  const { locale } = await params;
  const baseUrl = 'https://akbw.uz';
  const canonicalUrl = `${baseUrl}/${locale}`;

  return {
    title: `${PRODUCT_INFO.name} - ${PRODUCT_INFO.fullName}`,
    description: PRODUCT_INFO.description,
    keywords:
      'AKBW, ABURIIX KRAFT BRAND WEAR, fashion, clothing, accessories, premium fashion, Uzbekistan fashion, online shopping, brand wear',
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: canonicalUrl,
      languages: Object.fromEntries(
        routing.locales.map((loc) => [loc, `${baseUrl}/${loc}`]),
      ),
    },
    openGraph: {
      type: 'website',
      locale: locale,
      url: canonicalUrl,
      title: `${PRODUCT_INFO.name} - ${PRODUCT_INFO.fullName}`,
      description: PRODUCT_INFO.description,
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
      title: `${PRODUCT_INFO.name} - ${PRODUCT_INFO.fullName}`,
      description: PRODUCT_INFO.description,
      images: [PRODUCT_INFO.logo],
    },
  };
}

export default async function Home({ params }: HomePageProps) {
  await params;
  const baseUrl = 'https://akbw.uz';

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: PRODUCT_INFO.fullName,
    alternateName: PRODUCT_INFO.name,
    url: baseUrl,
    logo: `${baseUrl}${PRODUCT_INFO.logo}`,
    description: PRODUCT_INFO.description,
    foundingDate: '2022',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: PRODUCT_INFO.contact.phone,
      email: PRODUCT_INFO.contact.email,
      contactType: 'customer service',
      areaServed: 'UZ',
      availableLanguage: ['en', 'ru', 'uz'],
    },
    sameAs: [PRODUCT_INFO.socials.telegram, PRODUCT_INFO.socials.instagram],
  };

  const webSiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: PRODUCT_INFO.name,
    alternateName: PRODUCT_INFO.fullName,
    url: baseUrl,
    description: PRODUCT_INFO.description,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/{locale}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <div>
      <Script
        id="organization-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <Script
        id="website-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd) }}
      />
      <Welcome />
    </div>
  );
}
