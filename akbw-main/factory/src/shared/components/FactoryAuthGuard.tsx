'use client';

import { useEffect, useState } from 'react';
import { useFactoryAuthStore } from '@/features/auth/model/auth.store';
import FactoryLayout from '@/widgets/layout/ui';
import { usePathname, useRouter, useParams } from 'next/navigation';

export default function FactoryAuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { token } = useFactoryAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const locale = params?.locale as string || 'uz';
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getPathWithoutLocale = (path: string) => {
    const parts = path.split('/');
    if (parts.length > 2) {
      return '/' + parts.slice(2).join('/');
    }
    return path;
  };

  const currentPath = getPathWithoutLocale(pathname);
  const isAuthPage = currentPath === '/login' || currentPath === '/register';

  useEffect(() => {
    if (!mounted) return;

    if (!token && !isAuthPage) {
      router.push(`/${locale}/login`);
    } else if (token && isAuthPage) {
      router.push(`/${locale}/orders`);
    }
  }, [token, pathname, router, mounted, isAuthPage, locale]);

  if (!mounted) return null;

  if (isAuthPage) {
    return <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-4">
      {children}
    </div>;
  }

  if (!token) {
    return null;
  }

  return <FactoryLayout>{children}</FactoryLayout>;
}
