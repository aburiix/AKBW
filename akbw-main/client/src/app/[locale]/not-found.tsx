import Link from 'next/link';
import { Button } from '@/shared/ui/button';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h1 className="text-6xl font-black mb-4">404</h1>
      <h2 className="text-2xl font-bold mb-4">Sahifa topilmadi</h2>
      <p className="text-gray-500 mb-8 max-w-md">
        Siz qidirayotgan sahifa mavjud emas yoki ko&apos;chirilgan bo&apos;lishi
        mumkin.
      </p>
      <Link href="/">
        <Button className="rounded-full px-8 py-6">
          Bosh sahifaga qaytish
        </Button>
      </Link>
    </div>
  );
}
