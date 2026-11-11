'use client';

import React, { useState } from 'react';
import { Button } from '@/shared/ui/button';
import {
  MapPin,
  ArrowRight,
  CheckCircle2,
  Clock,
  Truck,
  Building2,
  Hash,
  Package,
  Loader2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import dayjs from 'dayjs';
import {
  IDeliveryFromToLinkResponse
} from '@/shared/config/api/delivery/delivery.model';
import { useUpdateShipmentStatus } from '../lib/hooks';

interface ShipmentCardProps {
  item: {
    id: number;
    orderId: number;
    type: string;
    factoryId: number;
    sender_city_code: string;
    sender_region_code: string;
    sender_branch_code: string;
    receiver_city_code: string;
    receiver_branch_code: string;
    receiver_region_code: string;
    receiver_address: string;
    tracking_number: string | null;
    state: 'PENDING' | 'READY_FOR_BTS' | 'SENT' | string;
    createdAt: string;
    updatedAt: string;
    orderItems?: Array<{
      id: number;
      quantity: number;
      price: number;
      actual_product_link?: string;
      product?: {
        translations?: Array<{ name: string }>;
        weight?: number;
        product_images?: string[];
        actual_product_link?: string;
      };
    }>;
    factory?: {
      name: string;
      bts_city_code: string;
      address: string;
    };
    order?: {
      user?: {
        name: string;
        phone: string;
      };
      address?: {
        city_code: string;
        branch_code: string;
        address: string;
      };
    };
  };
  shipmentLinks?: IDeliveryFromToLinkResponse;
  senderAddress?: {
    address: string;
    city_code: string;
    branch_code: string;
    region_code?: string;
    lat_long?: string;
  };
  onUpdate?: () => void;
}

const statusConfig: Record<string, { label: string; icon: any; color: string }> = {
  PENDING: { label: 'Kutilmoqda', icon: Clock, color: 'bg-yellow-50 text-yellow-600 border-yellow-100' },
  READY_FOR_BTS: { label: 'BTSga Tayyor', icon: Package, color: 'bg-blue-50 text-blue-600 border-blue-100' },
  SENT: { label: 'Yuborildi', icon: Truck, color: 'bg-purple-50 text-purple-600 border-purple-100' },
  DELIVERED: { label: 'Yetkazib Berildi', icon: CheckCircle2, color: 'bg-green-50 text-green-600 border-green-100' },
};

const getStatusConfig = (state: string) => {
  return statusConfig[state] || { label: state, icon: CheckCircle2, color: 'bg-gray-50 text-gray-600 border-gray-100' };
};

export function ShipmentCard({ item, shipmentLinks, senderAddress }: ShipmentCardProps) {
  const status = getStatusConfig(item.state);
  const StatusIcon = status.icon;
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const updateShipmentStatusMutation = useUpdateShipmentStatus();

  const handleStateUpdate = async (newState: string, actionLabel: string) => {
    const confirmed = window.confirm(
      `Siz haqiqatan ham yuborilish holatini o'zgartirmoqchimisiz?\n\n` +
      `Yuborilish ID: #${item.id}\n` +
      `Hozirgi holat: ${status.label}\n` +
      `Yangi holat: ${getStatusConfig(newState).label}\n\n` +
      `Amalni tasdiqlaysizmi?`
    );

    if (!confirmed) return;

    setIsLoading(true);

    await updateShipmentStatusMutation.mutateAsync({
      shipmentId: item.id,
      newState,
      senderBranchCode: senderAddress?.branch_code,
      senderCityCode: senderAddress?.city_code,
      senderRegionCode: senderAddress?.region_code || '01',
    })
  };

  return (
    <div className="bg-white rounded-[32px] border border-gray-100 p-6 space-y-6 shadow-sm hover:shadow-xl hover:shadow-black/5 transition-all">
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className={cn("px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest flex items-center gap-2", status.color)}>
              <StatusIcon size={12} />
              {status.label}
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              ID: #{item.id} • {dayjs(item.createdAt).format('DD.MM.YYYY HH:mm')}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest leading-none">Buyurtma ID</p>
          <h4 className="text-xl font-black mt-1">#{item.orderId}</h4>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4 border-y border-gray-50">
          <div>
            <div className="flex items-center gap-2 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
              <Building2 size={12} className="text-gray-400" />
              <span>Yuboruvchi (BIZ)</span>
            </div>
            <div>
              <p onClick={() => {
                if (senderAddress?.lat_long) {
                  window.open(`https://www.google.com/maps/dir/?api=1&destination=${senderAddress.lat_long}`, '_blank');
                }
              }} className={cn("text-xs font-bold leading-relaxed uppercase tracking-wide bg-gray-50/50 p-2.5 rounded-xl border border-gray-100", senderAddress?.lat_long ? "text-blue-700 cursor-pointer" : "text-black")}>
                {item.factory ? shipmentLinks?.fromBranchName : (senderAddress?.address || 'AKB Ombori')}
              </p>
            </div>
          </div>

        <div>
          <div className="flex items-center gap-2 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
            <MapPin size={12} className="text-gray-400" />
            <span>Qabul Qiluvchi va Manzil</span>
          </div>

          <p onClick={() => {
            if (shipmentLinks?.toLink) {
              window.open(shipmentLinks.toLink, "_blank");
            }
          }} className={cn("text-xs font-bold leading-relaxed uppercase tracking-wide bg-gray-50/50 p-2.5 rounded-xl border border-gray-100", shipmentLinks?.toLink ? "text-blue-700 cursor-pointer" : "text-black")}>
            {shipmentLinks?.toBranchName || item.order?.address?.address || 'Manzil mavjud emas'}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">
        <Hash size={14} className="text-gray-300 shrink-0" />
        <span>Trek-Raqam: {item.tracking_number ? <b className="text-black select-all">{item.tracking_number}</b> : <span className="italic text-gray-300">Biriktirilmagan</span>}</span>
      </div>

      {/* Order Items Section */}
      {item.orderItems && item.orderItems.length > 0 && (
        <div className="space-y-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center cursor-pointer gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
          >
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            <span>Buyurtma mahsulotlari ({item.orderItems.length} ta)</span>
          </button>
          
          {isExpanded && (
            <div className="bg-gray-50/50 rounded-2xl p-4 space-y-3">
              {item.orderItems.map((orderItem) => (
                <div key={orderItem.id} className="flex gap-3 bg-white rounded-xl p-3 border border-gray-100">
                  {orderItem.product?.product_images && orderItem.product.product_images.length > 0 && (
                    <div className="shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={orderItem.product.product_images[0]}
                        alt={orderItem.product?.translations?.[0]?.name || 'Mahsulot'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-black truncate">
                      {orderItem.product?.translations?.[0]?.name || 'Mahsulot'}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      Miqdor: {orderItem.quantity} ta • Narxi: {orderItem.price.toLocaleString()} so'm
                    </p>
                    {(() => {
                      const link = orderItem.actual_product_link || orderItem.product?.actual_product_link;
                      return link ? (
                        <a
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1.5 rounded-lg bg-black text-white text-[9px] font-black uppercase tracking-widest hover:bg-black/90 transition-all cursor-pointer"
                        >
                          <ExternalLink size={10} />
                          Xitoydan buyurtma
                        </a>
                      ) : null;
                    })()}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-black text-black">
                      {(orderItem.price * orderItem.quantity).toLocaleString()} so'm
                    </p>
                  </div>
                </div>
              ))}
              <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Jami</p>
                <p className="text-sm font-black text-black">
                  {item.orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0).toLocaleString()} so'm
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-2">
        {item.state === 'PENDING' && (
          <Button
            className="flex-1 h-12 cursor-pointer rounded-2xl bg-black text-white font-black uppercase tracking-widest text-[10px] hover:bg-black/90 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => handleStateUpdate('READY_FOR_BTS', 'BTSga tayyorlash')}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 size={14} className="animate-spin mr-2" /> : <ArrowRight size={14} className="mr-2" />}
            {isLoading ? 'Yangilanmoqda...' : 'YUBORISHGA TAYYOR'}
          </Button>
        )}
        {item.state === 'READY_FOR_BTS' && (
          <Button
            className="flex-1 h-12 cursor-pointer rounded-2xl bg-purple-600 text-white font-black uppercase tracking-widest text-[10px] hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => handleStateUpdate('SENT', 'Kuryerga berish')}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 size={14} className="animate-spin mr-2" /> : <Truck size={14} className="mr-2" />}
            {isLoading ? 'Yangilanmoqda...' : 'YUBORILDI'}
          </Button>
        )}
        {item.state === 'SENT' && (
          <Button
            className="flex-1 h-12 cursor-pointer rounded-2xl bg-green-600 text-white font-black uppercase tracking-widest text-[10px] hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => handleStateUpdate('DELIVERED', 'Yetkazib berish')}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 size={14} className="animate-spin mr-2" /> : <CheckCircle2 size={14} className="mr-2" />}
            {isLoading ? 'Yangilanmoqda...' : 'YETKAZIB BERILDI'}
          </Button>
        )}
      </div>
    </div>
  );
}
