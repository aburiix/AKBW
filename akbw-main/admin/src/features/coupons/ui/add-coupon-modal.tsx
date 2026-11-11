'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import {
  Modal,
  ModalContent,
  ModalTitle,
  ModalDescription,
} from '@/shared/ui/modal';

import { ICoupon } from '@/shared/config/api/coupon/coupon.model';
import {
  useCreateCoupon,
  useUpdateCoupon,
} from '../lib/hooks';
import { toast } from 'sonner';

interface AddCouponModalProps {
  isOpen: boolean;
  onClose: () => void;
  coupon?: ICoupon | null;
  viewOnly?: boolean;
}

export default function AddCouponModal({
  isOpen,
  onClose,
  coupon,
  viewOnly,
}: AddCouponModalProps) {
  const [code, setCode] = useState<string>('');
  const [discount, setDiscount] = useState<string>('');
  const [expiry, setExpiry] = useState<string>('');

  const createMutation = useCreateCoupon();
  const updateMutation = useUpdateCoupon();

  useEffect(() => {
    if (coupon) {
      setCode(coupon.code);
      setDiscount(coupon.discount.toString());
      const dateStr = new Date(coupon.expiry).toISOString().split('T')[0];
      setExpiry(dateStr);
    } else {
      setCode('');
      setDiscount('');
      setExpiry('');
    }
  }, [coupon, isOpen]);

  const handleSave = async () => {
    if (!code || !discount || !expiry) {
      toast.error('Barcha maydonlarni to‘ldirish majburiy');
      return;
    }

    const payload = {
      code,
      discount: Number(discount),
      expiry: new Date(expiry).toISOString(),
    };

    try {
      if (coupon) {
        await updateMutation.mutateAsync({ id: coupon.id, ...payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      onClose();
    } catch (error) {
      // Error is handled in hook
    }
  };

  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent className="max-w-md bg-white p-0 overflow-hidden border-none rounded-[32px] shadow-2xl">
        <div className="flex flex-col">
          <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
            <div>
              <ModalTitle className="text-xl font-black uppercase tracking-tight">
                {viewOnly
                  ? 'Kupon ma’lumotlari'
                  : coupon
                    ? 'Kuponni tahrirlash'
                    : 'Kupon qo‘shish'}
              </ModalTitle>
              <ModalDescription className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                {viewOnly
                  ? 'Kupon tafsilotlarini ko‘rish'
                  : coupon
                    ? 'Kupon ma’lumotlarini o‘zgartirish'
                    : 'Yangi kupon kodini yarating'}
              </ModalDescription>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white rounded-full transition-all cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-black text-gray-400">
                Kupon kodi
              </label>
              <Input
                disabled={viewOnly}
                placeholder="PROMO2026..."
                className="h-12 border-gray-100 rounded-2xl focus-visible:ring-black/10 font-bold uppercase"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-black text-gray-400">
                Chegirma miqdori (Foiz)
              </label>
              <Input
                disabled={viewOnly}
                type="number"
                placeholder="20"
                className="h-12 border-gray-100 rounded-2xl focus-visible:ring-black/10 font-bold"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-black text-gray-400">
                Amal qilish muddati (EXPIRY)
              </label>
              <Input
                disabled={viewOnly}
                type="date"
                className="h-12 border-gray-100 rounded-2xl focus-visible:ring-black/10 font-bold"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
              />
            </div>
          </div>

          <div className="p-8 border-t border-gray-50 flex justify-end bg-gray-50/30 gap-4">
            <Button
              variant="ghost"
              onClick={onClose}
              className="rounded-[20px] h-14 px-8 font-black uppercase tracking-widest text-[10px] cursor-pointer"
            >
              {viewOnly ? 'Yopish' : 'Bekor qilish'}
            </Button>
            {!viewOnly && (
              <Button
                onClick={handleSave}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="rounded-[20px] h-14 px-12 bg-black text-white font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-black/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                {createMutation.isPending || updateMutation.isPending
                  ? 'Saqlanmoqda...'
                  : 'Saqlash'}
              </Button>
            )}
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
}
