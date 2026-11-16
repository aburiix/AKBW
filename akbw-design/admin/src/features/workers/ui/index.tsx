'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, Send, Trash2, UserCog, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { extractError } from '@/shared/lib/extractError';
import {
  createWorker,
  deleteWorker,
  getAllWorkers,
  getFactoriesShort,
  updateWorker,
  type IWorker,
  type IWorkerInput,
} from '@/shared/config/api/worker/worker.request';

const empty: IWorkerInput = {
  name: '',
  phone: '',
  role: '',
  tg_id: '',
  factory_id: 0,
};

/** Ishchilar: ishchi bot (@smssenderrrrruzbot) faqat shu ro'yxatdagi Telegram ID'larga ishlaydi */
export default function Workers() {
  const qc = useQueryClient();
  const { data: workers = [], isLoading } = useQuery({
    queryKey: ['admin-workers'],
    queryFn: getAllWorkers,
  });
  const { data: factories = [] } = useQuery({
    queryKey: ['admin-factories-short'],
    queryFn: getFactoriesShort,
  });
  const [form, setForm] = useState<IWorkerInput | null>(null);
  const [editId, setEditId] = useState<number | null>(null);

  const done = (msg: string) => {
    toast.success(msg);
    qc.invalidateQueries({ queryKey: ['admin-workers'] });
    setForm(null);
    setEditId(null);
  };
  const onErr = (e: unknown) =>
    toast.error(extractError(e) || 'Xatolik yuz berdi');
  const save = useMutation({
    mutationFn: (f: IWorkerInput) =>
      editId ? updateWorker({ id: editId, ...f }) : createWorker(f),
    onSuccess: () => done(editId ? 'Saqlandi' : "Ishchi qo'shildi"),
    onError: onErr,
  });
  const remove = useMutation({
    mutationFn: deleteWorker,
    onSuccess: () => done("Ishchi o'chirildi"),
    onError: onErr,
  });

  const startNew = () => {
    setEditId(null);
    setForm({ ...empty, factory_id: factories[0]?.id ?? 0 });
  };
  const startEdit = (w: IWorker) => {
    setEditId(w.id);
    setForm({
      name: w.name,
      phone: w.phone,
      role: w.role,
      tg_id: w.tg_id,
      factory_id: w.factory_id,
    });
  };
  const set =
    (k: keyof IWorkerInput) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) =>
        f
          ? {
              ...f,
              [k]: k === 'factory_id' ? Number(e.target.value) : e.target.value,
            }
          : f,
      );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight">
            Ishchilar
          </h1>
          <p className="text-sm text-gray-500 mt-1 max-w-2xl">
            Ishchi bot faqat shu ro‘yxatdagi Telegram ID’larga javob beradi va
            ishchiga o‘z zavodining buyurtma va jo‘natmalarini ko‘rsatadi. Yangi
            buyurtma haqida xabar ham shu ishchilarga boradi.
          </p>
        </div>
        <Button
          onClick={startNew}
          disabled={!factories.length}
          className="rounded-xl bg-black hover:bg-black/90 gap-2"
        >
          <Plus size={16} /> Ishchi qo‘shish
        </Button>
      </div>

      {!factories.length && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Ishchi biror zavodga biriktiriladi. Avval{' '}
          <Link href="factory" className="font-bold underline">
            Zavodlar
          </Link>{' '}
          bo‘limida zavod qo‘shing.
        </div>
      )}

      {form && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate(form);
          }}
          className="rounded-[24px] border border-gray-100 bg-white p-6 shadow-sm space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-black uppercase tracking-tight">
              {editId ? 'Ishchini tahrirlash' : 'Yangi ishchi'}
            </h3>
            <button
              type="button"
              onClick={() => setForm(null)}
              className="p-2 rounded-xl hover:bg-gray-50"
              aria-label="Yopish"
            >
              <X size={18} />
            </button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1.5">
              <span className="text-xs font-bold text-gray-500">
                Ism familiya *
              </span>
              <Input
                id="w-name"
                value={form.name}
                onChange={set('name')}
                required
                className="rounded-xl"
              />
            </label>
            <label className="space-y-1.5">
              <span className="text-xs font-bold text-gray-500">Telefon *</span>
              <Input
                id="w-phone"
                value={form.phone}
                onChange={set('phone')}
                required
                placeholder="+998 90 123 45 67"
                className="rounded-xl"
              />
            </label>
            <label className="space-y-1.5">
              <span className="text-xs font-bold text-gray-500">
                Telegram ID * (faqat raqam)
              </span>
              <Input
                id="w-tg"
                value={form.tg_id}
                onChange={set('tg_id')}
                required
                inputMode="numeric"
                pattern="\d{5,15}"
                placeholder="123456789"
                className="rounded-xl"
              />
            </label>
            <label className="space-y-1.5">
              <span className="text-xs font-bold text-gray-500">Zavod *</span>
              <select
                id="w-factory"
                value={form.factory_id || ''}
                onChange={set('factory_id')}
                required
                className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm"
              >
                {factories.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1.5 md:col-span-2">
              <span className="text-xs font-bold text-gray-500">Lavozim</span>
              <Input
                id="w-role"
                value={form.role}
                onChange={set('role')}
                placeholder="Masalan: omborchi, tikuvchi"
                className="rounded-xl"
              />
            </label>
          </div>
          <p className="text-xs text-gray-500 flex items-start gap-2">
            <Send size={14} className="mt-0.5 shrink-0" />
            Telegram ID’ni bilish: ishchi botga <b>/start</b> yozsin — bot
            javobida «Sizning Telegram ID» ko‘rsatiladi.
          </p>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setForm(null)}
              className="rounded-xl"
            >
              Bekor qilish
            </Button>
            <Button
              type="submit"
              disabled={save.isPending}
              className="rounded-xl bg-black hover:bg-black/90"
            >
              {save.isPending ? 'Saqlanmoqda…' : 'Saqlash'}
            </Button>
          </div>
        </form>
      )}

      <div className="rounded-[24px] border border-gray-100 bg-white shadow-sm overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-widest text-gray-400 border-b border-gray-100">
              <th className="p-4">Ishchi</th>
              <th className="p-4">Telefon</th>
              <th className="p-4">Telegram ID</th>
              <th className="p-4">Zavod</th>
              <th className="p-4">Lavozim</th>
              <th className="p-4 w-28" />
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td
                  colSpan={6}
                  className="p-8 text-center text-gray-400 font-bold"
                >
                  Yuklanmoqda...
                </td>
              </tr>
            )}
            {!isLoading && workers.length === 0 && (
              <tr>
                <td colSpan={6} className="p-10 text-center">
                  <UserCog size={36} className="mx-auto text-gray-200 mb-2" />
                  <p className="text-gray-400 font-bold">
                    Hozircha ishchilar yo‘q
                  </p>
                </td>
              </tr>
            )}
            {workers.map((w) => (
              <tr key={w.id} className="border-b border-gray-50 last:border-0">
                <td className="p-4 font-bold">{w.name}</td>
                <td className="p-4 tabular-nums">{w.phone}</td>
                <td className="p-4 tabular-nums">
                  {w.tg_id || <span className="text-red-500">yo‘q</span>}
                </td>
                <td className="p-4">{w.factory?.name ?? `#${w.factory_id}`}</td>
                <td className="p-4 text-gray-500">{w.role || '—'}</td>
                <td className="p-4">
                  <div className="flex justify-end gap-1">
                    <button
                      onClick={() => startEdit(w)}
                      className="p-2 rounded-xl hover:bg-gray-50"
                      aria-label="Tahrirlash"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => {
                        if (
                          window.confirm(
                            `${w.name} o‘chirilsinmi? U botdan foydalana olmay qoladi.`,
                          )
                        )
                          remove.mutate(w.id);
                      }}
                      className="p-2 rounded-xl hover:bg-red-50 text-red-500"
                      aria-label="O'chirish"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
