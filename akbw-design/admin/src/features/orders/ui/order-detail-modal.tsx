'use client';

import React, { useEffect } from 'react';
import {
  X,
  Printer,
  Truck,
  CreditCard,
  ShoppingBag,
  Calendar,
  Package,
  CheckCircle2,
  MapPin,
  ArrowRight,
  Hash,
  ExternalLink,
} from 'lucide-react';
import {
  Button
} from '@/shared/ui/button';
import {
  Modal,
  ModalContent,
  ModalTitle,
  ModalDescription,
} from '@/shared/ui/modal';
import {
  useGetDeliveryFromToLinks,
  useGetOrderShipments,
  useUpdateOrderStatus
} from '../lib/hooks';
import { toast } from 'sonner';
import { useReactToPrint } from 'react-to-print';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { IDeliveryFromToLinkResponse } from '@/shared/config/api/delivery/delivery.model';

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
}

export default function OrderDetailModal({
  isOpen,
  onClose,
  order,
}: OrderDetailModalProps) {
  const [deliveryFromToLinks, setDeliveryFromToLinks] = React.useState<IDeliveryFromToLinkResponse[]>([]);
  const updateStatusMutation = useUpdateOrderStatus();
  const contentRef = React.useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({ contentRef });

  const { data: shipmentsData, isLoading: shipmentsLoading, error: shipmentsError } = useGetOrderShipments(order?.id?.toString());
  const getDeliveryFromToLinksMutation = useGetDeliveryFromToLinks();

  useEffect(() => {
    if (shipmentsData) {
      getDeliveryFromToLinksMutation.mutate({
        shipmentIds: shipmentsData.map((shipment: any) => String(shipment.id)),
      }, {
        onSuccess: (data: IDeliveryFromToLinkResponse[]) => {
          setDeliveryFromToLinks(data);
        }
      });
    }
  }, [shipmentsData]);

  if (!order) return null;

  const handleUpdateStatus = async (status: string) => {
    try {
      await updateStatusMutation.mutateAsync({ id: order.id, status });
      toast.success('Status muvaffaqiyatli yangilandi');
    } catch (error) {
      toast.error('Statusni yangilashda xatolik yuz berdi');
    }
  };

  const getShipmentBadgeColor = (state: string) => {
    switch (state) {
      case 'PENDING':
      case 'ORDERED_FROM_SUPPLIER':
      case 'SUPPLIER_CONFIRMED':
      case 'IN_TRANSIT':
      case 'ARRIVED_UZBEKISTAN':
      case 'IN_CUSTOMS':
      case 'READY_FOR_BTS':
      case 'SENT':
      case 'DELIVERED':
      case 'CANCELLED':
        return `bg-${status.toLowerCase().replace('_', '-')}-50 text-${status.toLowerCase().replace('_', '-')}-700 border-${status.toLowerCase().replace('_', '-')}-100`;
    }
  };

  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent className="max-w-4xl bg-white p-0 overflow-hidden border-none rounded-[32px] shadow-2xl">
        <div className="flex flex-col h-[90vh] print:h-auto" ref={contentRef}>
          <div className="p-8 border-b border-gray-50 flex justify-between items-start bg-gray-50/30">
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full mb-3">
                #BUYURTMA {order.id}
              </span>
              <ModalTitle className="text-2xl font-black uppercase tracking-tight">
                Buyurtma tafsilotlari
              </ModalTitle>
              <ModalDescription className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1 flex items-center gap-2">
                <Calendar size={12} />
                {new Date(order.createdAt).toLocaleString()}
              </ModalDescription>
            </div>
            <div className="flex items-center gap-3 print:hidden">
              <Button
                onClick={() => handlePrint()}
                variant="outline"
                className="rounded-xl border-gray-200 h-11 px-4 text-xs font-black uppercase tracking-widest cursor-pointer"
              >
                <Printer size={16} className="mr-2" />
                Chop etish
              </Button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white rounded-full transition-all cursor-pointer"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-8 overflow-y-auto no-scrollbar">
            <div className="space-y-8">

              {/* 1. Maxsulotlar ro'yxati */}
              <div className="bg-white rounded-3xl border border-gray-100 p-6">
                <h3 className="text-[10px] uppercase tracking-widest font-black text-gray-400 mb-6 flex items-center gap-2">
                  <ShoppingBag size={14} />
                  Buyurtma qilingan barcha maxsulotlar
                </h3>
                <div className="space-y-6">
                  {order.orderItems?.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex gap-4 pb-6 border-b border-gray-50 last:border-0 last:pb-0"
                    >
                      <div className="w-20 h-20 rounded-2xl bg-gray-50 overflow-hidden shrink-0">
                        <img
                          src={
                            item.product?.product_images?.[0] ||
                            `https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=200&q=80`
                          }
                          alt="product"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 py-1">
                        <div className="flex justify-between">
                          <h4 className="text-sm font-black uppercase">
                            {item.product?.translations?.[0]?.name || 'Mahsulot nomi yo‘q'}
                          </h4>
                          <span className="text-sm font-black">
                            {item.price?.toLocaleString()} so'm
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                          {item.size?.translations?.[0]?.name || '-'} /{' '}
                          {item.color?.translations?.[0]?.name || '-'}
                        </p>
                        <div className="flex justify-between items-end mt-2">
                          <span className="text-xs font-bold text-gray-500">
                            Soni: {item.quantity}
                          </span>
                        </div>
                        {(() => {
                          const link = item.actual_product_link || item.product?.actual_product_link;
                          return link ? (
                            <a
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 mt-3 px-3 py-2 rounded-xl bg-black text-white text-[10px] font-black uppercase tracking-widest hover:bg-black/90 transition-all cursor-pointer"
                            >
                              <ExternalLink size={12} />
                              Xitoydan buyurtma berish
                            </a>
                          ) : null;
                        })()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Yuklar (Shipments) Bo'limi */}
              <div className="bg-white rounded-3xl border border-gray-100 p-6">
                <h3 className="text-[10px] uppercase tracking-widest font-black text-gray-400 mb-6 flex items-center gap-2">
                  <Truck size={14} />
                  Yuklar alohida ko'rinishda (Posilkalar)
                </h3>

                {shipmentsError?.message && (
                  <div className="text-red-500 text-xs font-bold uppercase mb-4 bg-red-50 p-4 rounded-xl border border-red-100">
                    {shipmentsError.message}
                  </div>
                )}

                {shipmentsLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-2">
                    <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Yuklar yuklanmoqda...</span>
                  </div>
                ) : shipmentsData && shipmentsData.length > 0 ? (
                  <div className="grid grid-cols-1 gap-6">
                    {shipmentsData.map((shipment: any) => {

                      const deliveryFromToData = deliveryFromToLinks.find((link: IDeliveryFromToLinkResponse) => link.shipmentId == shipment.id);

                      return (
                        <div
                          key={shipment.id}
                          className="border border-gray-100 rounded-2xl p-5 bg-gray-50/20 hover:border-gray-200 transition-all"
                        >
                          {/* Shipment Card Top Info */}
                          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-gray-100/70">
                            <div className="flex items-center gap-3">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-gray-100 text-black text-[10px] font-black uppercase tracking-wider">
                                ID: {shipment.id}
                              </span>
                              <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-black text-white text-[10px] font-black uppercase tracking-wider">
                                {shipment.type}
                              </span>
                            </div>

                            <span className={`inline-flex items-center px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${getShipmentBadgeColor(shipment.state)}`}>
                              {shipment.state}
                            </span>
                          </div>

                          {/* Route Info */}
                          <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4 py-4">
                            {/* From */}
                            <div className="space-y-1">
                              <span className="text-[9px] uppercase tracking-widest font-black text-gray-400 flex items-center gap-1">
                                <MapPin size={10} className="text-gray-400" /> Jo'natuvchi
                              </span>
                              <p className="text-xs font-bold text-blue-500 cursor-pointer" onClick={() => {
                                window.open(deliveryFromToData?.fromLink, "_blank");
                              }}>
                                {
                                  deliveryFromToData?.fromBranchName
                                }
                              </p>
                            </div>

                            {/* Arrow spacer */}
                            <div className="hidden md:flex justify-center text-gray-300">
                              <ArrowRight size={20} />
                            </div>

                            {/* To */}
                            <div className="space-y-1">
                              <span className="text-[9px] uppercase tracking-widest font-black text-gray-400 flex items-center gap-1">
                                <MapPin size={10} className="text-black" /> Qabul qiluvchi
                              </span>
                              <p className="text-xs font-bold cursor-pointer text-blue-500" onClick={() => {
                                window.open(deliveryFromToData?.toLink, "_blank");
                              }}>
                                {
                                  deliveryFromToData?.toBranchName
                                }
                              </p>
                            </div>
                          </div>

                          {/* Full Delivery Address & Tracking */}
                          <div className="pt-4 border-t border-gray-100/70 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50/50 -mx-5 -mb-5 p-5 rounded-b-2xl">
                            <div>
                              <span className="text-[9px] uppercase tracking-widest font-black text-gray-400 block mb-1">
                                Yetkazish manzili
                              </span>
                              <p className="text-xs font-bold text-gray-700 leading-relaxed">
                                {shipment.receiver_address || "Manzil ko'rsatilmagan"}
                              </p>
                            </div>
                            <div className="sm:text-right flex flex-col sm:items-end justify-center">
                              <span className="text-[9px] uppercase tracking-widest font-black text-gray-400 flex items-center gap-1 mb-1">
                                <Hash size={10} /> BTS Tracking raqam
                              </span>
                              <p className="text-xs font-black uppercase tracking-wider text-black">
                                {shipment.tracking_number ? (
                                  <span className="bg-white px-2.5 py-1 rounded-md border border-gray-200 shadow-sm">{shipment.tracking_number}</span>
                                ) : (
                                  <span className="text-gray-400 font-bold italic">Hali biriktirilmagan</span>
                                )}
                              </p>
                            </div>
                          </div>

                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-10 border border-dashed border-gray-200 rounded-2xl">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Ushbu buyurtmaga tegishli yuklar topilmadi</p>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
}