'use client';

import Image from 'next/image';
import { Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from '@/shared/config/i18n/navigation';
import { useUserStore } from '@/shared/store/user.store';
import {
  deleteTryOnRequest,
  getMyTryOnsRequest,
} from '@/shared/config/api/tryon/tryon.request';

/** Kiyib ko'rish tarixi — ilovadagi "Kiyib ko'rish tarixi" ekrani bilan bir xil */
export default function TryOnHistory() {
  const t = useTranslations('TryOnHistory');
  const token = useUserStore((s) => s.token);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['tryon', 'me'],
    queryFn: getMyTryOnsRequest,
    enabled: !!token,
  });
  const items = data?.items ?? [];

  const remove = async (id: string) => {
    if (!window.confirm(t('delete_confirm'))) return;
    await deleteTryOnRequest(id).catch(() => {});
    qc.invalidateQueries({ queryKey: ['tryon', 'me'] });
  };

  return (
    <div className="wrap min-h-[70vh] pt-6 md:pt-10 pb-16">
      <span className="lbl text-ivory/45 block mb-2">AKBW · AI</span>
      <h1 className="serif text-[36px] md:text-[56px] leading-none text-ivory mb-6 md:mb-10">
        {t('title')}
      </h1>
      {!token ? (
        <Link href="/profile" className="pill pill-ivory">
          {t('login')}
        </Link>
      ) : isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="aspect-[3/4] rounded-2xl bg-surface-2 animate-pulse"
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="py-16 flex flex-col items-center text-center gap-4 rounded-[26px] border border-dashed border-line-2">
          <p className="text-ivory/55 text-sm max-w-[36ch]">{t('empty')}</p>
          <Link href="/filters" className="pill pill-ghost">
            {t('to_catalog')}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-2.5 gap-y-4 md:gap-3.5">
          {items.map((it) => (
            <div key={it.id} className="flex flex-col gap-1.5">
              <Link
                href={`/product/${it.productId}`}
                className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-surface-2"
              >
                <Image
                  src={it.resultUrl}
                  alt=""
                  fill
                  sizes="(max-width:768px) 50vw, 25vw"
                  className="object-cover"
                />
              </Link>
              <div className="flex items-center justify-between">
                <span className="lbl !text-[9px] text-ivory/45">
                  {new Date(it.createdAt).toLocaleDateString()}
                </span>
                <button
                  type="button"
                  onClick={() => remove(it.id)}
                  aria-label={t('delete')}
                  className="size-8 grid place-items-center rounded-full text-ivory/40 hover:text-sale"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
