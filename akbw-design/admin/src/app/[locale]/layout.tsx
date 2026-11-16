import type { Metadata } from 'next';
import '../globals.css';
import { golosText, kenao, didot, futura } from '@/shared/config/fonts';
import { ThemeProvider } from '@/shared/config/theme-provider';
import { PRODUCT_INFO } from '@/shared/constants/data';
import { hasLocale, Locale, NextIntlClientProvider } from 'next-intl';
import { routing } from '@/shared/config/i18n/routing';
import { notFound } from 'next/navigation';
import { ReactNode } from 'react';
import { setRequestLocale } from 'next-intl/server';
import { Toaster } from 'sonner';
import QueryProvider from '@/shared/config/react-query/QueryProvider';
import AdminAuthGuard from '@/shared/components/AdminAuthGuard';
import Script from 'next/script';

export const metadata: Metadata = {
  title: PRODUCT_INFO.name,
  description: PRODUCT_INFO.description,
  icons: PRODUCT_INFO.favicon,
};

type Props = {
  children: ReactNode;
  params: Promise<{ locale: Locale }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${golosText.variable} ${kenao.variable} ${didot.variable} ${futura.variable} font-sans antialiased`}>
        <NextIntlClientProvider locale={locale}>
          <ThemeProvider
            attribute={'class'}
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
          >
            <QueryProvider>
              <AdminAuthGuard>
                {children}
                <Toaster
                  position="top-right"
                  richColors
                  closeButton
                  duration={4000}
                />
              </AdminAuthGuard>
            </QueryProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
      <Script
        src="https://buttons.github.io/buttons.js"
        strategy="lazyOnload"
        async
        defer
      />
    </html>
  );
}
