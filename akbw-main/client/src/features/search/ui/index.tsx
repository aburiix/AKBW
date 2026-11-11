'use client';

import { useRouter } from '@/shared/config/i18n/navigation';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Search, ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import React, { useState, useEffect } from 'react';

export default function SearchPage() {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [searchVal, setSearchVal] = useState('');

  const t = useTranslations('SearchPage');
  const router = useRouter();

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      router.push(`/filters?q=${searchVal.trim()}`);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container px-4 py-4">
        <form onSubmit={handleSearch} className="flex gap-3 items-center">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="shrink-0"
          >
            <ArrowLeft size={30} />
          </Button>
          <div className="relative flex-1">
            <Input
              ref={inputRef}
              type="text"
              placeholder={t('placeholder')}
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full pl-4 pr-10 py-6 text-lg rounded-2xl bg-gray-50 border-none focus-visible:ring-1 focus-visible:ring-black"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black transition-colors p-1"
            >
              <Search size={24} />
            </button>
          </div>
        </form>

        <div className="mt-8 px-2 text-center text-gray-400 text-sm">
          {t('recentOrHint')}
        </div>
      </div>
    </div>
  );
}
