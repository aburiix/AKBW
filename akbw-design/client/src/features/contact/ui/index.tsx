'use client';

import React from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Globe,
  Instagram,
  Send,
  Clock,
  ArrowUpRight,
  Plus,
} from 'lucide-react';
import { Link } from '@/shared/config/i18n/navigation';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { FadeUp, StaggerContainer, StaggerItem } from '@/shared/ui/animations';
import { cn } from '@/shared/lib/utils';

export default function ContactPage() {
  const contactMethods = [
    {
      icon: Phone,
      title: 'contact_methods.phone_title',
      value: 'contact_methods.phone_value',
      action: 'tel:+998905661107',
      description: 'contact_methods.phone_description',
    },
    {
      icon: Mail,
      title: 'contact_methods.email_title',
      value: 'contact_methods.email_value',
      action: 'mailto:akbw.uz@gmail.com',
      description: 'contact_methods.email_description',
    },
    {
      icon: MapPin,
      title: 'contact_methods.address_title',
      value: 'contact_methods.address_value',
      action: null,
      description: 'contact_methods.address_description',
    },
  ];

  const socials = [
    { icon: Send, name: 'Telegram', link: 'https://t.me/akbwuz' },
    {
      icon: Instagram,
      name: 'Instagram',
      link: 'https://instagram.com/akbw.uz',
    },
    { icon: Globe, name: 'akbw.uz', link: '/' },
  ];

  const t = useTranslations('ContactPage');

  const faqs = [
    { q: t('faq.delivery_question'), a: t('faq.delivery_answer') },
    { q: t('faq.payment_question'), a: t('faq.payment_answer') },
    {
      q: t('faq.partnership_question'),
      a: t('faq.partnership_answer', { email: 'akbw.uz@gmail.com' }),
    },
    { q: t('faq.why_first_pay'), a: t('faq.why_first_pay_answer') },
  ];
  const [openFaq, setOpenFaq] = React.useState<number | null>(0);

  return (
    <div className="min-h-screen overflow-hidden">
      <div className="wrap pt-6 md:pt-10 pb-16">
        {/* Sarlavha */}
        <div className="max-w-3xl">
          <span className="lbl text-ivory/40">AKBW · {t('title')}</span>
          <motion.h1
            className="serif text-[44px] md:text-[80px] leading-[0.98] text-ivory mt-4"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {t('title')}
          </motion.h1>
          <motion.p
            className="text-[16px] md:text-[18px] text-ivory/55 mt-5 max-w-2xl"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
          >
            {t('subtitle')}
          </motion.p>
        </div>

        {/* Aloqa kartochkalari */}
        <StaggerContainer
          className="mt-10 md:mt-14 grid md:grid-cols-3 gap-3"
          staggerDelay={0.12}
          delay={0.2}
        >
          {contactMethods.map((method, idx) => {
            const inner = (
              <>
                <div className="flex items-start justify-between">
                  <span className="grid place-items-center size-12 rounded-2xl glass text-ivory">
                    <method.icon size={20} strokeWidth={1.5} />
                  </span>
                  {method.action && (
                    <ArrowUpRight
                      size={18}
                      className="text-ivory/30 group-hover:text-ivory group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all"
                    />
                  )}
                </div>
                <p className="lbl text-ivory/45 mt-10">{t(method.title)}</p>
                <p className="serif text-[22px] md:text-[24px] text-ivory mt-2 break-words">
                  {t(method.value)}
                </p>
                <p className="text-[13px] text-ivory/45 mt-2">
                  {t(method.description)}
                </p>
              </>
            );
            const cls =
              'group h-full flex flex-col rounded-[24px] border border-line bg-surface p-6 md:p-7 transition-all hover:border-line-2 hover:-translate-y-1';
            return (
              <StaggerItem key={idx}>
                {method.action ? (
                  <a href={method.action} className={cls}>
                    {inner}
                  </a>
                ) : (
                  <div className={cls}>{inner}</div>
                )}
              </StaggerItem>
            );
          })}
        </StaggerContainer>

        <div className="mt-3 grid lg:grid-cols-[1fr_1.25fr] gap-3 items-start">
          <div className="flex flex-col gap-3">
            {/* Ijtimoiy tarmoqlar */}
            <FadeUp>
              <div className="rounded-[24px] border border-line bg-surface p-6 md:p-8">
                <h2 className="serif text-[28px] md:text-[34px] text-ivory leading-tight">
                  {t('socials_title')}
                </h2>
                <p className="text-[14.5px] text-ivory/55 mt-3">
                  {t('socials_description')}
                </p>
                <div className="mt-6 flex flex-col gap-2">
                  {socials.map((s) => (
                    <a
                      key={s.name}
                      href={s.link}
                      target={s.link.startsWith('http') ? '_blank' : undefined}
                      rel="noopener noreferrer"
                      className="group flex items-center gap-3 h-14 px-4 rounded-2xl border border-line-2 text-ivory/80 hover:bg-ivory hover:text-night hover:border-ivory transition-all"
                    >
                      <s.icon size={18} />
                      <span className="text-[15px]">{s.name}</span>
                      <ArrowUpRight
                        size={16}
                        className="ml-auto opacity-40 group-hover:opacity-100"
                      />
                    </a>
                  ))}
                </div>
              </div>
            </FadeUp>

            {/* Ish vaqti */}
            <FadeUp delay={0.15}>
              <div className="rounded-[24px] p-6 md:p-8 bg-ivory text-night">
                <div className="flex items-center gap-2.5">
                  <Clock size={18} />
                  <span className="lbl">{t('working_hours_title')}</span>
                </div>
                <p className="text-night/60 mt-6">{t('working_days')}</p>
                <p className="serif text-[34px] md:text-[40px] leading-none mt-1">
                  {t('working_time')}
                </p>
                <p className="text-[13px] text-night/50 mt-4">{t('weekend')}</p>
              </div>
            </FadeUp>
          </div>

          {/* Savollar */}
          <FadeUp delay={0.1}>
            <div className="rounded-[24px] border border-line bg-surface p-6 md:p-8">
              <h2 className="serif text-[28px] md:text-[34px] text-ivory leading-tight mb-4">
                {t('faq_title')}
              </h2>
              <div className="divide-y divide-line">
                {faqs.map((f, i) => {
                  const open = openFaq === i;
                  return (
                    <div key={i}>
                      <button
                        type="button"
                        onClick={() => setOpenFaq(open ? null : i)}
                        aria-expanded={open}
                        className="w-full flex items-center justify-between gap-4 py-5 text-left cursor-pointer"
                      >
                        <span className="text-[15.5px] text-ivory">{f.q}</span>
                        <span
                          className={cn(
                            'grid place-items-center size-8 shrink-0 rounded-full border border-line-2 text-ivory/70 transition-transform duration-300',
                            open &&
                              'rotate-45 bg-ivory text-night border-ivory',
                          )}
                        >
                          <Plus size={15} />
                        </span>
                      </button>
                      <div
                        className={cn(
                          'grid transition-all duration-300',
                          open
                            ? 'grid-rows-[1fr] opacity-100 pb-5'
                            : 'grid-rows-[0fr] opacity-0',
                        )}
                      >
                        <p className="overflow-hidden text-[14.5px] text-ivory/55 leading-relaxed pr-10">
                          {f.a}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 pt-5 border-t border-line">
                <Link
                  href="/terms"
                  className="lbl text-ivory/45 hover:text-ivory transition-colors"
                >
                  {t('terms_link')} →
                </Link>
              </div>
            </div>
          </FadeUp>
        </div>
      </div>
    </div>
  );
}
