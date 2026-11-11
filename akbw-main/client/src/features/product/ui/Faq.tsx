'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Plus, Minus } from 'lucide-react';

export default function Faq({ activeTab }: { activeTab: string }) {
  const t = useTranslations('ProductPage');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <>
      {activeTab === 'faqs' && (
        <div className="max-w-4xl mx-auto space-y-4">
          {[
            {
              q: t('faqs.0.q'),
              a: t('faqs.0.a'),
            },
            {
              q: t('faqs.1.q'),
              a: t('faqs.1.a'),
            },
            {
              q: t('faqs.2.q'),
              a: t('faqs.2.a'),
            },
          ].map((faq, i) => (
            <div
              key={i}
              className="p-6 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors cursor-pointer"
              onClick={() => toggleFaq(i)}
            >
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-lg">{faq.q}</h4>
                {openIndex === i ? (
                  <Minus size={20} className="transition-transform" />
                ) : (
                  <Plus size={20} className="transition-transform" />
                )}
              </div>
              {openIndex === i && (
                <p className="mt-4 text-gray-500 transition-all">{faq.a}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
