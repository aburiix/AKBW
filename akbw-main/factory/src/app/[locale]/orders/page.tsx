'use client';

import { OrdersView } from '@/features/shipments';
import { useFactoryAuthStore } from '@/features/auth/model/auth.store';
import { Loader2 } from 'lucide-react';

export default function OrdersPage() {
  const token = useFactoryAuthStore((state) => state.token);

  if (!token) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="animate-spin text-gray-200" size={48} />
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">Yuklanmoqda...</p>
      </div>
    );
  }

  return (
    <main className="custom-container">
      <OrdersView />
    </main>
  );
}
