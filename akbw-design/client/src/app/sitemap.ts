import { MetadataRoute } from 'next';
import { routing } from '@/shared/config/i18n/routing';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://akbw.uz';
  const locales = routing.locales;

  const staticPages = [
    '',
    '/about',
    '/contact',
    '/cart',
    '/favorites',
    '/filters',
    '/new',
    '/best',
    '/search',
    '/privacy',
    '/terms',
  ];

  const sitemap: MetadataRoute.Sitemap = [];

  // Generate URLs for all locales and static pages
  staticPages.forEach((page) => {
    locales.forEach((locale) => {
      let priority = 0.8;
      let changeFrequency: 'daily' | 'weekly' | 'monthly' = 'weekly';

      if (page === '') {
        priority = 1;
        changeFrequency = 'daily';
      } else if (page === '/about' || page === '/contact') {
        priority = 0.9;
        changeFrequency = 'weekly';
      }

      sitemap.push({
        url: `${baseUrl}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency,
        priority,
      });
    });
  });

  return sitemap;
}
