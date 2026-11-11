'use client';

import { DashboardView } from '@/features/dashboard';
import { useFactoryAuthStore } from '@/features/auth/model/auth.store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const token = useFactoryAuthStore((state) => state.token);
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      router.push('/login');
    } else {
      router.push("/dashboard")
    }
  }, [token, router]);

  if (!token) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="animate-spin text-gray-200" size={48} />
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">Yuklanmoqda...</p>
      </div>
    );
  }

  return null;
}
