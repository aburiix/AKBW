'use client';

import React from 'react';
import { cn } from '@/shared/lib/utils';

/**
 * Kirish / ro'yxatdan o'tish / kod oynalari uchun umumiy bo'laklar
 * (bosh sahifadagi v5 uslubi: shisha, serif sarlavha, pill tugmalar).
 */

/** Oyna sarlavhasi: AKBW belgisi, qadam ko'rsatkichi, serif sarlavha */
export function AuthHeader({
  title,
  subtitle,
  step,
  total = 2,
}: {
  title: string;
  subtitle?: React.ReactNode;
  step?: number;
  total?: number;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative mb-5 grid place-items-center size-16 rounded-[20px] glass shadow-[0_20px_40px_-18px_rgba(0,0,0,0.8)]">
        <span className="font-display text-[15px] text-ivory tracking-[0.06em]">
          AKBW
        </span>
        <span className="pointer-events-none absolute inset-0 rounded-[20px] bg-[radial-gradient(circle_at_30%_20%,rgba(200,152,106,0.35),transparent_60%)]" />
      </div>
      {step != null && (
        <div className="mb-3 flex items-center gap-1.5" aria-hidden>
          {Array.from({ length: total }).map((_, i) => (
            <span
              key={i}
              className={cn(
                'h-1 rounded-full transition-all duration-300',
                i < step ? 'w-6 bg-ivory' : 'w-3 bg-ivory/20',
              )}
            />
          ))}
        </div>
      )}
      <h2 className="serif text-[30px] md:text-[34px] leading-[1.05] text-ivory">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-2.5 max-w-[34ch] text-[13px] leading-relaxed text-ivory/55">
          {subtitle}
        </p>
      )}
    </div>
  );
}

/** Yorliq + maydon + xato matni */
export function Field({
  label,
  error,
  children,
  className,
}: {
  label?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {label && <label className="lbl text-ivory/55">{label}</label>}
      {children}
      {error && <p className="text-xs text-sale">{error}</p>}
    </div>
  );
}

/** Xato bo'lsa maydon chegarasi */
export const fieldError = (err?: string) =>
  err ? '!border-sale/70 focus-visible:!ring-sale/15' : '';

/**
 * 5 xonali kod: ko'rinishda 5 ta katak, aslida bitta input
 * (joylashtirish, SMS avto-to'ldirish va eski onChange ishlaydi).
 */
export function OtpInput({
  value,
  onChange,
  length = 5,
  error,
  autoFocus = true,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  length?: number;
  error?: boolean;
  autoFocus?: boolean;
}) {
  const [focused, setFocused] = React.useState(false);
  const active = Math.min(value.length, length - 1);
  return (
    <div className="relative">
      <div
        className="grid gap-2.5"
        style={{ gridTemplateColumns: `repeat(${length}, minmax(0,1fr))` }}
      >
        {Array.from({ length }).map((_, i) => {
          const ch = value[i];
          const isActive = focused && i === active;
          return (
            <div
              key={i}
              className={cn(
                'relative grid place-items-center h-[62px] md:h-[68px] rounded-2xl border bg-ivory/[0.04] transition-all duration-200',
                error
                  ? 'border-sale/70'
                  : isActive
                    ? 'border-ivory/70 bg-ivory/[0.08] ring-4 ring-ivory/10'
                    : ch
                      ? 'border-ivory/30'
                      : 'border-line-2',
              )}
            >
              <span className="serif text-[30px] text-ivory leading-none">
                {ch ?? ''}
              </span>
              {isActive && !ch && (
                <span className="absolute h-7 w-px bg-ivory animate-pulse" />
              )}
            </div>
          );
        })}
      </div>
      <input
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={length}
        autoFocus={autoFocus}
        aria-label="SMS kod"
        className="absolute inset-0 w-full h-full opacity-0 cursor-text"
      />
    </div>
  );
}

/** Taymer / qayta yuborish satri */
export function ResendRow({
  timeLeft,
  onResend,
  disabled,
  label,
}: {
  timeLeft: number;
  onResend: () => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <div className="flex justify-center">
      {timeLeft > 0 ? (
        <span className="lbl text-ivory/45 tabular-nums">
          {label} · 00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
        </span>
      ) : (
        <button
          type="button"
          onClick={onResend}
          disabled={disabled}
          className="lbl text-ivory underline underline-offset-4 decoration-ivory/40 hover:decoration-ivory disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {label}
        </button>
      )}
    </div>
  );
}

/** Pastdagi rozilik matni */
export function AuthTerms({ text, link }: { text: string; link: string }) {
  return (
    <p className="mt-6 pt-5 border-t border-line text-[11px] leading-relaxed text-center text-ivory/40">
      {text}{' '}
      <span
        role="link"
        tabIndex={0}
        onClick={(e) => {
          e.preventDefault();
          window.location.replace('/terms');
        }}
        className="text-ivory/70 underline underline-offset-2 cursor-pointer hover:text-ivory"
      >
        {link}
      </span>
    </p>
  );
}

/** Foydalanish shartlari va Maxfiylik siyosatiga rozilik belgisi (ilovadagi bilan bir xil) */
export function AuthConsent({
  checked,
  onChange,
  text,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  text: {
    pre: string;
    terms: string;
    and: string;
    privacy: string;
    post: string;
    required: string;
  };
}) {
  const go = (path: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const locale = window.location.pathname.split('/')[1] || 'uz';
    window.location.assign(`/${locale}${path}`);
  };
  const link = 'text-ivory underline underline-offset-2 cursor-pointer';
  return (
    <div className="flex flex-col gap-2">
      <label className="flex items-start gap-3 cursor-pointer select-none px-1">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <span
          aria-hidden
          className={`mt-px size-[22px] shrink-0 rounded-[7px] border-[1.5px] grid place-items-center text-[13px] font-bold transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-ivory/40 ${
            checked ? 'bg-ivory border-ivory text-night' : 'border-line-2'
          }`}
        >
          {checked ? '✓' : ''}
        </span>
        <span className="text-[13px] leading-[19px] text-ivory/60">
          {text.pre}{' '}
          <span
            role="link"
            tabIndex={0}
            onClick={go('/terms')}
            className={link}
          >
            {text.terms}
          </span>{' '}
          {text.and}{' '}
          <span
            role="link"
            tabIndex={0}
            onClick={go('/privacy')}
            className={link}
          >
            {text.privacy}
          </span>{' '}
          {text.post}
        </span>
      </label>
      {!checked && (
        <p className="text-center text-[12px] text-ivory/40">{text.required}</p>
      )}
    </div>
  );
}

/** Ikki variantli tanlagich (jins) */
export function Segmented({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative grid grid-cols-2 p-1 h-12 rounded-2xl border border-line-2 bg-ivory/[0.04]">
      <span
        className="absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-xl bg-ivory transition-transform duration-300 ease-out"
        style={{
          transform: `translateX(${options.findIndex((o) => o.value === value) * 100}%)`,
        }}
      />
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            'relative z-10 lbl transition-colors cursor-pointer',
            o.value === value ? 'text-night' : 'text-ivory/60 hover:text-ivory',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
