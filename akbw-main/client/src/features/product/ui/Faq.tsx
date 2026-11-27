'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Plus, Minus } from 'lucide-react';

/** Mahsulot savollari — ilovadagi bilan bir xil kartalar (matn: ProductPage.faqs) */
export default function Faq({ activeTab }: { activeTab: string }) {
  const t = useTranslations('ProductPage');
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  if (activeTab !== 'faqs') return null;

  return (
    <div className="max-w-4xl flex flex-col gap-2.5">
      {[0, 1, 2].map((i) => {
        const open = openIndex === i;
        return (
          <button
            type="button"
            key={i}
            onClick={() => setOpenIndex(open ? null : i)}
            className="text-left p-4 md:p-5 bg-surface border border-line rounded-[18px] hover:bg-surface-2 transition-colors cursor-pointer"
          >
            <span className="flex items-center justify-between gap-3">
              <span className="text-[15px] md:text-[16px] text-ivory">
                {t(`faqs.${i}.q`)}
              </span>
              {open ? (
                <Minus size={18} className="shrink-0 text-ivory/60" />
              ) : (
                <Plus size={18} className="shrink-0 text-ivory/60" />
              )}
            </span>
            {open && (
              <span className="block mt-2.5 text-[14px] leading-relaxed text-ivory/60">
                {t(`faqs.${i}.a`)}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
