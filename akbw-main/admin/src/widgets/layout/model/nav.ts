import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  BarChart3,
  CreditCard,
  ShieldCheck,
  Layers,
  Headphones,
  HelpCircle,
  Bell,
  CloudSun,
  Building2,
  Ticket,
  Truck,
  Sparkles,
  UserCog,
  type LucideIcon,
} from 'lucide-react';

export type NavItem = {
  name: string;
  icon: LucideIcon;
  href: string;
  badge?: 'orders' | 'support';
  keywords?: string;
};

export type NavGroup = { title: string; items: NavItem[] };

export const NAV_GROUPS: NavGroup[] = [
  {
    title: 'Umumiy',
    items: [
      { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard', keywords: 'asosiy bosh sahifa' },
      { name: 'Statistika', icon: BarChart3, href: '/statistics', keywords: 'hisobot grafik' },
    ],
  },
  {
    title: 'Savdo',
    items: [
      { name: 'Buyurtmalar', icon: ShoppingBag, href: '/orders', badge: 'orders', keywords: 'order zakaz' },
      { name: "To'lovlar", icon: CreditCard, href: '/payments', keywords: 'payme click tranzaksiya' },
      { name: 'Yuklar', icon: Truck, href: '/shipments', keywords: 'yetkazish bts shipment' },
      { name: 'Kuponlar', icon: Ticket, href: '/coupons', keywords: 'chegirma promo' },
    ],
  },
  {
    title: 'Katalog',
    items: [
      { name: 'Mahsulotlar', icon: Package, href: '/products', keywords: 'tovar product' },
      { name: 'Kategoriyalar', icon: Layers, href: '/categories', keywords: 'category' },
      { name: 'Fasllar', icon: CloudSun, href: '/styles', keywords: 'style mavsum' },
    ],
  },
  {
    title: 'Ishlab chiqarish',
    items: [
      { name: 'Zavodlar', icon: Building2, href: '/factory', keywords: 'factory' },
      { name: 'Ishchilar', icon: UserCog, href: '/workers', keywords: 'xodim worker' },
    ],
  },
  {
    title: 'Mijozlar',
    items: [
      { name: 'Mijozlar', icon: Users, href: '/users', keywords: 'user klient' },
      { name: 'Yordam', icon: Headphones, href: '/support', badge: 'support', keywords: 'chat murojaat support' },
      { name: 'AI suhbatlar', icon: Sparkles, href: '/ai-chats', keywords: 'assistant ai' },
      { name: "Mahsulot so'rovi", icon: HelpCircle, href: '/product-support', keywords: 'savol ask' },
      { name: 'Bildirishnomalar', icon: Bell, href: '/notifications', keywords: 'push xabar notification' },
    ],
  },
  {
    title: 'Tizim',
    items: [{ name: 'Rollar', icon: ShieldCheck, href: '/users-roles', keywords: 'admin ruxsat role' }],
  },
];

export const NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);

/** Mobil pastki panel */
export const BOTTOM_NAV = ['/dashboard', '/orders', '/products', '/users'];

export const findNavItem = (path: string) =>
  NAV_ITEMS.find((i) => path === i.href || path.startsWith(i.href + '/'));
