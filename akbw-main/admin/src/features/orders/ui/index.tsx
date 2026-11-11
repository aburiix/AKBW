'use client';

import React, { useState } from 'react';
import {
  MoreHorizontal,
  Eye,
  Copy,
} from 'lucide-react';
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

const getStatusStyles = (state: string) => {
  switch (state) {
    case 'REVIEW':
      return 'bg-yellow-50 text-yellow-600 border-yellow-100';
    case 'PENDING':
      return 'bg-blue-50 text-blue-600 border-blue-100';
    case 'PAID':
      return 'bg-green-50 text-green-600 border-green-100';
    case 'SENT':
      return 'bg-purple-50 text-purple-600 border-purple-100';
    case 'CANCELLED':
      return 'bg-red-50 text-red-600 border-red-100';
    default:
      return 'bg-gray-50 text-gray-600 border-gray-100';
  }
};


export default function Orders() {
  const { data: ordersData, isLoading } = useOrders();
  const updateStatusMutation = useUpdateOrderStatus();
  const { data: statusData } = useOrderStatus();

  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('Hammasi');

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

  const filteredOrders =
    ordersData?.data?.filter((order: any) => {
      if (filterStatus === 'Hammasi') return true;
      return order.state === filterStatus;
    }) || [];

  if (isLoading) return <div>Yuklanmoqda...</div>;
  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black uppercase tracking-tight">
          Buyurtmalar
        </h1>
        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
          Savdo jarayonini kuzatish va boshqarish
        </p>
      </div>

      {/* Quick Status Filters */}
      <div className="flex gap-4 overflow-x-auto no-scrollbar py-2">
        {statusData?.data?.map((status: string) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={cn(
              'px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 cursor-pointer',
              filterStatus === status
                ? 'bg-black text-white shadow-lg'
                : 'bg-white text-gray-400 border border-gray-100 hover:border-black hover:text-black',
            )}
          >
            {status === 'Hammasi' ? 'Hammasi' : status}
          </button>
        ))}
      </div>

      <OrderDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        order={selectedOrder}
      />

      {/* Orders Table */}
      <div className="bg-white rounded-4xl border border-gray-100 overflow-hidden shadow-sm">
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
              {filteredOrders.map((order: IOrder) => (
                <tr
                  key={order.id}
                  className="hover:bg-gray-50/50 transition-colors group"
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
                    <div
                      className={cn(
                        'inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border',
                        getStatusStyles(order.state),
                      )}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {order.state}
                    </div>
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
                            statusData?.data.map((status: string, _) => (
                              <DropdownMenuItem
                                key={_}
                                onClick={() =>
                                  handleUpdateStatus(order.id, status)
                                }
                                className="rounded-xl gap-3 px-3 py-2 cursor-pointer"
                              >
                                <span className="text-xs font-bold uppercase tracking-wider">
                                  {status}
                                </span>
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
        </div>
      </div>
    </div>
  );
}

// Utility
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
