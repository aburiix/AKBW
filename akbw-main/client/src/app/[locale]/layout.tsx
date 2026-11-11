import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import '../globals.css';
import { inter } from '@/shared/config/fonts';
import { ThemeProvider } from '@/shared/config/theme-provider';
import { hasLocale, Locale, NextIntlClientProvider } from 'next-intl';
import { routing } from '@/shared/config/i18n/routing';
import { notFound } from 'next/navigation';
import Footer from '@/widgets/footer/ui';
import Navbar from '@/widgets/navbar/ui';
import { ReactNode } from 'react';
import { setRequestLocale } from 'next-intl/server';
import QueryProvider from '@/shared/config/react-query/QueryProvider';
import { Toaster } from '@/shared/ui/toast';
import Script from 'next/script';
import TelegramProvider from '@/shared/config/telegram-provider';

import { Kenao, Radiant, Didot, Granjon, Rosan, Futura } from '@/shared/fonts';

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
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${Kenao.variable} ${Radiant.variable} ${Didot.variable} ${Granjon.variable} ${inter.variable} ${Rosan.variable} ${Futura.variable}`}
    >
      <body className="antialiased">
        {/* Telegram Mini App: bot ichida ochilganda ishlaydi, oddiy brauzerda jim turadi */}
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
        <NextIntlClientProvider locale={locale}>
          <ThemeProvider
            attribute={'class'}
            defaultTheme="light"
            disableTransitionOnChange
          >
            <QueryProvider>
              <Navbar />
              {children}
              <Footer />
              <Analytics />
              <SpeedInsights />
              <Toaster />
              <TelegramProvider />
            </QueryProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
