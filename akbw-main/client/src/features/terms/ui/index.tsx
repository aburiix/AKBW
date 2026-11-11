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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="bg-black text-white py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center justify-center mb-6">
            <FileText size={48} className="text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
            {t('hero.title')}
          </h1>
          <p className="text-center text-gray-300 text-lg max-w-2xl mx-auto">
            {t('hero.subtitle')}
          </p>
        </div>
      </div>

      {/* Introduction */}
      <div className="container mx-auto px-4 max-w-4xl py-12">
        <div className="bg-amber-50 border-l-4 border-amber-600 p-6 rounded-r-lg mb-12">
          <p className="text-gray-800 leading-relaxed font-medium">
            {t('introduction')}
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <div
                key={section.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 hover:shadow-md transition-shadow"
              >
                {section.isImportant && (
                  <div className="mb-4 flex items-center gap-2 text-red-600">
                    <AlertTriangle size={20} />
                    <span className="font-bold text-sm uppercase">Muhim</span>
                  </div>
                )}

                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 bg-black rounded-lg">
                    <Icon size={24} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">
                      {section.title}
                    </h2>

                    {section.content && (
                      <p className="text-gray-700 leading-relaxed mb-4">
                        {section.content}
                      </p>
                    )}

                    {section.list && (
                      <ul className="space-y-2 mb-4">
                        {section.list.map((item, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <span className="w-1.5 h-1.5 bg-black rounded-full mt-2 flex-shrink-0" />
                            <span className="text-gray-700">{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {section.subList && (
                      <ul className="space-y-2 mb-2 ml-4">
                        {section.subList.map((item, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                            <span className="text-gray-600">{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {section.stages && (
                      <div className="space-y-4 mb-4">
                        {section.stages.map((stage, idx) => (
                          <div key={idx} className="bg-gray-50 rounded-lg p-4">
                            <h3 className="font-bold text-gray-900 mb-2">
                              {stage.title}
                            </h3>
                            <ul className="space-y-2">
                              {stage.items.map((item, itemIdx) => (
                                <li
                                  key={itemIdx}
                                  className="flex items-start gap-3"
                                >
                                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                                  <span className="text-gray-700">{item}</span>
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
                          <p key={index} className="text-gray-600 italic">
                            {note}
                          </p>
                        ))}
                      </div>
                    )}

                    {section.note && (
                      <p className="text-gray-600 italic mt-3">
                        {section.note}
                      </p>
                    )}

                    {section.additionalNotes && (
                      <ul className="space-y-2 mt-3">
                        {section.additionalNotes.map((note, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                            <span className="text-gray-600">{note}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {section.warning && (
                      <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-r">
                        <div className="flex items-start gap-3">
                          <AlertTriangle
                            size={20}
                            className="text-red-600 flex-shrink-0 mt-0.5"
                          />
                          <p className="text-red-800 font-medium">
                            {section.warning}
                          </p>
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
        <div className="mt-12 bg-gradient-to-br from-black to-gray-900 text-white rounded-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <Mail size={32} />
            <h2 className="text-3xl font-bold">{t('contact.title')}</h2>
          </div>
          <p className="text-gray-300 mb-6">{t('contact.description')}</p>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-white/10 rounded-lg">
                <Phone size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-400">
                  {t('contact.phoneLabel')}
                </p>
                <a
                  href="tel:+998905661107"
                  className="text-white hover:text-gray-300 transition-colors"
                >
                  {t('contact.phone')}
                </a>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-2 bg-white/10 rounded-lg">
                <Mail size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-400">
                  {t('contact.emailLabel')}
                </p>
                <a
                  href="mailto:akbw.uz@gmail.com"
                  className="text-white hover:text-gray-300 transition-colors"
                >
                  {t('contact.email')}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">{t('footerNote')}</p>
        </div>
      </div>
    </div>
  );
}
