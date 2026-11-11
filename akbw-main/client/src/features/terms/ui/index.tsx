import React from 'react';
import {
  FileText,
  ShoppingCart,
  CreditCard,
  Truck,
  Clock,
  RotateCcw,
  ShieldAlert,
  Copyright,
  RefreshCw,
  Mail,
  Phone,
  AlertTriangle,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function TermsAndConditions() {
  const t = useTranslations('TermsAndConditions');
  const sections = [
    {
      id: 1,
      icon: FileText,
      title: t('sections.0.title'),
      list: [
        t('sections.0.list.0'),
        t('sections.0.list.1'),
        t('sections.0.list.2'),
      ],
    },
    {
      id: 2,
      icon: ShoppingCart,
      title: t('sections.1.title'),
      list: [
        t('sections.1.list.0'),
        t('sections.1.list.1'),
        t('sections.1.list.2'),
      ],
    },
    {
      id: 3,
      icon: CreditCard,
      title: t('sections.2.title'),
      content: t('sections.2.content'),
      list: ['Click', 'Payme', 'Uzcard', 'Humo'],
      notes: [t('sections.2.notes.0'), t('sections.2.notes.1')],
    },
    {
      id: 4,
      icon: Truck,
      title: t('sections.3.title'),
      isImportant: true,
      content: t('sections.3.content'),
      stages: [
        {
          title: t('sections.3.stages.0.title'),
          items: [
            t('sections.3.stages.0.items.0'),
            t('sections.3.stages.0.items.1'),
            t('sections.3.stages.0.items.2'),
          ],
        },
        {
          title: t('sections.3.stages.1.title'),
          items: [t('sections.3.stages.1.items.0')],
        },
      ],
      warning: t('sections.3.warning'),
    },
    {
      id: 5,
      icon: Clock,
      title: t('sections.4.title'),
      list: [t('sections.4.list.0')],
      content: t('sections.4.content'),
      subList: [
        t('sections.4.subList.0'),
        t('sections.4.subList.1'),
        t('sections.4.subList.2'),
      ],
      note: t('sections.4.note'),
      warning: t('sections.4.warning'),
    },
    {
      id: 6,
      icon: RotateCcw,
      title: t('sections.5.title'),
      content: t('sections.5.content'),
      list: [t('sections.5.list.0'), t('sections.5.list.1')],
      note: t('sections.5.note'),
      additionalNotes: [
        t('sections.5.additionalNotes.0'),
        t('sections.5.additionalNotes.1'),
      ],
    },
    {
      id: 7,
      icon: ShieldAlert,
      title: t('sections.6.title'),
      list: [t('sections.6.list.0'), t('sections.6.list.1')],
    },
    {
      id: 8,
      icon: Copyright,
      title: t('sections.7.title'),
      list: [t('sections.7.list.0'), t('sections.7.list.1')],
    },
    {
      id: 9,
      icon: RefreshCw,
      title: t('sections.8.title'),
      content: t('sections.8.content'),
      note: t('sections.8.note'),
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="wrap pt-4 md:pt-5">
        <div className="relative overflow-hidden rounded-[28px] border border-line px-6 py-14 md:py-20 bg-[radial-gradient(70%_90%_at_50%_0%,rgba(200,152,106,0.25),transparent_70%)]">
          <div className="flex items-center justify-center mb-6">
            <span className="grid place-items-center size-16 rounded-[20px] glass">
              <FileText size={26} strokeWidth={1.5} className="text-ivory" />
            </span>
          </div>
          <h1 className="serif text-[40px] md:text-[68px] leading-[1] text-ivory text-center mb-5">
            {t('hero.title')}
          </h1>
          <p className="text-center text-ivory/55 text-[16px] md:text-[18px] max-w-2xl mx-auto">
            {t('hero.subtitle')}
          </p>
        </div>
      </div>

      {/* Introduction */}
      <div className="wrap max-w-[920px] py-8 md:py-12">
        <div className="rounded-[22px] border border-star/25 bg-star/[0.07] p-6 md:p-7 mb-8">
          <p className="text-ivory/80 leading-relaxed text-[15.5px]">
            {t('introduction')}
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-3">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <div
                key={section.id}
                className="rounded-[24px] border border-line bg-surface p-6 md:p-8 transition-colors hover:border-line-2 scroll-mt-28"
              >
                {section.isImportant && (
                  <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-sale/10 border border-sale/30 px-3 py-1.5 text-sale">
                    <AlertTriangle size={20} />
                    <span className="lbl">Muhim</span>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-5">
                  <div className="grid place-items-center size-12 shrink-0 rounded-2xl border border-line-2 bg-ivory/[0.04]">
                    <Icon size={20} strokeWidth={1.5} className="text-ivory" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="serif text-[24px] md:text-[28px] leading-tight text-ivory mb-3">
                      {section.title}
                    </h2>

                    {section.content && (
                      <p className="text-ivory/65 leading-relaxed mb-4 text-[15px]">
                        {section.content}
                      </p>
                    )}

                    {section.list && (
                      <ul className="space-y-2 mb-4">
                        {section.list.map((item, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <span className="w-1.5 h-1.5 bg-star rounded-full mt-2.5 flex-shrink-0" />
                            <span className="text-ivory/70 text-[15px]">
                              {item}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {section.subList && (
                      <ul className="space-y-2 mb-2 ml-4">
                        {section.subList.map((item, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <span className="w-1.5 h-1.5 bg-ivory/30 rounded-full mt-2.5 flex-shrink-0" />
                            <span className="text-ivory/55 text-[15px]">
                              {item}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {section.stages && (
                      <div className="space-y-4 mb-4">
                        {section.stages.map((stage, idx) => (
                          <div
                            key={idx}
                            className="rounded-2xl border border-line bg-ivory/[0.03] p-4 md:p-5"
                          >
                            <h3 className="lbl text-ivory/60 mb-3">
                              {stage.title}
                            </h3>
                            <ul className="space-y-2">
                              {stage.items.map((item, itemIdx) => (
                                <li
                                  key={itemIdx}
                                  className="flex items-start gap-3"
                                >
                                  <span className="w-1.5 h-1.5 bg-ok rounded-full mt-2.5 flex-shrink-0" />
                                  <span className="text-ivory/70 text-[15px]">
                                    {item}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}

                    {section.notes && (
                      <div className="space-y-2 mt-3">
                        {section.notes.map((note, index) => (
                          <p
                            key={index}
                            className="text-ivory/45 italic text-[14px]"
                          >
                            {note}
                          </p>
                        ))}
                      </div>
                    )}

                    {section.note && (
                      <p className="text-ivory/45 italic mt-3 text-[14px]">
                        {section.note}
                      </p>
                    )}

                    {section.additionalNotes && (
                      <ul className="space-y-2 mt-3">
                        {section.additionalNotes.map((note, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <span className="w-1.5 h-1.5 bg-ivory/30 rounded-full mt-2.5 flex-shrink-0" />
                            <span className="text-ivory/55 text-[15px]">
                              {note}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {section.warning && (
                      <div className="mt-4 rounded-2xl border border-sale/30 bg-sale/[0.08] p-4">
                        <div className="flex items-start gap-3">
                          <AlertTriangle
                            size={20}
                            className="text-sale flex-shrink-0 mt-0.5"
                          />
                          <p className="text-sale">{section.warning}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Contact Section */}
        <div className="mt-3 rounded-[24px] bg-ivory text-night p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <Mail size={32} />
            <h2 className="serif text-[30px] md:text-[36px] leading-none">
              {t('contact.title')}
            </h2>
          </div>
          <p className="text-night/60 mb-6">{t('contact.description')}</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-4">
              <div className="grid place-items-center size-10 rounded-xl bg-night/[0.07]">
                <Phone size={20} />
              </div>
              <div>
                <p className="lbl text-night/45 mb-1">
                  {t('contact.phoneLabel')}
                </p>
                <a
                  href="tel:+998905661107"
                  className="text-night hover:underline underline-offset-4"
                >
                  {t('contact.phone')}
                </a>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="grid place-items-center size-10 rounded-xl bg-night/[0.07]">
                <Mail size={20} />
              </div>
              <div>
                <p className="lbl text-night/45 mb-1">
                  {t('contact.emailLabel')}
                </p>
                <a
                  href="mailto:akbw.uz@gmail.com"
                  className="text-night hover:underline underline-offset-4"
                >
                  {t('contact.email')}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 mb-6 text-center">
          <p className="lbl text-ivory/35">{t('footerNote')}</p>
        </div>
      </div>
    </div>
  );
}
