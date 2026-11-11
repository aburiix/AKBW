'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { User, Building2 } from 'lucide-react';
import { useGetMeFactory } from '@/features/auth/lib/hooks';

export default function Header() {
  const pathname = usePathname();

  const { data: factoryData, isLoading, isError } = useGetMeFactory();

  const getPageTitle = (path: string) => {
    const parts = path.split('/');
    const page = parts[parts.length - 1];
    if (!page || page === 'uz' || page === 'en') return 'Dashboard';
    return page.charAt(0).toUpperCase() + page.slice(1).replace('-', ' ');
  };

  if (isLoading) return null;

  // Optional: Redirect to login if error or no data
  // if (isError) window.location.replace("/login");

  const factory = factoryData?.factory;

  return (
    <header className="h-[80px] border-b border-gray-100 px-8 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md bg-white/80">
      <div>
        <h1 className="text-xl font-black uppercase tracking-wider">
          {getPageTitle(pathname)}
        </h1>
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-gray-400 font-bold">
          <span>Hamkor Paneli</span>
          <span className="w-1 h-1 rounded-full bg-gray-200" />
          <span className="text-black">{getPageTitle(pathname)}</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-px h-8 bg-gray-100 mx-2" />
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold uppercase tracking-tight">
              {factory?.name || 'Hamkor'}
            </p>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
              {factory?.phone || 'Telefon kiritilmagan'}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center text-white shadow-lg shadow-black/10">
            <Building2 size={20} />
          </div>
        </div>
      </div>
    </header>
  );
}
