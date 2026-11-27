import type { Metadata } from 'next';
import ProfileScreen from '@/widgets/profile/ProfileScreen';

export const metadata: Metadata = { robots: { index: false, follow: true } };

export default function Page() {
  return <ProfileScreen tab="menu" sub="editProfile" />;
}
