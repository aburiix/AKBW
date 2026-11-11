import FavoritesPage from '@/features/favorites/ui';

interface FavoritesPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function Page(_params: FavoritesPageProps) {
  return <FavoritesPage />;
}
