'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Brain, Inbox, Phone, Ruler, Search, Sparkles, User } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Input } from '@/shared/ui/input';
import { getAiThread, getAiThreads } from '@/shared/config/api/assistant/assistant.request';

const time = (d: string) =>
  new Date(d).toLocaleString('uz-UZ', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

/** Mijozlarning AKBW AI bilan suhbatlari (faqat ko'rish). Har 15 soniyada yangilanadi. */
export default function AiChats() {
  const [search, setSearch] = useState('');
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState<string | null>(null);

  // Qidiruvni yozib bo'lgach yuborish
  useEffect(() => {
    const t = setTimeout(() => setQ(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  const { data: list, isLoading } = useQuery({
    queryKey: ['admin-ai-threads', q],
    queryFn: () => getAiThreads({ q: q || undefined }),
    refetchInterval: 15000,
  });
  const threads = useMemo(() => list?.data ?? [], [list]);
  const activeId = selected ?? threads[0]?.id ?? null;

  const { data: detail, isFetching } = useQuery({
    queryKey: ['admin-ai-thread', activeId],
    queryFn: () => getAiThread(activeId!),
    enabled: !!activeId,
    refetchInterval: 15000,
  });

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-140px)] items-center justify-center bg-white rounded-[32px]">
        <p className="text-gray-400 font-bold animate-pulse">Yuklanmoqda...</p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-140px)] bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm">
      {/* Ro'yxat */}
      <div className="w-[360px] shrink-0 border-r border-gray-100 flex flex-col">
        <div className="p-6 border-b border-gray-50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
              <Sparkles size={18} /> AI suhbatlar
            </h2>
            <span className="text-[11px] font-bold text-gray-400">{list?.meta.total ?? 0} ta</span>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ism, telefon yoki mavzu..."
              className="pl-10 rounded-xl bg-gray-50 border-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar">
          {threads.length === 0 && (
            <div className="p-10 text-center">
              <Inbox size={40} className="mx-auto text-gray-200 mb-3" />
              <p className="text-gray-400 font-bold text-sm">{q ? 'Hech narsa topilmadi' : "Hozircha AI suhbatlar yo'q"}</p>
            </div>
          )}
          {threads.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelected(t.id)}
              className={cn(
                'w-full p-4 cursor-pointer flex gap-3 transition-all hover:bg-gray-50 text-left border-b border-gray-50/50',
                activeId === t.id && 'bg-gray-50 border-l-4 border-black',
              )}
            >
              <div className="w-11 h-11 shrink-0 rounded-full bg-gray-100 flex items-center justify-center">
                <User size={20} className="text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2 mb-0.5">
                  <h4 className="font-bold text-sm truncate">
                    {[t.user?.name, t.user?.lastName].filter(Boolean).join(' ') || 'Foydalanuvchi'}
                  </h4>
                  <span className="text-[10px] text-gray-400 font-bold shrink-0">{time(t.updatedAt)}</span>
                </div>
                <p className="text-[12px] font-semibold text-gray-700 truncate">{t.title || '—'}</p>
                <p className="text-xs text-gray-500 truncate">
                  {t.last ? `${t.last.role === 'assistant' ? 'AI: ' : ''}${t.last.text}` : "Xabar yo'q"}
                </p>
                <span className="inline-block mt-1 text-[10px] font-bold text-gray-400">{t.messageCount} ta xabar</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Suhbat */}
      {detail ? (
        <div className="flex-1 min-w-0 flex">
          <div className="flex-1 min-w-0 flex flex-col bg-gray-50/30">
            <div className="p-6 bg-white border-b border-gray-100 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-10 h-10 shrink-0 rounded-full bg-black/5 flex items-center justify-center">
                  <User size={20} className="text-black" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-base truncate">
                    {[detail.thread.user.name, detail.thread.user.lastName].filter(Boolean).join(' ') || 'Foydalanuvchi'}
                  </h3>
                  <p className="text-[11px] text-gray-400 font-bold flex items-center gap-1.5">
                    <Phone size={11} /> {detail.thread.user.phone}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 shrink-0">
                {isFetching ? 'Yangilanmoqda…' : 'Faqat ko‘rish'}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
              <div className="flex flex-col gap-5">
                {detail.messages.map((m) => (
                  <div key={m.id} className={cn('flex flex-col max-w-[75%]', m.role === 'user' ? 'ml-auto items-end' : 'mr-auto items-start')}>
                    <span className="text-[10px] mb-1 text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1">
                      {m.role === 'assistant' ? (<><Sparkles size={11} /> AKBW AI</>) : 'Mijoz'}
                    </span>
                    {m.ui?.text && (
                      <div
                        className={cn(
                          'px-5 py-3 rounded-[20px] text-sm shadow-sm whitespace-pre-line',
                          m.role === 'user' ? 'bg-black text-white rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none border border-gray-100',
                        )}
                      >
                        {m.ui.text}
                      </div>
                    )}
                    {!!m.ui?.cards?.length && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {m.ui.cards.map((c) => (
                          <div key={c.id} className="w-[120px] rounded-xl border border-gray-100 bg-white overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={c.image} alt={c.name} className="w-full aspect-[4/5] object-cover" />
                            <div className="p-2">
                              <p className="text-[11px] font-bold truncate">{c.name}</p>
                              <p className="text-[10px] text-gray-500">{c.price.toLocaleString()} so‘m · #{c.id}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {m.ui?.size && (
                      <div className="mt-2 flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3">
                        <Ruler size={16} className="text-gray-400" />
                        <span className="text-sm">
                          Tavsiya: <b>{m.ui.size.size}</b>
                          <span className="text-gray-400 text-xs"> · {m.ui.size.fit} · {m.ui.size.confidence}</span>
                        </span>
                      </div>
                    )}
                    <span className="text-[10px] mt-1.5 text-gray-400 font-bold">{time(m.createdAt)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mijoz haqida */}
          <aside className="w-[260px] shrink-0 border-l border-gray-100 bg-white p-6 overflow-y-auto no-scrollbar hidden xl:block">
            <h4 className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-3">Suhbat</h4>
            <p className="text-sm font-bold mb-1">{detail.thread.title || '—'}</p>
            <p className="text-xs text-gray-500 mb-6">Boshlangan: {time(detail.thread.createdAt)}</p>
            <h4 className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-1.5">
              <Brain size={13} /> AI xotirasi
            </h4>
            {detail.memories.length === 0 ? (
              <p className="text-xs text-gray-400">Hech narsa eslab qolinmagan</p>
            ) : (
              <ul className="space-y-2">
                {detail.memories.map((mm) => (
                  <li key={mm.id} className="text-xs text-gray-700 bg-gray-50 rounded-lg px-3 py-2">{mm.fact}</li>
                ))}
              </ul>
            )}
          </aside>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50/30">
          <p className="text-gray-400 font-bold">{threads.length ? 'Suhbatni tanlang' : ''}</p>
        </div>
      )}
    </div>
  );
}
