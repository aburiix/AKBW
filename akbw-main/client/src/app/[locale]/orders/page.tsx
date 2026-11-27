import type { Metadata } from 'next';
import OrdersPage from '@/features/cart/ui/OrdersPage';
import { PRODUCT_INFO } from '@/shared/constants/data';

export const metadata: Metadata = {
  title: `Orders - ${PRODUCT_INFO.name}`,
  robots: { index: false, follow: true },
};

export default function Page() {
  return <OrdersPage />;
}
