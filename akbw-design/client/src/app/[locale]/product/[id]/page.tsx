import Product from '@/features/product/ui';
import React from 'react';
import type { Metadata } from 'next';
import { routing } from '@/shared/config/i18n/routing';
import { PRODUCT_INFO } from '@/shared/constants/data';
import { getProductByIdRequest } from '@/shared/config/api/product/product.request';
import Script from 'next/script';

interface ProductPageProps {
  params: Promise<{
    id: string;
    locale: string;
  }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { id, locale } = await params;
  const baseUrl = 'https://akbw.uz';
  const canonicalUrl = `${baseUrl}/${locale}/product/${id}`;

  try {
    const product = await getProductByIdRequest(id);

    if (!product) {
      return {
        title: 'Product Not Found',
        description: 'The requested product could not be found.',
      };
    }

    return {
      title: `${product.name} - ${PRODUCT_INFO.name}`,
      description:
        product.description || `${product.name} - ${PRODUCT_INFO.fullName}`,
      metadataBase: new URL(baseUrl),
      alternates: {
        canonical: canonicalUrl,
        languages: Object.fromEntries(
          routing.locales.map((loc) => [
            loc,
            `${baseUrl}/${loc}/product/${id}`,
          ]),
        ),
      },
      openGraph: {
        type: 'website',
        locale: locale,
        url: canonicalUrl,
        title: `${product.name} - ${PRODUCT_INFO.name}`,
        description:
          product.description || `${product.name} - ${PRODUCT_INFO.fullName}`,
        siteName: PRODUCT_INFO.name,
        images:
          product.product_images?.length > 0
            ? product.product_images.map((img: string) => ({
                url: img,
                width: 1200,
                height: 630,
                alt: product.name,
              }))
            : [
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
        title: `${product.name} - ${PRODUCT_INFO.name}`,
        description:
          product.description || `${product.name} - ${PRODUCT_INFO.fullName}`,
        images:
          product.product_images?.length > 0
            ? [product.product_images[0]]
            : [PRODUCT_INFO.logo],
      },
    };
  } catch (_error) {
    return {
      title: 'Product - AKBW',
      description: PRODUCT_INFO.description,
    };
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id, locale } = await params;
  const baseUrl = 'https://akbw.uz';
  // Mahsulot topilmasa (404) yoki API xato bersa sahifa yiqilmaydi — klient "topilmadi" holatini ko'rsatadi
  const product = await getProductByIdRequest(id).catch(() => null);

  const jsonLd = product
    ? {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.description,
        image:
          product.product_images?.length > 0
            ? product.product_images
            : [`${baseUrl}${PRODUCT_INFO.logo}`],
        url: `${baseUrl}/${locale}/product/${id}`,
        offers: {
          '@type': 'Offer',
          price: product.price,
          priceCurrency: 'UZS',
          availability: 'https://schema.org/InStock',
          seller: {
            '@type': 'Organization',
            name: PRODUCT_INFO.fullName,
          },
        },
        brand: {
          '@type': 'Brand',
          name: PRODUCT_INFO.name,
        },
        category: product.categories?.[0]?.name || 'Fashion',
        aggregateRating: product.rating
          ? {
              '@type': 'AggregateRating',
              ratingValue: product.rating,
              bestRating: '5',
              worstRating: '1',
            }
          : undefined,
      }
    : null;

  const breadcrumbJsonLd = product
    ? {
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
            name: product.categories?.[0]?.name || 'Products',
            item: `${baseUrl}/${locale}/search`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: product.name,
            item: `${baseUrl}/${locale}/product/${id}`,
          },
        ],
      }
    : null;

  return (
    <>
      {jsonLd && (
        <Script
          id="product-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {breadcrumbJsonLd && (
        <Script
          id="breadcrumb-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
      )}
      <Product id={id} />
    </>
  );
}
