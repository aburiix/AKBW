'use client';

import { notifyError } from '@/shared/lib/notify-error';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useEffect, useState, type ReactNode } from 'react';
import { useTheme } from 'next-themes';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowRight, Check, ChevronRight, X } from 'lucide-react';
import { Link, usePathname, useRouter } from '@/shared/config/i18n/navigation';
import { useUserStore } from '@/shared/store/user.store';
import { useCartStore } from '@/shared/store/cart.store';
import { useWishlistStore } from '@/shared/store/wishlist.store';
import { useUser } from '@/features/user/lib/hooks';
import { userRequest } from '@/shared/config/api/user/user.request';
import { toast } from '@/shared/ui/toast';
import { cn } from '@/shared/lib/utils';

const Login = dynamic(() => import('@/widgets/login'), { ssr: false });
const Register = dynamic(() => import('@/widgets/register'), { ssr: false });

const LANGS = [
  { id: 'uz', title: 'Özbekça' },
  { id: 'ru', title: 'Русский' },
  { id: 'en', title: 'English' },
];
const MODES = ['system', 'dark', 'light'] as const;
const HERO_BG =
  'radial-gradient(70% 90% at 80% 10%, #6e4a2e, #24180f 60%, #120d09)';

/** Ilovadagi profil ekrani: hisoblagichlar, bo'limlar, til/ko'rinish, chiqish */
export default function ProfilePage() {
  const t = useTranslations('ProfilePage');
  const tp = useTranslations('Profile');
  const token = useUserStore((s) => s.token);
  const setToken = useUserStore((s) => s.setToken);
  const { data: userData } = useUser();
  const favCount = useWishlistStore((s) => s.items.length);
  const inCart = useCartStore((s) =>
    s.items.reduce((sum, i) => sum + i.quantity, 0),
  );
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [sheet, setSheet] = useState<
    'lang' | 'theme' | 'logout' | 'delete' | null
  >(null);
  const [deleting, setDeleting] = useState(false);
  useEffect(() => setMounted(true), []);

  const ai = () => window.dispatchEvent(new CustomEvent('akbw:assistant'));

  const user = userData?.data;
  const orders = (user?.orders ?? []) as { state?: string }[];
  const toPay = orders.filter((o) => o.state === 'PENDING').length;
  const mode = (mounted && (theme as (typeof MODES)[number])) || 'system';
  const modeTitle = t(`theme_${mode}`);
  const langTitle = LANGS.find((l) => l.id === locale)?.title ?? '';

  const invite = async () => {
    if (!user?.referralCode) return;
    const text = t('invite_message', { code: user.referralCode });
    try {
      if (navigator.share) await navigator.share({ text });
      else {
        await navigator.clipboard.writeText(text);
        toast.success(t('copied'));
      }
    } catch {}
  };

  const deleteAccount = async () => {
    setDeleting(true);
    try {
      await userRequest.deleteMe();
      toast.success(tp('delete_account_done'));
      setSheet(null);
      setToken(null);
    } catch (e) {
      notifyError(e, tp('delete_account_error'));
    } finally {
      setDeleting(false);
    }
  };

  const settings = (
    <Section title={t('settings')}>
      <Row
        icon="◐"
        title={t('language')}
        value={langTitle}
        onClick={() => setSheet('lang')}
      />
      <Row
        icon="◑"
        title={t('appearance')}
        value={modeTitle}
        onClick={() => setSheet('theme')}
      />
      {!!token && (
        <Row
          icon="◔"
          title={t('notifications')}
          onClick={() => router.push('/notifications')}
        />
      )}
    </Section>
  );

  const help = (
    <Section title={t('help')}>
      <Row icon="✦" title={t('ai')} onClick={ai} />
      {!!token && (
        <Row
          icon="◍"
          title={t('help_chat')}
          onClick={() => router.push('/chat?kind=help')}
        />
      )}
      <Row icon="@" title={t('contact')} href="/contact" />
      <Row
        icon="☏"
        title={t('call')}
        value="+998 90 566 11 07"
        href="tel:+998905661107"
        external
      />
      <Row
        icon="➤"
        title="Telegram"
        value="@akbwuz"
        href="https://t.me/akbwuz"
        external
      />
      <Row
        icon="◎"
        title="Instagram"
        value="@akbw.uz"
        href="https://instagram.com/akbw.uz"
        external
      />
    </Section>
  );

  const legal = (
    <Section title={t('info')}>
      <Row icon="Ⓐ" title={t('about')} href="/about" />
      <Row icon="§" title={t('privacy')} href="/privacy" />
      <Row icon="§" title={t('terms')} href="/terms" />
    </Section>
  );

  const footer = (
    <p className="text-center text-[11px] tracking-[0.08em] text-ivory/35 mt-7">
      AKBW · Aburiix Kraft Brand Wear
    </p>
  );

  const sheets = (
    <>
      <Sheet
        open={sheet === 'lang'}
        title={t('language')}
        onClose={() => setSheet(null)}
      >
        {LANGS.map((l) => (
          <Option
            key={l.id}
            title={l.title}
            on={l.id === locale}
            onClick={() => {
              setSheet(null);
              router.replace(pathname, { locale: l.id });
            }}
          />
        ))}
      </Sheet>
      <Sheet
        open={sheet === 'theme'}
        title={t('appearance')}
        onClose={() => setSheet(null)}
      >
        {MODES.map((m) => (
          <Option
            key={m}
            title={t(`theme_${m}`)}
            hint={m === 'system' ? t('theme_hint') : undefined}
            on={m === mode}
            onClick={() => {
              setTheme(m);
              setSheet(null);
            }}
          />
        ))}
      </Sheet>
      <Sheet
        open={sheet === 'logout'}
        title={t('logout_confirm')}
        onClose={() => setSheet(null)}
      >
        <div className="flex gap-2.5 pt-1">
          <button
            className="pill pill-ghost flex-1"
            onClick={() => setSheet(null)}
          >
            {t('cancel')}
          </button>
          <button
            className="pill flex-1 border border-sale text-sale"
            onClick={() => {
              setSheet(null);
              setToken(null);
            }}
          >
            {t('logout')}
          </button>
        </div>
      </Sheet>
      <Sheet
        open={sheet === 'delete'}
        title={tp('delete_account_title')}
        onClose={() => setSheet(null)}
      >
        <p className="text-[13.5px] leading-relaxed text-ivory/60 mb-4">
          {tp('delete_account_desc')}
        </p>
        <div className="flex gap-2.5">
          <button
            className="pill pill-ghost flex-1"
            onClick={() => setSheet(null)}
            disabled={deleting}
          >
            {tp('delete_account_cancel')}
          </button>
          <button
            className="pill flex-1 border border-sale text-sale disabled:opacity-50"
            onClick={deleteAccount}
            disabled={deleting}
          >
            {tp('delete_account_confirm')}
          </button>
        </div>
      </Sheet>
    </>
  );

  // ---------- Mehmon ----------
  if (mounted && !token)
    return (
      <div className="wrap max-w-[640px] pt-5 pb-10">
        <section
          data-theme="dark"
          style={{ backgroundImage: HERO_BG }}
          className="rounded-[28px] border border-line p-6 flex flex-col items-center gap-3.5 text-center"
        >
          <span className="font-display !normal-case text-[34px] tracking-[0.05em] leading-none text-ivory">
            AKBW
          </span>
          <h1 className="serif text-[30px] text-ivory mt-1.5">
            {t('cabinet')}
          </h1>
          <p className="text-ivory/65 text-sm leading-relaxed">
            {t('guest_text')}
          </p>
          <div className="self-stretch flex flex-col gap-2.5 mt-1.5">
            <Login
              trigger={
                <button className="pill pill-ivory w-full">
                  {tp('login')}
                </button>
              }
            />
            <Register
              trigger={
                <button className="pill pill-ghost w-full">
                  {tp('register')}
                </button>
              }
            />
          </div>
        </section>
        <div className="grid grid-cols-2 gap-2 mt-4">
          <Stat value={favCount} title={t('favorites')} href="/favorites" />
          <Stat value={inCart} title={t('in_cart')} href="/cart" />
        </div>
        {settings}
        {help}
        {legal}
        {footer}
        {sheets}
      </div>
    );

  // ---------- Kirilgan ----------
  const fullName = user
    ? `${user.name ?? ''} ${user.lastName ?? ''}`.trim()
    : '…';

  return (
    <div className="wrap max-w-[640px] pt-4 pb-10">
      <div className="flex items-center gap-3.5 py-3">
        <button
          onClick={() => router.push('/profile-edit')}
          style={{ backgroundImage: HERO_BG }}
          className="relative size-16 shrink-0 rounded-full overflow-hidden border border-line-2 grid place-items-center"
        >
          {user?.profile_picture ? (
            <Image
              src={user.profile_picture.replace(/^http:\/\//, 'https://')}
              alt=""
              fill
              sizes="64px"
              className="object-cover"
            />
          ) : (
            <span className="serif text-[26px] text-[#EFE8DB]">
              {(user?.name?.[0] ?? 'A').toUpperCase()}
            </span>
          )}
        </button>
        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
          <h1 className="serif text-[22px] leading-[1.15] text-ivory line-clamp-2">
            {fullName}
          </h1>
          <span className="lbl !text-[10px] text-ivory/50">
            {user?.phone ?? ''}
          </span>
        </div>
        <button
          onClick={() => router.push('/profile-edit')}
          className="h-9 px-3.5 rounded-full border border-line-2 lbl !text-[9.5px] text-ivory hover:bg-surface-2"
        >
          {t('edit')}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-4">
        <Stat
          value={user ? orders.length : '–'}
          title={t('orders')}
          href="/orders"
        />
        <Stat value={favCount} title={t('favorites')} href="/favorites" />
        <Stat value={inCart} title={t('in_cart')} href="/cart" />
      </div>

      {toPay > 0 && (
        <Link
          href="/orders"
          className="mt-3.5 flex items-center gap-3 p-4 rounded-[20px] border border-star bg-surface"
        >
          <span className="flex-1 flex flex-col gap-1">
            <span className="lbl !text-[10px] text-star">{t('pay_wait')}</span>
            <span className="text-sm text-ivory">
              {t('pay_text', { n: toPay })}
            </span>
          </span>
          <ArrowRight size={18} className="text-ivory" />
        </Link>
      )}

      <Section title={t('purchases')}>
        <Row
          icon="▤"
          title={t('my_orders')}
          href="/orders"
          badge={toPay || undefined}
        />
        <Row icon="♡" title={t('favorites')} href="/favorites" />
        <Row icon="◈" title={t('tryon_history')} href="/tryon-history" />
        <Row
          icon="★"
          title={t('my_reviews')}
          onClick={() => router.push('/my-reviews')}
        />
        <Row
          icon="⌕"
          title={t('ask_product')}
          onClick={() => router.push('/chat?kind=ask')}
        />
      </Section>

      {!!user?.referralCode && (
        <button
          onClick={invite}
          data-theme="dark"
          style={{ backgroundImage: HERO_BG }}
          className="w-full mt-6 flex items-center gap-3 p-5 rounded-[24px] border border-line text-left"
        >
          <span className="flex-1 flex flex-col gap-1.5">
            <span className="lbl !text-[10px] text-ivory/60">AKBW Club</span>
            <span className="serif text-[22px] text-ivory">
              {t('invite_title')}
            </span>
            <span className="text-[13px] text-ivory/70">
              {t('invite_code')}:{' '}
              <b className="text-ivory font-semibold text-[11px] select-all">
                {user.referralCode}
              </b>
            </span>
          </span>
          <span className="lbl !text-[10px] text-ivory">{t('share')} ↗</span>
        </button>
      )}

      {settings}
      {help}
      {legal}

      <div className="mt-6 flex flex-col gap-3">
        <button
          className="pill pill-ghost w-full"
          onClick={() => setSheet('logout')}
        >
          {t('logout')}
        </button>
        <button
          className="pill w-full border border-sale text-sale"
          onClick={() => setSheet('delete')}
        >
          {tp('delete_account')}
        </button>
      </div>
      {footer}
      {sheets}
    </div>
  );
}

function Stat({
  value,
  title,
  href,
}: {
  value: number | string;
  title: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="bg-surface border border-line rounded-[20px] py-4 flex flex-col items-center gap-1.5 hover:bg-surface-2 transition-colors"
    >
      <span className="serif text-[28px] leading-none text-ivory">{value}</span>
      <span className="lbl !text-[9px] text-ivory/50">{title}</span>
    </Link>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-6 flex flex-col gap-2.5">
      <span className="lbl text-ivory/50 px-1">{title}</span>
      <div className="bg-surface border border-line rounded-[22px] overflow-hidden divide-y divide-[var(--c-line)]">
        {children}
      </div>
    </section>
  );
}

function Row({
  icon,
  title,
  value,
  badge,
  href,
  external,
  onClick,
}: {
  icon: string;
  title: string;
  value?: string;
  badge?: number;
  href?: string;
  external?: boolean;
  onClick?: () => void;
}) {
  const body = (
    <>
      <span className="size-8 shrink-0 rounded-[10px] bg-surface-2 grid place-items-center text-[15px] text-ivory">
        {icon}
      </span>
      <span className="flex-1 min-w-0 truncate text-[15px] text-ivory">
        {title}
      </span>
      {!!badge && (
        <span className="min-w-5 h-5 px-1.5 rounded-full bg-ivory text-night text-[11px] font-bold grid place-items-center">
          {badge}
        </span>
      )}
      {!!value && (
        <span className="max-w-[160px] truncate text-[13px] text-ivory/55">
          {value}
        </span>
      )}
      <ChevronRight size={18} className="text-ivory/35 shrink-0" />
    </>
  );
  const cls =
    'w-full flex items-center gap-3 px-3.5 h-[58px] text-left hover:bg-surface-2 transition-colors';
  if (href && external)
    return (
      <a
        href={href}
        target={href.startsWith('http') ? '_blank' : undefined}
        rel="noreferrer"
        className={cls}
      >
        {body}
      </a>
    );
  if (href)
    return (
      <Link href={href} className={cls}>
        {body}
      </Link>
    );
  return (
    <button type="button" onClick={onClick} className={cls}>
      {body}
    </button>
  );
}

/** Ilovadagi OptionSheet: telefonda pastdan chiqadi, kompyuterda markazda */
function Sheet({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[80] flex items-end md:items-center justify-center"
      role="dialog"
      aria-modal
    >
      <button
        aria-label="close"
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div className="relative w-full md:max-w-[420px] bg-surface border border-line rounded-t-[28px] md:rounded-[28px] p-5 pb-[calc(20px+env(safe-area-inset-bottom))] md:pb-5 flex flex-col gap-2">
        <div className="flex items-center justify-between mb-2">
          <h2 className="serif text-[24px] text-ivory">{title}</h2>
          <button
            onClick={onClose}
            aria-label="close"
            className="size-9 rounded-full border border-line-2 grid place-items-center text-ivory/70"
          >
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Option({
  title,
  hint,
  on,
  onClick,
}: {
  title: string;
  hint?: string;
  on: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-4 min-h-[56px] py-3 rounded-[18px] border text-left transition-colors',
        on ? 'border-ivory bg-surface-2' : 'border-line hover:bg-surface-2',
      )}
    >
      <span className="flex-1 flex flex-col gap-1">
        <span className="text-[15px] text-ivory">{title}</span>
        {hint && <span className="text-[12px] text-ivory/50">{hint}</span>}
      </span>
      {on && <Check size={18} className="text-ivory" />}
    </button>
  );
}
