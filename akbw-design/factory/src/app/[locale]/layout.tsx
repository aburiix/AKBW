import { hasLocale, Locale, NextIntlClientProvider } from 'next-intl';
import QueryProvider from '@/shared/config/react-query/QueryProvider';
import { ThemeProvider } from '@/shared/config/theme-provider';
import { PRODUCT_INFO } from '@/shared/constants/data';
import { routing } from '@/shared/config/i18n/routing';
import { setRequestLocale } from 'next-intl/server';
import { golosText } from '@/shared/config/fonts';
import { notFound } from 'next/navigation';
import Footer from '@/widgets/footer/ui';
import Navbar from '@/widgets/navbar/ui';
import type { Metadata } from 'next';
import { ReactNode } from 'react';
import Script from 'next/script';
import FactoryAuthGuard from '@/shared/components/FactoryAuthGuard';
import { Toaster } from 'sonner';
import '../globals.css';


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

  // Enable static rendering
  setRequestLocale(locale);

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${golosText.variable} antialiased`}>
        <NextIntlClientProvider locale={locale}>
          <ThemeProvider
            attribute={'class'}
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <QueryProvider>
              <FactoryAuthGuard>{children}</FactoryAuthGuard>
              <Toaster toastOptions={{
                style: {
                  background: '#ffffff',
                  color: '#000000',
                  border: '1px solid #E5E7EB',
                  borderRadius: '16px',
                  padding: '16px',
                  fontSize: '14px',
                  fontWeight: '600',
                  boxShadow:
                    '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                },
              }}
                position="bottom-right"
                richColors
                closeButton
              />
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
