'use client';

import dynamic from 'next/dynamic';
import { Link, useRouter, usePathname } from '@/shared/config/i18n/navigation';
import { useUserStore } from '@/shared/store/user.store';
import { useCartStore } from '@/shared/store/cart.store';
import { useWishlistStore } from '@/shared/store/wishlist.store';
import { useEffect, useRef, useState } from 'react';
import {
  ChevronDown,
  Globe,
  Heart,
  Search,
  ShoppingBag,
  User,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useCategories } from '../lib/hooks';
import { useTranslations, useLocale } from 'next-intl';
import { cn } from '@/shared/lib/utils';
import MobileTabbar from './MobileTabbar';

const Profile = dynamic(() => import('@/widgets/profile'), { ssr: false });
const Login = dynamic(() => import('@/widgets/login'), { ssr: false });
const Register = dynamic(() => import('@/widgets/register'), { ssr: false });

const LOCALES = [
  { code: 'uz', label: "Özbekça" },
  { code: 'ru', label: 'Русский' },
  { code: 'en', label: 'English' },
];

const ANNOUNCEMENTS = ['ann_pay', 'ann_bts', 'ann_bonus', 'ann_brand'] as const;

const iconBtn =
  'relative size-[42px] grid place-items-center rounded-full hover:bg-white/[0.07] transition-colors';

const Badge = ({ n }: { n: number }) => (
  <span className="absolute top-0.5 right-0.5 min-w-[17px] h-[17px] px-1 rounded-full bg-ivory text-night text-[10px] font-semibold leading-[17px] text-center">
    {n}
  </span>
);

