import React from 'react';
import {
  Shield,
  Lock,
  Users,
  FileText,
  Mail,
  Phone,
  MapPin,
  Cookie,
  UserCheck,
  RefreshCw,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function Privacy() {
  const t = useTranslations('PrivacyPage');

  const sections = [
    {
      id: 1,
      icon: FileText,
      title: t('sections.0.title'),
      content: t('sections.0.content'),
      list: [
        t('sections.0.list.0'),
        t('sections.0.list.1'),
        t('sections.0.list.2'),
        t('sections.0.list.3'),
        t('sections.0.list.4'),
        t('sections.0.list.5'),
      ],
    },
    {
      id: 2,
      icon: Users,
      title: t('sections.1.title'),
      content: t('sections.1.content'),
      list: [
        t('sections.1.list.0'),
        t('sections.1.list.1'),
        t('sections.1.list.2'),
        t('sections.1.list.3'),
        t('sections.1.list.4'),
      ],
    },
    {
      id: 3,
      icon: Lock,
      title: t('sections.2.title'),
      content: t('sections.2.content'),
      note: t('sections.2.note'),
    },
    {
      id: 4,
      icon: UserCheck,
      title: t('sections.3.title'),
      content: t('sections.3.content'),
      list: [
        t('sections.3.list.0'),
        t('sections.3.list.1'),
        t('sections.3.list.2'),
      ],
      note: t('sections.3.note'),
      subList: [t('sections.3.subList.0'), t('sections.3.subList.1')],
    },
    {
      id: 5,
      icon: Shield,
      title: t('sections.4.title'),
      content: t('sections.4.content'),
      list: [
        t('sections.4.list.0'),
        t('sections.4.list.1'),
        t('sections.4.list.2'),
      ],
      note: t('sections.4.note'),
    },
    {
      id: 6,
      icon: Cookie,
      title: t('sections.5.title'),
      content: t('sections.5.content'),
      note: t('sections.5.note'),
    },
    {
      id: 7,
      icon: UserCheck,
      title: t('sections.6.title'),
      content: 'Siz:',
      list: [
        t('sections.6.list.0'),
        t('sections.6.list.1'),
        t('sections.6.list.2'),
      ],
      note: t('sections.6.note'),
    },
    {
      id: 8,
      icon: RefreshCw,
      title: t('sections.7.title'),
      content: t('sections.7.content'),
      note: t('sections.7.note'),
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="wrap pt-4 md:pt-5">
        <div className="relative overflow-hidden rounded-[28px] border border-line px-6 py-14 md:py-20 bg-[radial-gradient(70%_90%_at_50%_0%,rgba(200,152,106,0.25),transparent_70%)]">
          <div className="flex items-center justify-center mb-6">
            <span className="grid place-items-center size-16 rounded-[20px] glass">
              <Shield size={26} strokeWidth={1.5} className="text-ivory" />
            </span>
          </div>
          <h1 className="serif text-[40px] md:text-[68px] leading-[1] text-ivory text-center mb-5">
            {t('hero.title')}
          </h1>
          <p className="text-center text-ivory/55 text-[16px] md:text-[18px] max-w-2xl mx-auto">
            {t('hero.description')}
          </p>
        </div>
      </div>

      {/* Introduction */}
      <div className="wrap max-w-[920px] py-8 md:py-12">
        <div className="rounded-[22px] border border-star/25 bg-star/[0.07] p-6 md:p-7 mb-8">
          <p className="text-ivory/80 leading-relaxed text-[15.5px]">
            {t('intro')}
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
                <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-5">
                  <div className="grid place-items-center size-12 shrink-0 rounded-2xl border border-line-2 bg-ivory/[0.04]">
                    <Icon size={20} strokeWidth={1.5} className="text-ivory" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="serif text-[24px] md:text-[28px] leading-tight text-ivory mb-3">
                      {section.title}
                    </h2>
                    <p className="text-ivory/65 leading-relaxed mb-4 text-[15px]">
                      {section.content}
                    </p>

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

                    {section.note && (
                      <p className="text-ivory/45 italic mt-3 text-[14px]">
                        {section.note}
                      </p>
                    )}

                    {section.subList && (
                      <ul className="space-y-2 mt-3 ml-4">
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
            <div className="flex items-center gap-4">
              <div className="grid place-items-center size-10 rounded-xl bg-night/[0.07]">
                <Phone size={20} />
              </div>
              <div>
                <p className="lbl text-night/45 mb-1">
                  {t('contact.phoneLabel')}
                </p>
                <a
                  href="tel:+998901234567"
                  className="text-night hover:underline underline-offset-4"
                >
                  {t('contact.phone')}
                </a>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="grid place-items-center size-10 rounded-xl bg-night/[0.07]">
                <MapPin size={20} />
              </div>
              <div>
                <p className="lbl text-night/45 mb-1">
                  {t('contact.addressLabel')}
                </p>
                <p className="text-night">{t('contact.address')}</p>
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
