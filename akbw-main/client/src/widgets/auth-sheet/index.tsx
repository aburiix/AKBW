'use client';

import React, { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useLocale, useTranslations } from 'next-intl';
import { X } from 'lucide-react';
import { sendSms, verifySms } from '@/shared/config/api/sms/sms.request';
import { login, register } from '@/shared/config/api/auth/auth.request';
import { useUserStore } from '@/shared/store/user.store';
import { cn } from '@/shared/lib/utils';
import {
  REGION_NAMES,
  UZ_REGIONS,
  toNewLatinName,
} from '@/shared/constants/uzRegions';

/**
 * Kirish / ro'yxatdan o'tish — ilovadagi (akbw-mobile/src/app/login.tsx) ekranning 1:1 nusxasi:
 * o'lchamlar, ranglar, shriftlar, maydonlar tartibi va oqim bir xil.
 */

type Mode = 'login' | 'register';
type Step = 'form' | 'code';

// Ilovadagi uslublar (px)
const LBL = 'font-[family-name:var(--font-futura)] uppercase';
const input =
  'w-full h-14 rounded-full bg-surface border border-line-2 px-[22px] text-[18px] text-ivory placeholder:text-ivory/40 outline-none focus:border-ivory/40';
const btnBase = `${LBL} h-[50px] w-full rounded-full grid place-items-center text-[11.5px] tracking-[0.2em] transition active:scale-[0.98] disabled:opacity-40`;

const formatPhone = (value: string) => {
  let cleaned = value.replace(/[^\d+]/g, '');
  if (!cleaned.startsWith('+998'))
    cleaned = '+998' + cleaned.replace('+', '').replace('998', '');
  const d = cleaned.slice(4).replace(/\D/g, '');
  let f = '+998';
  if (d.length > 0) f += ' ' + d.slice(0, 2);
  if (d.length > 2) f += ' ' + d.slice(2, 5);
  if (d.length > 5) f += ' ' + d.slice(5, 7);
  if (d.length > 7) f += ' ' + d.slice(7, 9);
  return f;
};
const isPhoneComplete = (p: string) => p.replace(/\D/g, '').length === 12;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const apiMessage = (e: any): string | undefined =>
  e?.response?.data?.message || e?.response?.data?.error;