const Navbar = () => {
  const [megaOpen, setMegaOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [mounted, setMounted] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  const token = useUserStore((s) => s.token);
  const cartCount = useCartStore((s) =>
    s.items.reduce((sum, i) => sum + i.quantity, 0),
  );
  const favCount = useWishlistStore((s) => s.items.length);
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('Navbar');
  const tLogin = useTranslations('Login');
  const tRegister = useTranslations('Register');
  const tHome = useTranslations('HomePage');
  const tUi = useTranslations('Ui');

  const { data: categories, isError } = useCategories();
  const parents = categories?.filter((c) => !c.parentId) ?? [];

  // Savat/sevimlilar soni localStorage'dan — faqat klientda ko'rsatiladi
  useEffect(() => setMounted(true), []);

  // Sahifa almashganda menyular yopiladi
  useEffect(() => {
    setMegaOpen(false);
    setLangOpen(false);
  }, [pathname]);

  // Tashqariga bosilganda yopish
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!headerRef.current?.contains(e.target as Node)) {
        setMegaOpen(false);
        setLangOpen(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      router.push(`/filters?q=${searchVal.trim()}`);
    }
  };

  const changeLanguage = (code: string) => {
    setLangOpen(false);
    router.replace(pathname, { locale: code });
  };

  const navLink = (href: string, label: string) => (
    <Link
      href={href}
      className={cn(
        'h-10 px-3.5 rounded-full inline-flex items-center lbl whitespace-nowrap transition-colors',
        pathname === href
          ? 'text-ivory bg-white/[0.06]'
          : 'text-ivory/60 hover:text-ivory hover:bg-white/[0.06]',
      )}
    >
      {label}
    </Link>
  );

  return (
    <>
      {/* E'lon qatori */}
      <div className="bg-ivory text-night overflow-hidden">
        <div className="marquee flex w-max py-2 lbl !text-[10.5px]">
          {[...ANNOUNCEMENTS, ...ANNOUNCEMENTS].map((a, i) => (
            <span key={i} className="flex gap-14 pr-14">
              <span>{tUi(a)}</span>
              <span>✦</span>
            </span>
          ))}
        </div>
      </div>

      <header
        ref={headerRef}
        className="sticky top-0 z-50 bg-night/80 backdrop-blur-xl border-b border-line"
      >
        <div className="wrap flex items-center gap-5 h-[60px] lg:h-[72px]">
          <Link
            href="/"
            className="font-display !normal-case text-[26px] lg:text-[28px] tracking-[0.05em] text-ivory shrink-0 mr-auto lg:mr-0"
          >
            AKBW
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => setMegaOpen((v) => !v)}
              className={cn(
                'h-10 px-3.5 rounded-full inline-flex items-center gap-1.5 lbl transition-colors',
                megaOpen
                  ? 'text-ivory bg-white/[0.06]'
                  : 'text-ivory/60 hover:text-ivory hover:bg-white/[0.06]',
              )}
            >
              {t('category')}
              <ChevronDown
                size={14}
                className={cn('transition-transform', megaOpen && 'rotate-180')}
              />
            </button>
            {navLink('/new', tHome('newest'))}
            {navLink('/best', tHome('most-sold'))}
            <span className="hidden 2xl:contents">
              {navLink('/about', t('about'))}
              {navLink('/contact', t('contact'))}
            </span>
          </nav>

          <form
            onSubmit={handleSearch}
            className="hidden xl:flex items-center gap-2.5 h-11 px-4 rounded-full bg-surface border border-line flex-1 max-w-[420px] ml-auto text-ivory/60 focus-within:border-line-2"
          >
            <button type="submit" aria-label="Qidiriş">
              <Search size={18} />
            </button>
            <input
              type="text"
              placeholder={t('search')}
              className="bg-transparent outline-none flex-1 text-sm text-ivory"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
            />
          </form>

          <div className="flex items-center gap-0.5">
            <button
              onClick={() =>
                window.dispatchEvent(new CustomEvent('akbw:assistant'))
              }
              aria-label="AKBW AI"
              className={cn(iconBtn, 'hidden md:grid')}
            >
              <span className="flex flex-col items-center gap-0.5 leading-none">
                <Sparkles size={18} strokeWidth={1.5} />
                <span className="text-[9px] font-semibold tracking-[0.08em]">
                  AI
                </span>
              </span>
            </button>
            <Link
              href="/search"
              aria-label="Qidiruv"
              className={cn(iconBtn, 'xl:hidden')}
            >
              <Search size={20} strokeWidth={1.5} />
            </Link>

            <div className="relative hidden md:block">
              <button
                onClick={() => setLangOpen((v) => !v)}
                aria-label="Til"
                className={iconBtn}
              >
                <Globe size={20} strokeWidth={1.5} />
              </button>
              {langOpen && (
                <div className="glass absolute right-0 top-12 w-40 p-1.5 rounded-2xl z-[60] !bg-night/90">
                  {LOCALES.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => changeLanguage(l.code)}
                      className={cn(
                        'block w-full text-left px-3 py-2.5 rounded-xl text-sm text-ivory hover:bg-white/[0.08]',
                        locale === l.code && 'bg-white/[0.08]',
                      )}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/favorites"
              aria-label={tUi('tab_fav')}
              className={cn(iconBtn, 'hidden md:grid')}
            >
              <Heart size={20} strokeWidth={1.5} />
              {mounted && favCount > 0 && <Badge n={favCount} />}
            </Link>

            <Link href="/cart" aria-label={tUi('tab_cart')} className={iconBtn}>
              <ShoppingBag size={20} strokeWidth={1.5} />
              {mounted && cartCount > 0 && <Badge n={cartCount} />}
            </Link>

            {token === null ? (
              <>
                <div className="hidden lg:flex items-center gap-1.5 ml-1.5">
                  <Login
                    trigger={
                      <button className="pill pill-ghost pill-sm">
                        {tLogin('login_title')}
                      </button>
                    }
                  />
                  <Register
                    trigger={
                      <button className="pill pill-ivory pill-sm">
                        {tRegister('register_title')}
                      </button>
                    }
                  />
                </div>
                <Link
                  href="/profile"
                  aria-label="Profil"
                  className={cn(iconBtn, 'hidden md:grid lg:hidden')}
                >
                  <User size={20} strokeWidth={1.5} />
                </Link>
              </>
            ) : (
              <Link
                href="/profile"
                aria-label="Profil"
                className="hidden md:grid ml-1.5 size-10 rounded-full bg-ivory text-night place-items-center"
              >
                <User size={18} />
              </Link>
            )}
          </div>
        </div>

        {/* Mega menyu: kategoriyalar API'dan */}
        {megaOpen && (
          <div className="absolute left-0 right-0 top-full bg-night/95 backdrop-blur-2xl border-b border-line animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="wrap grid grid-cols-4 gap-8 py-8">
              <div className="col-span-3 grid grid-cols-3 gap-8">
                {isError && (
                  <p className="text-ivory/60 col-span-3">
                    {t('category_error')}
                  </p>
                )}
                {parents.map((p) => (
                  <div key={p.id}>
                    <Link
                      href={`/filters?category=${p.id}`}
                      className="serif text-[22px] text-ivory hover:opacity-80"
                    >
                      {p.name}
                    </Link>
                    <ul className="mt-3">
                      {p.children?.map((c) => (
                        <li key={c.id}>
                          <Link
                            href={`/filters?category=${c.id}`}
                            className="block py-1.5 text-sm text-ivory/60 hover:text-ivory"
                          >
                            {c.name}
                          </Link>
                        </li>
                      ))}
                      <li>
                        <Link
                          href={`/filters?category=${p.id}`}
                          className="block py-1.5 text-sm text-ivory"
                        >
                          {t('category_by_category')} →
                        </Link>
                      </li>
                    </ul>
                  </div>
                ))}
              </div>
              <Link
                href="/filters"
                className="relative rounded-2xl overflow-hidden aspect-[16/11] group"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/assets/oldmoney.jpg"
                  alt=""
                  className="absolute inset-0 size-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-night/80" />
                <div className="absolute left-4 bottom-3.5">
                  <span className="lbl text-ivory/70">{t('see_all')}</span>
                  <b className="serif text-2xl text-ivory font-normal mt-1 flex items-center gap-2">
                    {t('categories')} <ArrowRight size={18} />
                  </b>
                </div>
              </Link>
            </div>
          </div>
        )}
      </header>

      <MobileTabbar />
      {/* Profil ichki oynalari (tahrirlash, chatlar, bildirishnomalar, sharhlar) — /profile sahifasi va futer ochadi */}
      <Profile>
        <button type="button" className="hidden" aria-hidden tabIndex={-1} />
      </Profile>
    </>
  );
};

export default Navbar;
