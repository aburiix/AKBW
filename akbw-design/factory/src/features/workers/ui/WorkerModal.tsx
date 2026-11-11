'use client';

import React, {
  useEffect,
  useState
} from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/shared/ui/sheet';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Loader2 } from 'lucide-react';
import { useCreateWorker, useUpdateWorker } from '../lib/hooks';

interface WorkerModalProps {
  isOpen: boolean;
  onClose: () => void;
  worker?: any; // If provided, we are editing
}

export default function WorkerModal({ isOpen, onClose, worker }: WorkerModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('');
  const [tgId, setTgId] = useState('');

  const createMutation = useCreateWorker();
  const updateMutation = useUpdateWorker();

  const isEditing = !!worker;

  useEffect(() => {
    if (worker) {
      setName(worker.name || '');
      setPhone(worker.phone || '');
      setRole(worker.role || '');
      setTgId(worker.tg_id || '');
    } else {
      setName('');
      setPhone('');
      setRole('');
      setTgId('');
    }
  }, [worker, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { name, phone, role, tg_id: tgId };

    if (isEditing) {
      updateMutation.mutate(
        { id: worker.id, ...data },
        {
          onSuccess: (res) => {
            if (res.ok) onClose();
          },
        }
      );
    } else {
      createMutation.mutate(data, {
        onSuccess: (res) => {
          if (res.ok) onClose();
        },
      });
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="sm:max-w-md border-l-0 shadow-2xl">
        <SheetHeader className="pb-8">
          <SheetTitle className="text-2xl font-black uppercase tracking-tight">
            {isEditing ? "Ishchini tahrirlash" : "Yangi ishchi qo'shish"}
          </SheetTitle>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
            Barcha maydonlarni to'ldiring
          </p>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-black text-gray-400 ml-1">
              F.I.SH
            </label>
            <Input
              placeholder="Ism sharifini kiriting"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-12 rounded-2xl border-gray-100 font-bold focus:ring-black/5"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-black text-gray-400 ml-1">
              Telefon raqami
            </label>
            <Input
              placeholder="+998 90 123 45 67"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-12 rounded-2xl border-gray-100 font-bold focus:ring-black/5"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-black text-gray-400 ml-1">
              Lavozimi
            </label>
            <Input
              placeholder="Masalan: Operator, Tikuvchi"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="h-12 rounded-2xl border-gray-100 font-bold focus:ring-black/5"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-black text-gray-400 ml-1">
              Telegram Idsi
            </label>
            <div className="relative">
              <Input
                placeholder="id"
                value={tgId}
                onChange={(e) => setTgId(e.target.value)}
                className="h-12 rounded-2xl border-gray-100 font-bold focus:ring-black/5 pl-8"
              />
            </div>
          </div>

          <SheetFooter className="pt-8">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 rounded-2xl bg-black text-white font-black uppercase tracking-widest text-[10px] shadow-xl shadow-black/10 hover:scale-[1.02] active:scale-95 transition-all"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : isEditing ? (
                "Saqlash"
              ) : (
                "Qo'shish"
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
