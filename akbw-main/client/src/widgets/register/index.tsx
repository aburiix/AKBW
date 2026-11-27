'use client';

import React from 'react';
import AuthSheet from '@/widgets/auth-sheet';
import { Button } from '@/shared/ui/button';
import { useTranslations } from 'next-intl';

/** Ro'yxatdan o'tish — ilovadagi ekran bilan bir xil oyna (widgets/auth-sheet) */
export default function Register({ trigger }: { trigger?: React.ReactNode }) {
  const t = useTranslations('Auth');
  return (
    <AuthSheet
      initialMode="register"
      trigger={trigger ?? <Button variant="outline">{t('register')}</Button>}
    />
  );
}
