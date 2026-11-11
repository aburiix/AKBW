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
} from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import {
  FadeUp,
  SlideLeft,
  SlideRight,
  StaggerContainer,
  StaggerItem,
  AnimatedLine,
} from '@/shared/ui/animations';

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
    {
      icon: Send,
      name: 'Telegram',
      link: 'https://t.me/akbwuz',
      color: 'hover:text-blue-500',
    },
    {
      icon: Instagram,
      name: 'Instagram',
      link: 'https://instagram.com/akbw.uz',
      color: 'hover:text-pink-600',
    },
    { icon: Globe, name: 'Website', link: '/', color: 'hover:text-black' },
  ];

  const t = useTranslations('ContactPage');

  return (
    <div className="min-h-screen bg-gray-50 text-black font-sans overflow-hidden">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-6 py-16 md:py-24 text-center">
          <motion.h1
            className="text-4xl md:text-6xl font-bold mb-6 tracking-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {t('title')}
          </motion.h1>
          <motion.p
            className="text-xl text-gray-500 max-w-2xl mx-auto font-light"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.2,
              ease: [0.25, 0.1, 0.25, 1],
            }}
          >
            {t('subtitle')}
          </motion.p>
          <motion.div
            className="w-16 h-1 bg-black mx-auto mt-8"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{
              duration: 0.8,
              delay: 0.4,
              ease: [0.25, 0.1, 0.25, 1],
            }}
          />
        </div>
      </div>

      {/* Contact Cards */}
      <div className="container mx-auto px-6 py-12 -mt-10 md:-mt-16 relative z-10">
        <StaggerContainer
          className="grid md:grid-cols-3 gap-6 md:gap-8"
          staggerDelay={0.15}
          delay={0.3}
        >
          {contactMethods.map((method, idx) => (
            <StaggerItem key={idx}>
              <motion.div
                className="bg-white p-8 rounded-2xl shadow-lg shadow-gray-100/50 border border-gray-100 flex flex-col items-center text-center h-full"
                whileHover={{
                  y: -8,
                  boxShadow: '0 25px 50px rgba(0, 0, 0, 0.1)',
                  transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] },
                }}
              >
                <motion.div
                  className="w-16 h-16 bg-neutral-900 text-white rounded-2xl flex items-center justify-center mb-6 shadow-neutral-200 shadow-xl"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                >
                  <method.icon size={28} strokeWidth={1.5} />
                </motion.div>
                <h3 className="text-xl font-bold mb-2">{t(method.title)}</h3>
                {method.action ? (
                  <motion.a
                    href={method.action}
                    className="text-lg font-medium hover:text-blue-600 transition-colors mb-2"
                    whileHover={{ scale: 1.02 }}
                  >
                    {t(method.value)}
                  </motion.a>
                ) : (
                  <p className="text-lg font-medium mb-2">{t(method.value)}</p>
                )}
                <p className="text-sm text-gray-400">{t(method.description)}</p>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto px-6 py-12 md:py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Social Media & Info */}
          <div className="space-y-8">
            <div>
              <SlideLeft>
                <h2 className="text-3xl font-bold mb-4">
                  {t('socials_title')}
                </h2>
              </SlideLeft>
              <FadeUp delay={0.1}>
                <p className="text-gray-600 text-lg mb-8">
                  {t('socials_description')}
                </p>
              </FadeUp>
              <StaggerContainer
                className="flex flex-wrap gap-4"
                staggerDelay={0.1}
                delay={0.2}
              >
                {socials.map((social, idx) => (
                  <StaggerItem key={idx}>
                    <motion.a
                      href={social.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-3 px-6 py-4 bg-white border border-gray-200 rounded-xl text-gray-700 font-medium transition-colors ${social.color}`}
                      whileHover={{
                        scale: 1.05,
                        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                        transition: { duration: 0.2 },
                      }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <motion.div
                        whileHover={{ rotate: 10 }}
                        transition={{ type: 'spring', stiffness: 400 }}
                      >
                        <social.icon size={22} />
                      </motion.div>
                      <span>{social.name}</span>
                    </motion.a>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </div>

            <FadeUp delay={0.4}>
              <motion.div
                className="bg-neutral-900 text-white p-8 rounded-2xl mt-8"
                whileHover={{
                  scale: 1.02,
                  transition: { duration: 0.3 },
                }}
              >
                <div className="flex items-start gap-4 mb-4">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      repeatDelay: 2,
                    }}
                  >
                    <Clock className="text-neutral-400 mt-1" />
                  </motion.div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">
                      {t('working_hours_title')}
                    </h3>
                    <p className="text-neutral-400">{t('working_days')}</p>
                    <p className="text-white text-xl font-medium mt-1">
                      {t('working_time')}
                    </p>
                    <p className="text-neutral-500 text-sm mt-3">
                      {t('weekend')}
                    </p>
                  </div>
                </div>
              </motion.div>
            </FadeUp>
          </div>

          {/* FAQ / Simple Support Text */}
          <SlideRight delay={0.2}>
            <motion.div
              className="bg-white p-8 md:p-10 rounded-2xl border border-gray-100"
              whileHover={{
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.08)',
                transition: { duration: 0.3 },
              }}
            >
              <FadeUp>
                <h2 className="text-2xl font-bold mb-6">{t('faq_title')}</h2>
              </FadeUp>
              <div className="space-y-6">
                <FadeUp delay={0.1}>
                  <motion.div
                    className="pb-6 border-b border-gray-100"
                    whileHover={{ x: 5, transition: { duration: 0.2 } }}
                  >
                    <h4 className="font-semibold text-lg mb-2">
                      {t('faq.delivery_question')}
                    </h4>
                    <p className="text-gray-600">{t('faq.delivery_answer')}</p>
                  </motion.div>
                </FadeUp>
                <FadeUp delay={0.2}>
                  <motion.div
                    className="pb-6 border-b border-gray-100"
                    whileHover={{ x: 5, transition: { duration: 0.2 } }}
                  >
                    <h4 className="font-semibold text-lg mb-2">
                      {t('faq.payment_question')}
                    </h4>
                    <p className="text-gray-600">{t('faq.payment_answer')}</p>
                  </motion.div>
                </FadeUp>
                <FadeUp delay={0.3}>
                  <motion.div
                    whileHover={{ x: 5, transition: { duration: 0.2 } }}
                  >
                    <h4 className="font-semibold text-lg mb-2">
                      {t('faq.partnership_question')}
                    </h4>
                    <p className="text-gray-600">
                      {t('faq.partnership_answer', {
                        email: 'akbw.uz@gmail.com',
                      })}
                    </p>
                  </motion.div>
                </FadeUp>
                <FadeUp delay={0.3}>
                  <motion.div
                    whileHover={{ x: 5, transition: { duration: 0.2 } }}
                  >
                    <h4 className="font-semibold text-lg mb-2">
                      {t('faq.why_first_pay')}
                    </h4>
                    <p className="text-gray-600">
                      {t('faq.why_first_pay_answer')}
                    </p>
                  </motion.div>
                </FadeUp>
              </div>
              <FadeUp delay={0.4}>
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <AnimatedLine className="w-12 mb-4" />
                  <motion.div whileHover={{ x: 3 }}>
                    <Link
                      href="/terms"
                      className="text-sm text-gray-400 hover:text-black transition-colors"
                    >
                      {t('terms_link')}
                    </Link>
                  </motion.div>
                </div>
              </FadeUp>
            </motion.div>
          </SlideRight>
        </div>
      </div>
    </div>
  );
}
