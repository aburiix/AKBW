'use client';

import React, { useState } from 'react';
import { useGetWorkers, useDeleteWorker } from '../lib/hooks';
import WorkerModal from './WorkerModal';
import { Button } from '@/shared/ui/button';
import {
  UserPlus,
  Search,
  MoreVertical,
  Trash2,
  Edit2,
  MessageCircle,
  Phone,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { Skeleton } from '@/shared/ui/skeleton';

export default function WorkersView() {
  const { data, isLoading } = useGetWorkers();
  const deleteMutation = useDeleteWorker();

  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleEdit = (worker: any) => {
    setSelectedWorker(worker);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedWorker(null);
    setModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Haqiqatan ham ushbu ishchini o'chirmoqchimisiz?")) {
      deleteMutation.mutate(id);
    }
  };

  const workers = data?.workers || [];
  console.log(data, "data");

  const filteredWorkers = workers.filter((w: any) =>
    w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.phone.includes(searchTerm) ||
    w.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter">
            Ishchilar
          </h1>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-2">
            Zavod xodimlari va hamkorlar boshqaruvi
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={18} />
            <input
              type="text"
              placeholder="Qidirish..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-12 pl-12 pr-6 rounded-2xl bg-white border border-gray-100 font-bold text-sm focus:ring-4 focus:ring-black/5 focus:border-black outline-none transition-all w-full md:w-64"
            />
          </div>
          <Button
            onClick={handleAdd}
            className="h-12 px-6 rounded-2xl bg-black text-white font-black uppercase tracking-widest text-[10px] shadow-xl shadow-black/10 hover:scale-[1.02] active:scale-95 transition-all"
          >
            <UserPlus size={18} className="mr-2" />
            Xodim qo'shish
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-gray-100 shadow-2xl shadow-black/5 overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50/50">
                <th className="px-8 py-5 text-[10px] uppercase font-black tracking-widest text-gray-400">Ishchi</th>
                <th className="px-8 py-5 text-[10px] uppercase font-black tracking-widest text-gray-400">Lavozimi</th>
                <th className="px-8 py-5 text-[10px] uppercase font-black tracking-widest text-gray-400">Kontakt</th>
                <th className="px-8 py-5 text-[10px] uppercase font-black tracking-widest text-gray-400">Telegram</th>
                <th className="px-8 py-5 text-[10px] uppercase font-black tracking-widest text-gray-400 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-8 py-6"><Skeleton className="h-4 w-32 rounded-full" /></td>
                    <td className="px-8 py-6"><Skeleton className="h-4 w-24 rounded-full" /></td>
                    <td className="px-8 py-6"><Skeleton className="h-4 w-28 rounded-full" /></td>
                    <td className="px-8 py-6"><Skeleton className="h-4 w-20 rounded-full" /></td>
                    <td className="px-8 py-6 text-right"><Skeleton className="h-8 w-8 ml-auto rounded-full" /></td>
                  </tr>
                ))
              ) : filteredWorkers.length > 0 ? (
                filteredWorkers.map((worker: any) => (
                  <tr key={worker.id} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-black/5 flex items-center justify-center text-black font-black text-sm uppercase">
                          {worker.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-sm uppercase">{worker.name}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">ID: #{worker.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="inline-flex items-center px-3 py-1 rounded-xl bg-orange-50 text-orange-600 text-[10px] font-black uppercase tracking-widest">
                        {worker.role || "Xodim"}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-gray-500">
                        <Phone size={14} />
                        <span className="font-bold text-sm tracking-tight">{worker.phone}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      {worker.tg_username ? (
                        <a
                          href={`https://t.me/${worker.tg_username.replace('@', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-blue-500 hover:text-blue-600 transition-colors"
                        >
                          <MessageCircle size={14} />
                          <span className="font-bold text-sm tracking-tight">@{worker.tg_username.replace('@', '')}</span>
                        </a>
                      ) : (
                        <span className="text-gray-300 font-bold text-xs">—</span>
                      )}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors outline-none cursor-pointer">
                            <MoreVertical size={18} className="text-gray-400" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 p-2 rounded-2xl border-gray-100 shadow-2xl">
                          <DropdownMenuItem
                            onClick={() => handleEdit(worker)}
                            className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-gray-50 outline-none"
                          >
                            <div className="w-8 h-8 rounded-lg bg-black/5 flex items-center justify-center text-black">
                              <Edit2 size={16} />
                            </div>
                            <span className="font-black text-[10px] uppercase tracking-widest text-gray-600">Tahrirlash</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(worker.id)}
                            className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-red-50 text-red-600 outline-none group"
                          >
                            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-600 group-hover:bg-red-100 transition-colors">
                              <Trash2 size={16} />
                            </div>
                            <span className="font-black text-[10px] uppercase tracking-widest">O'chirish</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <p className="text-gray-400 font-black uppercase tracking-widest text-sm">Hech qanday ishchi topilmadi</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <WorkerModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        worker={selectedWorker}
      />
    </div>
  );
}
