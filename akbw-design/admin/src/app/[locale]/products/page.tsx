import Products from '@/features/products/ui';
import React, { Suspense } from 'react';

export default function page() {
  return (
    <Suspense fallback={null}>
      <Products />
    </Suspense>
  );
}
