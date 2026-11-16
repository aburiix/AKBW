import Orders from '@/features/orders/ui';
import React, { Suspense } from 'react';

export default function page() {
  return (
    <Suspense fallback={null}>
      <Orders />
    </Suspense>
  );
}
