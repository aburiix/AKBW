import { Suspense } from 'react';
import type { Metadata } from 'next';
import TryOn from '@/features/tryon/ui';
import { PRODUCT_INFO } from '@/shared/constants/data';

export const metadata: Metadata = {
  title: `Virtual Try-On - ${PRODUCT_INFO.name}`,
  description: `Try ${PRODUCT_INFO.name} clothes on yourself with AI.`,
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <TryOn />
    </Suspense>
  );
}
