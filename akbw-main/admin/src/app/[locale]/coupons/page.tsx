import React from 'react';
import Coupons from '@/features/coupons/ui';
import { setRequestLocale } from 'next-intl/server';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function CouponsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <Coupons />;
}
