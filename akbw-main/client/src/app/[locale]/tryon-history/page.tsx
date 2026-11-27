import type { Metadata } from 'next';
import TryOnHistory from '@/features/tryon/ui/History';

export const metadata: Metadata = { robots: { index: false, follow: true } };

export default function Page() {
  return <TryOnHistory />;
}
