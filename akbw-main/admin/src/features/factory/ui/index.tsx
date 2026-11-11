'use client';

import React, { useState } from 'react';
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Building2,
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import AddFactoryModal from './add-factory-modal';
import DeleteConfirmModal from './delete-confirm-modal';
import { useFactories, useDeleteFactory } from '../lib/hooks';
import type { IFactory } from '@/shared/config/api/factory/factory.model';
import Loading from '@/widgets/loading/ui';

export default function Factories() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { data: factoriesData, isLoading } = useFactories();
  const deleteMutation = useDeleteFactory();

  const [open, setOpen] = useState(false);
  const [selectedFactory, setSelectedFactory] = useState<IFactory | null>(null);
  const [deletingFactory, setDeletingFactory] = useState<IFactory | null>(null);

  if (isLoading)
    return (
      <div className="flex items-center justify-center p-20">
        <Loading />
      </div>
    );

  const factories = factoriesData?.data || [];

  const filteredFactories = factories.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.phone.includes(searchQuery) ||
    f.bts_region_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.bts_city_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.bts_branch_code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (factory: IFactory) => {
    setSelectedFactory(factory);
    setOpen(true);
  };

  const handleDelete = (factory: IFactory) => {
    setDeletingFactory(factory);
  };

  const confirmDelete = async () => {
    if (deletingFactory) {
      await deleteMutation.mutateAsync(deletingFactory.id);
      setDeletingFactory(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight">
            Zavodlar
          </h1>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
            Hamkor zavodlarni boshqarish
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedFactory(null);
            setOpen(true);
          }}
          className="rounded-2xl bg-black text-white px-6 py-6 h-auto font-black uppercase tracking-widest text-xs flex items-center gap-2 shadow-xl shadow-black/10 transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <Plus size={18} />
          Zavod qo‘shish
        </Button>
      </div>

      <AddFactoryModal
        isOpen={open}
        factory={selectedFactory}
        onClose={() => {
          setOpen(false);
          setSelectedFactory(null);
        }}
      />

      <DeleteConfirmModal
        isOpen={!!deletingFactory}
        onClose={() => setDeletingFactory(null)}
        onConfirm={confirmDelete}
        title="Zavodni o‘chirasizmi?"
        description={`Siz haqiqatan ham "${deletingFactory?.name}" zavodini o‘chirmoqchimisiz? Bu amalni ortga qaytarib bo‘lmaydi.`}
      />

      <div className="bg-white p-4 rounded-[24px] border border-gray-100 flex flex-col md:flex-row gap-4 items-center shadow-sm">
        <div className="relative flex-1 w-full">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <Input
            placeholder="Zavod nomi, telefon yoki BTS kodi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 bg-gray-50 border-none rounded-2xl text-sm focus-visible:ring-1 focus-visible:ring-black/5"
          />
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-left text-[10px] uppercase tracking-[0.2em] font-black text-gray-400">
                  Zavod
                </th>
                <th className="px-6 py-4 text-left text-[10px] uppercase tracking-[0.2em] font-black text-gray-400">
                  Telefon
                </th>
                <th className="px-6 py-4 text-left text-[10px] uppercase tracking-[0.2em] font-black text-gray-400">
                  Manzil
                </th>
                <th className="px-6 py-4 text-left text-[10px] uppercase tracking-[0.2em] font-black text-gray-400">
                  BTS Kodi
                </th>
                <th className="px-6 py-4 text-left text-[10px] uppercase tracking-[0.2em] font-black text-gray-400">
                  To‘lov turi
                </th>
                <th className="px-6 py-4 text-right text-[10px] uppercase tracking-[0.2em] font-black text-gray-400">
                  Amallar
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredFactories.map((factory: IFactory) => (
                <tr
                  key={factory.id}
                  className="hover:bg-gray-50/50 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400">
                        <Building2 size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold tracking-tight">
                          {factory.name}
                        </p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                          ID: #{factory.id}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold">
                    {factory.phone}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 truncate max-w-[200px]">
                    {factory.address}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full">
                      {factory.bts_region_code} - {factory.bts_city_code} - {factory.bts_branch_code}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-600">
                    {factory.payment_type}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0 rounded-xl hover:bg-gray-100 cursor-pointer"
                        >
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="rounded-2xl border-gray-100 p-2 shadow-xl"
                      >
                        <DropdownMenuLabel className="text-[10px] uppercase tracking-widest font-black text-gray-400 px-3 py-2">
                          Amallar
                        </DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => handleEdit(factory)}
                          className="rounded-xl gap-3 px-3 py-2 cursor-pointer"
                        >
                          <Pencil size={16} className="text-gray-400" />
                          <span className="text-xs font-bold uppercase tracking-wider">
                            Tahrirlash
                          </span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-gray-50" />
                        <DropdownMenuItem
                          onClick={() => handleDelete(factory)}
                          className="rounded-xl gap-3 px-3 py-2 text-red-500 hover:bg-red-50 cursor-pointer"
                        >
                          <Trash2 size={16} />
                          <span className="text-xs font-bold uppercase tracking-wider">
                            O‘chirish
                          </span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
              {filteredFactories.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Building2 size={40} className="text-gray-200" />
                      <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                        Zavodlar topilmadi
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
