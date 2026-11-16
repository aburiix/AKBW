'use client';

import { useMemo } from 'react';
import { useOrders } from '@/features/orders/lib/hooks';
import { useAdminHelpChats } from '@/features/chat/lib/hooks';
import type { IOrder } from '@/shared/config/api/order/order.model';

/** Yon menyu va qo'ng'iroqcha uchun real hisoblagichlar */
export function useBadges() {
  const { data: ordersData } = useOrders();
  const { data: chats = [] } = useAdminHelpChats();

  return useMemo(() => {
    const orders: IOrder[] = ordersData?.data || [];
    const pendingOrders = orders
      .filter((o) => o.state === 'PENDING')
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

    // javobsiz murojaat = oxirgi xabar mijozdan (admin_id yo'q)
    const unanswered = (chats as any[]).filter((c) => {
      const last = c.messages?.[c.messages.length - 1];
      return last && !last.admin_id;
    });

    return {
      orders: pendingOrders.length,
      support: unanswered.length,
      pendingOrders,
      unanswered,
    };
  }, [ordersData, chats]);
}
