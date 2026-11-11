import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  devIndicators: false,
  // Faqat `next dev` uchun: telefondan (Wi-Fi) dizaynni ko'rishga ruxsat
  allowedDevOrigins: ['192.168.0.123', '192.168.0.147', '*.trycloudflare.com'],
  // Faqat `next dev` uchun: lokal soxta API'ni sayt orqali o'tkazish
  // (telefon ham, kompyuter ham bitta manzildan foydalanadi). Production'ga ta'sir qilmaydi.
  async rewrites() {
    if (process.env.NODE_ENV !== 'development') return [];
    return [
      { source: '/api/mock/:path*', destination: 'http://localhost:8100/api/:path*' },
    ];
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.akbw.uz',
        pathname: '/**',
      },

      {
        protocol: "https",
        hostname: "**"
      }
    ],
  },
  output: 'standalone',};

const withNextIntl = createNextIntlPlugin({
  requestConfig: './src/shared/config/i18n/request.ts',
  experimental: {
    createMessagesDeclaration: './src/shared/config/i18n/messages/uz.json',
  },
});

export default withNextIntl(nextConfig);