export default function AuthSheet({
  trigger,
  initialMode = 'login',
}: {
  trigger: ReactNode;
  initialMode?: Mode;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', esc);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', esc);
    };
  }, [open]);

  return (
    <>
      <span
        className="contents"
        onClick={(e) => {
          e.preventDefault();
          setOpen(true);
        }}
      >
        {trigger}
      </span>
      {mounted &&
        open &&
        createPortal(
          <div className="fixed inset-0 z-[200]" role="dialog" aria-modal>
            <button
              aria-label="close"
              className="absolute inset-0 bg-black/55"
              onClick={() => setOpen(false)}
            />
            {/* Telefonda — ilovadagi modal kabi tepadan biroz pastda, yumaloq yuqori burchaklar; kompyuterda — o'rtada */}
            <div className="absolute inset-x-0 bottom-0 top-[calc(env(safe-area-inset-top)+14px)] md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[440px] md:max-h-[92vh] rounded-t-[22px] md:rounded-[28px] overflow-hidden bg-night border border-line flex flex-col">
              <div className="relative h-[54px] shrink-0 bg-surface/60 border-b border-line">
                <span className="absolute left-1/2 top-2 -translate-x-1/2 h-1 w-9 rounded-full bg-ivory/20" />
                <button
                  onClick={() => setOpen(false)}
                  aria-label="close"
                  className="absolute right-3 top-1/2 -translate-y-1/2 size-9 rounded-full grid place-items-center text-ivory/60"
                >
                  <X size={18} />
                </button>
              </div>
              <div
                className="flex-1 overflow-y-auto"
                style={{ backgroundImage: 'var(--c-glow)' }}
              >
                <AuthForm
                  initialMode={initialMode}
                  onDone={() => {
                    setOpen(false);
                    window.location.reload();
                  }}
                />
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

function AuthForm({
  initialMode,
  onDone,
}: {
  initialMode: Mode;
  onDone: () => void;
}) {
  const t = useTranslations('Auth');
  const locale = useLocale();
  const show = (v: string) => (locale === 'uz' ? toNewLatinName(v) : v);
  const setToken = useUserStore((s) => s.setToken);

  const [reg, setReg] = useState(initialMode === 'register');
  const [step, setStep] = useState<Step>('form');
  const [existing, setExisting] = useState(false);
  const [phone, setPhone] = useState('+998');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [region, setRegion] = useState('');
  const [district, setDistrict] = useState('');
  const [email, setEmail] = useState('');
  const [referral, setReferral] = useState('');
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get('ref');
    if (ref) setReferral(ref);
  }, []);
  useEffect(() => {
    if (timer <= 0) return;
    const id = setTimeout(() => setTimer(timer - 1), 1000);
    return () => clearTimeout(id);
  }, [timer]);

  const switchMode = (toReg: boolean) => {
    setReg(toReg);
    setStep('form');
    setError(null);
    setNote(null);
  };

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError(apiMessage(e) ?? t('error'));
    } finally {
      setBusy(false);
    }
  };

  const birthDate = (() => {
    const d = Number(day),
      m = Number(month),
      y = Number(year);
    if (!d || !m || year.length !== 4) return '';
    const dt = new Date(Date.UTC(y, m - 1, d));
    if (
      dt.getUTCDate() !== d ||
      dt.getUTCMonth() !== m - 1 ||
      y < 1920 ||
      dt > new Date()
    )
      return '';
    return dt.toISOString().slice(0, 10);
  })();
  const emailOk =
    !email.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const formOk =
    isPhoneComplete(phone) &&
    agree &&
    (!reg ||
      (name.trim().length >= 2 &&
        lastName.trim().length >= 2 &&
        !!birthDate &&
        !!region &&
        !!district &&
        emailOk));

  const sendCode = () =>
    run(async () => {
      setNote(null);
      if (reg) {
        const r = await sendSms({ phone });
        const already = !!r?.data?.isRegistered;
        setExisting(already);
        if (already) setNote(t('already_registered'));
      } else {
        try {
          await sendSms({ phone, type: 'login' });
          setExisting(true);
        } catch (e) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if ((e as any)?.response?.status === 404) {
            setError(t('not_registered'));
            return;
          }
          throw e;
        }
      }
      setCode('');
      setStep('code');
      setTimer(60);
    });

  const verify = () =>
    run(async () => {
      const v = await verifySms(phone, code);
      const verifyToken = v?.data?.verifyToken ?? '';
      const r =
        reg && !existing
          ? await register({
              phone,
              name: name.trim(),
              lastName: lastName.trim(),
              gender,
              birthDate,
              region,
              district,
              email: email.trim() || undefined,
              referralCode: referral.trim() || undefined,
              verifyToken,
            })
          : await login({ phone, verifyToken });
      if (!r?.data?.token) throw new Error();
      setToken(r.data.token, r.data.refreshToken);
      onDone();
    });

  return (
    <div className="px-6 pt-9 pb-[calc(24px+env(safe-area-inset-bottom))] flex flex-col gap-[18px]">
      <div className="flex flex-col items-center gap-3.5 mb-1">
        <h2
          className={`${LBL} !font-[family-name:var(--font-futura)] text-[20px] tracking-[0.2em] text-ivory text-center`}
        >
          {reg ? t('heading_register') : t('heading_login')}
        </h2>
        <p className="text-[13px] leading-[19px] text-ivory/60 text-center px-3">
          {reg ? t('lead_register') : t('lead_login')}
        </p>
      </div>

      {step === 'form' && (
        <>
          {!!note && (
            <p className="text-star text-center text-[13px]">{note}</p>
          )}
          {reg && (
            <>
              <input
                className={input}
                placeholder={t('name')}
                autoComplete="given-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                className={input}
                placeholder={t('last_name')}
                autoComplete="family-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
              <span
                className={`${LBL} text-[10px] tracking-[0.2em] text-ivory/60 ml-2 -mb-2`}
              >
                {t('birth')}
              </span>
              <div className="flex gap-2">
                {(
                  [
                    [day, setDay, 2, t('day'), 'flex-1'],
                    [month, setMonth, 2, t('month'), 'flex-1'],
                    [year, setYear, 4, t('year'), 'flex-[1.4]'],
                  ] as const
                ).map(([v, set, n, ph, cls]) => (
                  <input
                    key={ph}
                    inputMode="numeric"
                    placeholder={ph}
                    value={v}
                    onChange={(e) =>
                      set(e.target.value.replace(/\D/g, '').slice(0, n))
                    }
                    className={cn(input, cls, 'min-w-0 text-center px-2')}
                  />
                ))}
              </div>
              {day && month && year.length === 4 && !birthDate && (
                <p className="text-sale text-center text-[14px]">
                  {t('bad_date')}
                </p>
              )}
              <div className="flex gap-2 justify-center">
                <Chip on={gender === 'male'} onClick={() => setGender('male')}>
                  {t('male')}
                </Chip>
                <Chip
                  on={gender === 'female'}
                  onClick={() => setGender('female')}
                >
                  {t('female')}
                </Chip>
              </div>
            </>
          )}
          <input
            className={input}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(formatPhone(e.target.value))}
          />
          {reg && (
            <>
              <PickerField
                label={t('region')}
                value={region ? show(region) : ''}
                items={REGION_NAMES.map((r) => ({ code: r, name: show(r) }))}
                onSelect={(v) => {
                  setRegion(v);
                  setDistrict('');
                }}
              />
              <PickerField
                label={t('district')}
                value={district ? show(district) : ''}
                items={(UZ_REGIONS[region] ?? []).map((d) => ({
                  code: d,
                  name: show(d),
                }))}
                disabled={!region}
                onSelect={setDistrict}
              />
              <input
                className={input}
                type="email"
                autoComplete="email"
                autoCapitalize="none"
                placeholder={t('email')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {!emailOk && (
                <p className="text-sale text-center text-[14px]">
                  {t('bad_email')}
                </p>
              )}
              <input
                className={input}
                autoCapitalize="none"
                autoCorrect="off"
                placeholder={t('referral')}
                value={referral}
                onChange={(e) => setReferral(e.target.value.trim())}
              />
            </>
          )}
          <Consent checked={agree} onChange={setAgree} />
          <button
            type="button"
            disabled={!formOk || busy}
            onClick={sendCode}
            className={cn(btnBase, 'bg-ivory text-night')}
          >
            {busy ? '…' : t('get_code')}
          </button>
          {!!error && (
            <p className="text-sale text-center text-[14px]">{error}</p>
          )}
          <p className="flex justify-center gap-1.5 text-[14px]">
            <span className="text-ivory/60">
              {reg ? t('has_account') : t('no_account')}
            </span>
            <button
              type="button"
              onClick={() => switchMode(!reg)}
              className="text-ivory font-semibold underline"
            >
              {reg ? t('login') : t('register')}
            </button>
          </p>
        </>
      )}

      {step === 'code' && (
        <>
          <p className="text-[13px] leading-[19px] text-ivory/60 text-center">
            {t('code_sent', { n: phone })}
          </p>
          {!!note && (
            <p className="text-star text-center text-[13px]">{note}</p>
          )}
          <input
            className={cn(input, 'text-center tracking-[10px]')}
            inputMode="numeric"
            autoComplete="one-time-code"
            autoFocus
            value={code}
            onChange={(e) =>
              setCode(e.target.value.replace(/\D/g, '').slice(0, 6))
            }
          />
          <button
            type="button"
            disabled={code.length < 4 || busy}
            onClick={verify}
            className={cn(btnBase, 'bg-ivory text-night')}
          >
            {busy ? '…' : reg && !existing ? t('register') : t('confirm')}
          </button>
          <button
            type="button"
            disabled={timer > 0 || busy}
            onClick={sendCode}
            className={cn(btnBase, 'border border-line-2 text-ivory')}
          >
            {timer > 0 ? t('resend_in', { n: timer }) : t('resend')}
          </button>
          <button
            type="button"
            onClick={() => setStep('form')}
            className="text-center text-ivory/60 text-[14px] py-1.5"
          >
            {reg ? t('change_data') : t('change_phone')}
          </button>
          {!!error && (
            <p className="text-sale text-center text-[14px]">{error}</p>
          )}
        </>
      )}
    </div>
  );
}

