'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/shared/config/i18n/navigation';
import {
  MoreHorizontal,
  Eye,
  Copy,
  Search,
  Download,
  X,
} from 'lucide-react';
import { Pill, stateOf } from '@/shared/ui/order-state';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import OrderDetailModal from './order-detail-modal';
import { useOrders, useOrderStatus, useUpdateOrderStatus } from '../lib/hooks';
import { IOrder } from '@/shared/config/api/order/order.model';
import { toast } from 'sonner';

export default function Orders() {
  const { data: ordersData, isLoading } = useOrders();
  const updateStatusMutation = useUpdateOrderStatus();
  const { data: statusData } = useOrderStatus();

  const searchParams = useSearchParams();
  const router = useRouter();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState(
    searchParams.get('status') || 'Hammasi',
  );
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const PER_PAGE = 20;

  const handleViewOrder = (order: any) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await updateStatusMutation.mutateAsync({ id, status });
      toast.success('Status yangilandi');
    } catch (error) {
      toast.error('Xatolik yuz berdi');
    }
  };

  const allOrders: IOrder[] = useMemo(
    () =>
      [...((ordersData?.data || []) as IOrder[])].sort(
        (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
      ),
    [ordersData],
  );

  // URL: ?status=PENDING, ?order=123 (bildirishnoma / qidiruvdan)
  useEffect(() => {
    const st = searchParams.get('status');
    const id = searchParams.get('order');
    if (!st && !id) return;
    if (id && !allOrders.length) return; // buyurtmalar yuklanishini kutamiz
    if (st) setFilterStatus(st);
    if (id) {
      const found = allOrders.find((o) => String(o.id) === id);
      if (found) handleViewOrder(found);
    }
    // parametr bir marta qo'llanadi — keyin URL tozalanadi
    router.replace('/orders');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, allOrders]);

  useEffect(() => setPage(1), [filterStatus, query]);

  const statuses: string[] = useMemo(() => {
    const fromApi = (statusData?.data || []).filter((s: string) => s !== 'Hammasi');
    const list = fromApi.length ? fromApi : Array.from(new Set(allOrders.map((o) => o.state)));
    return ['Hammasi', ...list];
  }, [statusData, allOrders]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { Hammasi: allOrders.length };
    allOrders.forEach((o) => (c[o.state] = (c[o.state] || 0) + 1));
    return c;
  }, [allOrders]);

  const nq = query.trim().toLowerCase().replace(/^#/, '');
  const filteredOrders = allOrders.filter((order) => {
    if (filterStatus !== 'Hammasi' && order.state !== filterStatus) return false;
    if (!nq) return true;
    const hay = `${order.id} ${order.user?.name || ''} ${order.user?.lastName || ''} ${order.user?.phone || ''} ${order.coupon?.code || ''}`.toLowerCase();
    return hay.includes(nq);
  });
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PER_PAGE));
  const pageOrders = filteredOrders.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const exportCsv = () => {
    const rows = [
      ['ID', 'Sana', 'Mijoz', 'Telefon', 'Mahsulotlar soni', "Summa (so'm)", 'Kupon', 'Holat'],
      ...filteredOrders.map((o) => [
        o.id,
        new Date(o.createdAt).toLocaleString('ru-RU'),
        `${o.user?.name || ''} ${o.user?.lastName || ''}`.trim(),
        o.user?.phone || '',
        o.orderItems?.length || 0,
        o.total_price,
        o.coupon ? `${o.coupon.code} (-${o.coupon.discount}%)` : '',
        stateOf(o.state).label,
      ]),
    ];
    const csv = '\ufeff' + rows.map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(';')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = `akbw-buyurtmalar-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  if (isLoading) return <div className="lbl animate-pulse p-10 text-center">Yuklanmoqda…</div>;
  return (
    <div className="pb-6">
      {/* Sarlavha */}
      <div className="flex items-end justify-between gap-4 flex-wrap mb-6">
        <div>
          <span className="lbl">Savdo</span>
          <h1 className="mt-2">Buyurtmalar</h1>
          <p className="text-mute mt-1.5">
            Jami {allOrders.length} ta buyurtma · qatorni bossangiz tafsilot ochiladi
          </p>
        </div>
        <button
          onClick={exportCsv}
          className="h-[38px] px-4 rounded-[10px] inline-flex items-center gap-2 border border-line2 hover:bg-s2 cursor-pointer font-medium"
        >
          <Download size={17} strokeWidth={1.6} />
          Excel (CSV)
        </button>
      </div>

      <OrderDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        order={selectedOrder}
      />

      {/* Jadval */}
      <div className="bg-s1 rounded-[18px] border border-line overflow-hidden">
        <div className="flex items-center gap-2.5 p-3 md:px-4 border-b border-line flex-wrap">
          <div className="flex gap-0.5 overflow-x-auto no-scrollbar max-w-full">
            {statuses.map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={cn(
                  'h-[34px] px-3 rounded-lg whitespace-nowrap text-[13.5px] cursor-pointer',
                  filterStatus === status ? 'bg-s3 text-ink' : 'text-mute hover:text-ink',
                )}
              >
                {status === 'Hammasi' ? 'Hammasi' : stateOf(status).label}
                <em className="not-italic text-mute2 ml-1.5 text-xs">{counts[status] || 0}</em>
              </button>
            ))}
          </div>
          <div className="flex-1" />
          <label className="flex items-center gap-2 h-[36px] px-3 rounded-[10px] bg-s2 border border-line w-full sm:w-[280px]">
            <Search size={16} className="text-mute2 shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ID, mijoz, telefon, kupon…"
              className="flex-1 bg-transparent outline-none text-[14px] min-w-0"
            />
            {query && (
              <button onClick={() => setQuery('')} className="text-mute2 hover:text-ink cursor-pointer">
                <X size={15} />
              </button>
            )}
          </label>
        </div>
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-5 text-left text-[10px] uppercase tracking-[0.2em] font-black text-gray-400">
                  Buyurtma ID
                </th>
                <th className="px-8 py-5 text-left text-[10px] uppercase tracking-[0.2em] font-black text-gray-400">
                  Mijoz
                </th>
                <th className="px-8 py-5 text-left text-[10px] uppercase tracking-[0.2em] font-black text-gray-400">
                  Maxsulotlar
                </th>
                <th className="px-8 py-5 text-left text-[10px] uppercase tracking-[0.2em] font-black text-gray-400">
                  Summa / To‘lov
                </th>
                <th className="px-8 py-5 text-left text-[10px] uppercase tracking-[0.2em] font-black text-gray-400">
                  Status
                </th>
                <th className="px-8 py-5 text-right text-[10px] uppercase tracking-[0.2em] font-black text-gray-400">
                  Amallar
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {pageOrders.map((order: IOrder) => (
                <tr
                  key={order.id}
                  onClick={(e) => {
                    if ((e.target as HTMLElement).closest('button,[role=menu]')) return;
                    handleViewOrder(order);
                  }}
                  className="hover:bg-s2 transition-colors group cursor-pointer"
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black">
                        #{order.id.toString().slice(-6)}
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(order.id.toString());
                          toast.success("ID ko'chirildi");
                        }}
                        className="p-1 hover:bg-gray-100 rounded-md text-gray-400 transition-colors cursor-pointer"
                      >
                        <Copy size={12} />
                      </button>
                    </div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-bold uppercase">
                      {order.user?.name} {order.user?.lastName}
                    </p>
                    <p className="text-xs text-gray-500 font-medium">
                      {order.user?.phone}
                    </p>
                  </td>
                  <td className="px-8 py-6 max-w-[200px]">
                    <p className="text-xs text-gray-600 font-medium truncate">
                      Buyurtma qilingan mahsulotlar: {order.orderItems.length} ta
                    </p>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-black">
                      {order.total_price.toLocaleString()} so'm
                    </p>
                    {order.coupon && (
                      <span className="text-[10px] font-bold uppercase tracking-widest text-green-500">
                        KUPON: {order.coupon.code} (-{order.coupon.discount}%)
                      </span>
                    )}
                  </td>
                  <td className="px-8 py-6">
                    <Pill state={order.state} />
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleViewOrder(order)}
                        className="p-2.5 rounded-xl bg-gray-50 text-gray-400 hover:bg-black hover:text-white transition-all cursor-pointer"
                      >
                        <Eye size={18} />
                      </button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-2.5 rounded-xl border border-gray-100 text-gray-400 hover:border-black hover:text-black transition-all cursor-pointer">
                            <MoreHorizontal size={18} />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="rounded-2xl border-gray-100 p-2 shadow-xl"
                        >
                          <DropdownMenuLabel className="text-[10px] uppercase tracking-widest font-black text-gray-400 px-3 py-2">
                            Statusni o‘zgartirish
                          </DropdownMenuLabel>
                          {
                            statuses.filter((st) => st !== 'Hammasi').map((status: string, _) => (
                              <DropdownMenuItem
                                key={_}
                                onClick={() =>
                                  handleUpdateStatus(order.id, status)
                                }
                                className="rounded-xl gap-3 px-3 py-2 cursor-pointer"
                              >
                                <Pill state={status} />
                              </DropdownMenuItem>
                            ))
                          }
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {pageOrders.length === 0 && (
            <p className="text-center text-mute2 py-14 text-sm">Buyurtma topilmadi</p>
          )}
        </div>
        <div className="flex items-center justify-between gap-3 px-4 py-3.5 border-t border-line text-mute2 text-[13px] flex-wrap">
          <span>
            {filteredOrders.length === 0
              ? '0'
              : `${(page - 1) * PER_PAGE + 1}–${Math.min(page * PER_PAGE, filteredOrders.length)}`}{' '}
            / {filteredOrders.length}
          </span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="h-8 px-3 rounded-[10px] border border-line2 hover:bg-s2 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              ← Oldingi
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="h-8 px-3 rounded-[10px] border border-line2 hover:bg-s2 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              Keyingi →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Utility
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
