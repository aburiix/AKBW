'use client';

import React from 'react';
import {
  Leaf,
  Globe,
  ShieldCheck,
  Sparkles,
  Rocket,
  ArrowRight,
} from 'lucide-react';
import { Link } from '@/shared/config/i18n/navigation';
import Image from 'next/image';
import AkbaraAbout from '../../../../public/assets/akbw-about.jpg';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import {
  FadeUp,
  SlideLeft,
  SlideRight,
  TextReveal,
  StaggerContainer,
  StaggerItem,
  ImageReveal,
} from '@/shared/ui/animations';

export default function AboutPage() {
  const features = [
    {
      icon: Leaf,
      title: 'features.minimalism_title',
      description: 'features.minimalism_description',
    },
    {
      icon: ShieldCheck,
      title: 'features.quality_title',
      description: 'features.quality_description',
    },
    {
      icon: Globe,
      title: 'features.future_title',
      description: 'features.future_description',
    },
  ];

  const t = useTranslations('AboutPage');

  return (
    <div className="min-h-screen overflow-hidden">
      <div className="wrap pt-4 md:pt-5">
        {/* Hero */}
        <section className="relative rounded-[28px] overflow-hidden border border-line min-h-[clamp(420px,62vh,640px)] grid place-items-center text-center bg-[radial-gradient(70%_70%_at_50%_30%,#6e4a2e,#24180f_60%,#120d09)]">
          <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_30%,rgba(14,13,11,0.9))]" />
          <div className="relative z-10 px-6 max-w-3xl">
            <span className="lbl text-ivory/55">{t('akbw_full_name')}</span>
            <motion.h1
              className="font-display text-[72px] md:text-[150px] leading-[0.9] text-ivory mt-4"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                delay: 0.1,
                ease: [0.25, 0.1, 0.25, 1],
              }}
            >
              <TextReveal text="AKBW" staggerDelay={0.08} />
            </motion.h1>
            <motion.p
              className="serif text-[22px] md:text-[30px] leading-snug text-ivory/80 mt-4"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              {t('hero_subtitle')}
            </motion.p>
          </div>
        </section>

        {/* Kirish */}
        <section className="mt-14 md:mt-24 grid md:grid-cols-2 gap-8 md:gap-14 items-center">
          <div className="space-y-5">
            <SlideLeft>
              <span className="lbl text-ivory/40">01 · AKBW</span>
              <h2 className="serif text-[34px] md:text-[52px] leading-[1.02] text-ivory mt-3">
                {t('intro_title')}
              </h2>
            </SlideLeft>
            <FadeUp delay={0.2}>
              <p className="text-[16px] text-ivory/60 leading-relaxed">
                <span className="text-ivory">{t('akbw_full_name')}</span>{' '}
                {t('intro_description_1')}
              </p>
            </FadeUp>
            <FadeUp delay={0.3}>
              <p className="text-[16px] text-ivory/60 leading-relaxed">
                {t('intro_description_2')}
              </p>
            </FadeUp>
          </div>
          <SlideRight delay={0.2}>
            <ImageReveal direction="left" className="rounded-[28px]">
              <div className="relative aspect-[4/5] rounded-[28px] overflow-hidden border border-line bg-surface-2">
                <Image
                  src={AkbaraAbout}
                  alt="AKBW"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </ImageReveal>
          </SlideRight>
        </section>

        {/* Vizyon */}
        <section className="mt-14 md:mt-24 rounded-[28px] border border-line bg-surface px-6 py-14 md:py-20 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <FadeUp>
              <span className="lbl text-ivory/40">{t('vision_label')}</span>
            </FadeUp>
            <FadeUp delay={0.1}>
              <h3 className="serif text-[30px] md:text-[48px] leading-[1.08] text-ivory">
                {t('vision_title')}
              </h3>
            </FadeUp>
            <FadeUp delay={0.2}>
              <p className="text-[16px] md:text-[18px] text-ivory/60 leading-relaxed">
                {t('vision_description')}
              </p>
            </FadeUp>
            <FadeUp delay={0.3}>
              <div className="pt-6 flex flex-col items-center gap-1">
                <span className="h-px w-16 bg-ivory/30 mb-4" />
                <p className="serif text-[22px] text-ivory">
                  {t('founder_name')}
                </p>
                <p className="lbl text-ivory/45">{t('founder_role')}</p>
              </div>
            </FadeUp>
          </div>
        </section>

        {/* Afzalliklar */}
        <StaggerContainer
          className="mt-3 grid md:grid-cols-3 gap-3"
          staggerDelay={0.12}
        >
          {features.map((item, idx) => (
            <StaggerItem key={idx}>
              <div className="group h-full rounded-[24px] border border-line bg-surface p-6 md:p-8 transition-all hover:-translate-y-1 hover:border-line-2">
                <div className="flex items-center justify-between mb-8">
                  <span className="grid place-items-center size-12 rounded-2xl glass text-ivory">
                    <item.icon size={20} strokeWidth={1.5} />
                  </span>
                  <span className="lbl text-ivory/25">0{idx + 1}</span>
                </div>
                <h4 className="serif text-[24px] text-ivory mb-2">
                  {t(item.title)}
                </h4>
                <p className="text-[14.5px] text-ivory/55 leading-relaxed">
                  {t(item.description)}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* O'sish */}
        <section className="mt-14 md:mt-24 grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-5 space-y-5">
            <SlideLeft>
              <span className="lbl text-ivory/40">02 · AKBW</span>
              <h2 className="serif text-[34px] md:text-[48px] leading-[1.04] text-ivory mt-3">
                {t('growth_title')}
              </h2>
            </SlideLeft>
            <FadeUp delay={0.2}>
              <p className="text-[16px] text-ivory/60 leading-relaxed">
                {t('growth_description_1')}
              </p>
            </FadeUp>
            <FadeUp delay={0.3}>
              <p className="text-[16px] text-ivory/60 leading-relaxed">
                {t('growth_description_2')}
              </p>
            </FadeUp>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FadeUp delay={0.2}>
              <div className="h-full min-h-[260px] rounded-[24px] border border-line bg-surface p-7 flex flex-col">
                <Sparkles size={26} strokeWidth={1.4} className="text-star" />
                <h4 className="serif text-[24px] text-ivory mt-auto pt-10 mb-2">
                  {t('values.honesty_title')}
                </h4>
                <p className="text-[14.5px] text-ivory/55 leading-relaxed">
                  {t('values.honesty_description')}
                </p>
              </div>
            </FadeUp>
            <FadeUp delay={0.35}>
              <div className="h-full min-h-[260px] sm:mt-10 rounded-[24px] p-7 flex flex-col bg-ivory text-night">
                <Rocket size={26} strokeWidth={1.4} />
                <h4 className="serif text-[24px] mt-auto pt-10 mb-2">
                  {t('values.online_exp_title')}
                </h4>
                <p className="text-[14.5px] text-night/60 leading-relaxed">
                  {t('values.online_exp_description')}
                </p>
              </div>
            </FadeUp>
          </div>
        </section>

        {/* Yakun */}
        <section className="mt-14 md:mt-24 mb-16 rounded-[28px] overflow-hidden border border-line px-6 py-16 md:py-24 text-center bg-[radial-gradient(60%_90%_at_50%_0%,rgba(200,152,106,0.22),transparent_70%)]">
          <div className="max-w-3xl mx-auto">
            <FadeUp>
              <h2 className="serif text-[28px] md:text-[44px] leading-[1.12] text-ivory">
                {t('bottom_quote')}
              </h2>
            </FadeUp>
            <FadeUp delay={0.2}>
              <p className="text-ivory/55 text-[16px] md:text-[18px] mt-6">
                {t('bottom_description')}
              </p>
            </FadeUp>
            <FadeUp delay={0.35}>
              <div className="mt-9 flex flex-wrap justify-center gap-3">
                <Link href="/" className="pill pill-ivory">
                  {t('home_link')}
                  <ArrowRight size={15} />
                </Link>
                <Link href="/contact" className="pill pill-ghost">
                  {t('contact_link')}
                </Link>
              </div>
            </FadeUp>
          </div>
        </section>
      </div>
    </div>
  );
}