function Chip({
  on,
  onClick,
  children,
}: {
  on: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        `${LBL} h-9 px-4 rounded-full border text-[10.5px] tracking-[0.2em]`,
        on ? 'bg-ivory border-ivory text-night' : 'border-line-2 text-ivory',
      )}
    >
      {children}
    </button>
  );
}

function Consent({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  const t = useTranslations('Login');
  const go = (path: string) => (e: React.MouseEvent) => {
    e.stopPropagation();
    const locale = window.location.pathname.split('/')[1] || 'uz';
    window.location.assign(`/${locale}${path}`);
  };
  return (
    <div
      role="checkbox"
      aria-checked={checked}
      tabIndex={0}
      onClick={() => onChange(!checked)}
      onKeyDown={(e) => e.key === ' ' && onChange(!checked)}
      className="flex gap-3 items-start px-1 cursor-pointer select-none"
    >
      <span
        className={cn(
          'mt-px size-[22px] shrink-0 rounded-[7px] border-[1.5px] grid place-items-center text-[13px] font-bold',
          checked ? 'bg-ivory border-ivory text-night' : 'border-line-2',
        )}
      >
        {checked ? '✓' : ''}
      </span>
      <span className="text-[13px] leading-[19px] text-ivory/60">
        {t('consent_pre')}{' '}
        <span
          role="link"
          onClick={go('/terms')}
          className="text-ivory underline"
        >
          {t('consent_terms')}
        </span>{' '}
        {t('consent_and')}{' '}
        <span
          role="link"
          onClick={go('/privacy')}
          className="text-ivory underline"
        >
          {t('consent_privacy')}
        </span>{' '}
        {t('consent_post')}
      </span>
    </div>
  );
}

/** Ilovadagi PickerField: maydon + to'liq ekranli qidiruvli ro'yxat */
function PickerField({
  label,
  value,
  items,
  disabled,
  onSelect,
}: {
  label: string;
  value: string;
  items: { code: string; name: string }[];
  disabled?: boolean;
  onSelect: (code: string) => void;
}) {
  const t = useTranslations('Auth');
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const shown = q
    ? items.filter((i) => i.name.toLowerCase().includes(q.toLowerCase()))
    : items;
  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(true)}
        className="w-full text-left bg-surface rounded-[20px] border border-line px-4 py-3 flex flex-col gap-0.5 disabled:opacity-45"
      >
        <span className={`${LBL} text-[10px] tracking-[0.2em] text-ivory/40`}>
          {label}
        </span>
        <span
          className={cn('text-[15px]', value ? 'text-ivory' : 'text-ivory/60')}
        >
          {value || t('select')}
        </span>
      </button>
      {open && (
        <div className="fixed inset-0 z-[210] bg-night flex flex-col pt-[calc(env(safe-area-inset-top)+16px)] md:pt-4">
          <div className="flex justify-between items-center px-4 mb-3">
            <h3 className="serif text-[26px] text-ivory">{label}</h3>
            <button
              onClick={() => setOpen(false)}
              className="text-[15px] text-ivory/60"
            >
              {t('close')}
            </button>
          </div>
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t('search')}
            className="mx-4 mb-2 h-11 rounded-full bg-surface border border-line px-[18px] text-[15px] text-ivory placeholder:text-ivory/60 outline-none"
          />
          <div className="flex-1 overflow-y-auto pb-[calc(24px+env(safe-area-inset-bottom))]">
            {shown.map((i) => (
              <button
                key={i.code}
                onClick={() => {
                  onSelect(i.code);
                  setOpen(false);
                  setQ('');
                }}
                className="w-full text-left px-4 py-3.5 border-b border-line text-[15px] text-ivory active:bg-surface-2"
              >
                {i.name}
              </button>
            ))}
            {!shown.length && (
              <p className="text-center text-ivory/60 mt-10">{t('nothing')}</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
