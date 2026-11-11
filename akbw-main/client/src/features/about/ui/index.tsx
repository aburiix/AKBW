'use client';

import React from 'react';
import { Leaf, Globe, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
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
  AnimatedLine,
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
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white overflow-hidden">
      {/* Hero Section */}
      <div className="relative h-[60vh] md:h-[70vh] w-full overflow-hidden bg-gray-100 flex items-center justify-center">
        <motion.div
          className="absolute inset-0 bg-neutral-900/10 z-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        />
        <div className="relative z-10 text-center max-w-4xl px-6">
          <motion.h1
            className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 tracking-tighter uppercase font-display"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.2,
              ease: [0.25, 0.1, 0.25, 1],
            }}
          >
            <TextReveal text="AKBW" staggerDelay={0.08} />
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl font-light text-neutral-600 max-w-2xl mx-auto tracking-wide"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.6,
              ease: [0.25, 0.1, 0.25, 1],
            }}
          >
            {t('hero_subtitle')}
          </motion.p>
          <motion.div
            className="h-1 w-24 bg-black mx-auto mt-8"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 1, ease: [0.25, 0.1, 0.25, 1] }}
          />
        </div>
      </div>

      {/* Introduction Section */}
      <section className="py-20 md:py-32 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <SlideLeft>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                  {t('intro_title')}
                </h2>
              </SlideLeft>
              <FadeUp delay={0.2}>
                <p className="text-lg text-gray-600 leading-relaxed">
                  <span className="font-bold text-black">
                    {t('akbw_full_name')}
                  </span>{' '}
                  {t('intro_description_1')}
                </p>
              </FadeUp>
              <FadeUp delay={0.3}>
                <p className="text-lg text-gray-600 leading-relaxed">
                  {t('intro_description_2')}
                </p>
              </FadeUp>
            </div>
            <SlideRight delay={0.2}>
              <ImageReveal
                direction="left"
                className="h-full min-h-[400px] rounded-2xl"
              >
                <div className="h-full min-h-[400px] bg-gray-200 rounded-2xl overflow-hidden group relative">
                  <Image
                    src={AkbaraAbout.src}
                    alt="AKBW"
                    className="w-full h-full object-cover"
                    fill
                  />
                </div>
              </ImageReveal>
            </SlideRight>
          </div>
        </div>
      </section>

      {/* Philosophy & Vision - Alternating Layout */}
      <section className="bg-neutral-50 py-20 md:py-32 px-6">
        <div className="container mx-auto max-w-5xl">
          {/* Vision Block */}
          <div className="mb-24">
            <div className="max-w-3xl mx-auto text-center space-y-8">
              <FadeUp>
                <span className="text-sm font-semibold tracking-widest uppercase text-gray-500">
                  {t('vision_label')}
                </span>
              </FadeUp>
              <FadeUp delay={0.1}>
                <h3 className="text-3xl md:text-5xl font-bold leading-tight">
                  {t('vision_title')}
                </h3>
              </FadeUp>
              <FadeUp delay={0.2}>
                <p className="text-xl text-gray-600 leading-relaxed font-light">
                  {t('vision_description')}
                </p>
              </FadeUp>
              <FadeUp delay={0.3}>
                <div className="pt-4">
                  <AnimatedLine className="w-32 mx-auto mb-4" />
                  <div className="inline-block pt-4">
                    <p className="font-bold text-lg">{t('founder_name')}</p>
                    <p className="text-sm text-gray-500">{t('founder_role')}</p>
                  </div>
                </div>
              </FadeUp>
            </div>
          </div>

          {/* Process Grid */}
          <StaggerContainer
            className="grid md:grid-cols-3 gap-8"
            staggerDelay={0.15}
          >
            {features.map((item, idx) => (
              <StaggerItem key={idx}>
                <motion.div
                  className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 h-full"
                  whileHover={{
                    y: -8,
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                    transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] },
                  }}
                >
                  <motion.div
                    className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mb-6"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                  >
                    <item.icon size={24} strokeWidth={1.5} />
                  </motion.div>
                  <h4 className="text-xl font-bold mb-3">{t(item.title)}</h4>
                  <p className="text-gray-600 leading-relaxed">
                    {t(item.description)}
                  </p>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Organization & Growth */}
      <section className="py-20 md:py-32 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-12 gap-12">
            <div className="lg:col-span-5 space-y-8">
              <SlideLeft>
                <h2 className="text-3xl md:text-4xl font-bold">
                  {t('growth_title')}
                </h2>
              </SlideLeft>
              <div className="space-y-6 text-gray-600 text-lg">
                <FadeUp delay={0.2}>
                  <p>{t('growth_description_1')}</p>
                </FadeUp>
                <FadeUp delay={0.3}>
                  <p>{t('growth_description_2')}</p>
                </FadeUp>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-2 gap-4">
              <FadeUp delay={0.2}>
                <motion.div
                  className="bg-neutral-100 rounded-2xl p-8 flex flex-col justify-end min-h-[300px]"
                  whileHover={{
                    scale: 1.02,
                    backgroundColor: '#e5e5e5',
                    transition: { duration: 0.3 },
                  }}
                >
                  <motion.span
                    className="text-5xl mb-4"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 3,
                    }}
                  >
                    ✨
                  </motion.span>
                  <h4 className="text-xl font-bold mb-2">
                    {t('values.honesty_title')}
                  </h4>
                  <p className="text-gray-600">
                    {t('values.honesty_description')}
                  </p>
                </motion.div>
              </FadeUp>
              <FadeUp delay={0.4}>
                <motion.div
                  className="bg-neutral-900 text-white rounded-2xl p-8 flex flex-col justify-end min-h-[300px] mt-12"
                  whileHover={{
                    scale: 1.02,
                    backgroundColor: '#262626',
                    transition: { duration: 0.3 },
                  }}
                >
                  <motion.span
                    className="text-5xl mb-4"
                    animate={{ y: [0, -10, 0] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      repeatDelay: 2,
                    }}
                  >
                    🚀
                  </motion.span>
                  <h4 className="text-xl font-bold mb-2">
                    {t('values.online_exp_title')}
                  </h4>
                  <p className="text-gray-400">
                    {t('values.online_exp_description')}
                  </p>
                </motion.div>
              </FadeUp>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Statement */}
      <section className="bg-black text-white py-24 px-6 text-center overflow-hidden">
        <div className="container mx-auto max-w-3xl">
          <FadeUp>
            <h2 className="text-2xl md:text-4xl font-bold mb-8 leading-snug">
              {t('bottom_quote')}
            </h2>
          </FadeUp>
          <FadeUp delay={0.2}>
            <p className="text-neutral-400 text-lg md:text-xl mb-10 font-light">
              {t('bottom_description')}
            </p>
          </FadeUp>
          <FadeUp delay={0.4}>
            <div className="flex justify-center gap-6">
              <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
                <Link
                  href="/"
                  className="border-b border-white pb-1 hover:text-gray-300 hover:border-gray-300 transition-all"
                >
                  {t('home_link')}
                </Link>
              </motion.div>
              <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
                <Link
                  href="/contact"
                  className="border-b border-white pb-1 hover:text-gray-300 hover:border-gray-300 transition-all"
                >
                  {t('contact_link')}
                </Link>
              </motion.div>
            </div>
          </FadeUp>
        </div>
      </section>
    </div>
  );
}
