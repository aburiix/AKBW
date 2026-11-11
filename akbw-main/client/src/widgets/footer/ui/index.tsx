'use client';

import { useUIStore } from '@/shared/model/use-ui-store';
import { PRODUCT_INFO } from '@/shared/constants/data';
import Link from 'next/link';
import { Instagram, Send, Globe2Icon } from 'lucide-react';
import { useTranslations } from 'next-intl';

const PAYMENTS = [
  { src: '/icons/payme.png', alt: 'Payme' },
  { src: '/icons/click.png', alt: 'Click' },
  { src: '/icons/uzum.png', alt: 'Uzum' },
  { src: '/icons/paynet.svg', alt: 'Paynet' },
];

const Footer = () => {
  const openProfileChat = useUIStore((state) => state.openProfileChat);
  const t = useTranslations('Footer');

  const columns = [
    {
      title: t('shop'),
      links: [
        { name: t('new_arrivals'), href: '/new' },
        { name: t('best_sellers'), href: '/best' },
        { name: t('all_products'), href: '/filters' },
      ],
    },
    {
      title: t('support'),
      links: [
        { name: t('contact_us'), href: '/contact' },
        { name: t('chat'), href: '/', chat: true },
      ],
    },
    {
      title: t('company'),
      links: [
        { name: t('about_akbw'), href: '/about' },
        { name: t('privacy_policy'), href: PRODUCT_INFO.privacy_policy },
        { name: t('terms_of_use'), href: PRODUCT_INFO.terms_of_use },
      ],
    },
  ];

  const socials = [
    {
      href: PRODUCT_INFO.socials.instagram,
      label: 'Instagram',
      Icon: Instagram,
      blank: true,
    },
    {
      href: PRODUCT_INFO.socials.telegram,
      label: 'Telegram',
      Icon: Send,
      blank: true,
    },
    {
      href: PRODUCT_INFO.socials.website,
      label: 'Website',
      Icon: Globe2Icon,
      blank: false,
    },
  ];

  return (
    <footer className="mt-16 md:mt-28 border-t border-line pt-12 pb-8 text-ivory">
      <div className="wrap">
        <div className="grid grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] gap-8 lg:gap-10">
          <div className="col-span-2 lg:col-span-1">
            <Link
              href="/"
              className="font-display !normal-case text-[28px] tracking-[0.05em]"
            >
              {PRODUCT_INFO.name}
            </Link>
            <p className="text-ivory/60 text-sm leading-relaxed my-4 max-w-[340px]">
              {t('footer-desc')}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {PAYMENTS.map((p) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={p.alt}
                  src={p.src}
                  alt={p.alt}
                  className="h-[30px] w-[64px] rounded-md bg-[#f4f1ea] px-1.5 py-1 object-contain"
                />
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="lbl text-ivory/60 mb-4 font-normal">
                {col.title}
              </h3>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      onClick={(e) => {
                        if ('chat' in link && link.chat) {
                          e.preventDefault();
                          openProfileChat();
                        }
                      }}
                      className="text-sm text-ivory/60 hover:text-ivory transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          aria-hidden
          className="font-display !normal-case text-center select-none leading-[0.8] tracking-[0.03em] mt-12 text-[clamp(80px,20vw,280px)] bg-gradient-to-b from-ivory/25 to-transparent bg-clip-text text-transparent"
        >
          AKBW
        </div>

        <div className="flex flex-col-reverse md:flex-row justify-between items-center gap-4 pt-8 mt-8 border-t border-line text-xs text-ivory/40">
          <p>{t('copyright')}</p>
          <div className="flex items-center gap-5">
            <Link
              href={PRODUCT_INFO.privacy_policy}
              className="hover:text-ivory"
            >
              {t('privacy')}
            </Link>
            <Link href={PRODUCT_INFO.terms_of_use} className="hover:text-ivory">
              {t('terms')}
            </Link>
            <div className="flex gap-1.5">
              {socials.map(({ href, label, Icon, blank }) => (
                <a
                  key={label}
                  href={href}
                  target={blank ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="size-10 rounded-full border border-line grid place-items-center text-ivory/70 hover:text-ivory hover:border-line-2"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
