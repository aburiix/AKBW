'use client';

import { Button } from '@/shared/ui/button';
import Link from 'next/link';

export default function Error({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h2 className="text-2xl font-bold mb-4">Xatolik yuz berdi</h2>
      <p className="text-gray-500 mb-8 max-w-md">
        Keçirasiz, nimadir notöğri işladi. Iltimos, qaytadan
        urinib köring.
      </p>
      <div className="flex gap-4">
        <Button onClick={reset} className="rounded-full px-8 py-6">
          Qaytadan urinish
        </Button>
        <Link href="/">
          <Button variant="outline" className="rounded-full px-8 py-6">
            Bosh sahifa
          </Button>
        </Link>
      </div>
    </div>
  );
}
