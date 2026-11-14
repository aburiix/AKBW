'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/shared/config/i18n/navigation';
import { Button } from '@/shared/ui/button';

export default function NotFound() {
  const t = useTranslations('Ui');
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h1 className="text-6xl font-black mb-4">404</h1>
      <h2 className="text-2xl font-bold mb-4">{t('nf_title')}</h2>
      <p className="text-gray-500 mb-8 max-w-md">{t('nf_text')}</p>
      <Link href="/">
        <Button className="rounded-full px-8 py-6">{t('nf_home')}</Button>
      </Link>
    </div>
  );
}
