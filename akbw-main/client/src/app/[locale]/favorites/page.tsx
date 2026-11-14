import type { Metadata } from 'next';
import FavoritesPage from '@/features/favorites/ui';
import { PRODUCT_INFO } from '@/shared/constants/data';

export const metadata: Metadata = {
  title: `Favorites - ${PRODUCT_INFO.name}`,
  robots: { index: false, follow: true },
};

export default function Page() {
  return <FavoritesPage />;
}
