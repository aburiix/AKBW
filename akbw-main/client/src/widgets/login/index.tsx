'use client';

import React from 'react';
import AuthSheet from '@/widgets/auth-sheet';
import { Button } from '@/shared/ui/button';
import { useTranslations } from 'next-intl';

/** Kirish — ilovadagi ekran bilan bir xil oyna (widgets/auth-sheet) */
export default function Login({
  trigger,
}: {
  trigger?: React.ReactNode;
  className?: string;
}) {
  const t = useTranslations('Auth');
  return (
    <AuthSheet
      initialMode="login"
      trigger={trigger ?? <Button>{t('login')}</Button>}
    />
  );
}
