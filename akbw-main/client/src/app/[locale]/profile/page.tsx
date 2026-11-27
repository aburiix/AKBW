import type { Metadata } from 'next';
import ProfilePage from '@/widgets/profile-page';
import { PRODUCT_INFO } from '@/shared/constants/data';

export const metadata: Metadata = {
  title: `Profile - ${PRODUCT_INFO.name}`,
  robots: { index: false, follow: true },
};

export default function Page() {
  return <ProfilePage />;
}
