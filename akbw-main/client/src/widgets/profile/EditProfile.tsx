'use client';

import React, { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowLeft } from 'lucide-react';
import { useUser, useUpdateUser } from '@/features/user/lib/hooks';
import { toast } from '@/shared/ui/toast';
import { cn } from '@/shared/lib/utils';
import { Chip, PickerField } from '@/widgets/auth-sheet';
import {
  REGION_NAMES,
  UZ_REGIONS,
  toNewLatinName,
} from '@/shared/constants/uzRegions';

/**
 * Profilni tahrirlash — ilovadagi ekran bilan bir xil: ro'yxatdan o'tishdagi barcha maydonlar
 * (ism, familiya, jins, tug'ilgan sana, viloyat, tuman, email). Telefon faqat ko'rsatiladi.
 */
const LBL = 'lbl text-ivory/40';
const input =
  'w-full h-[54px] rounded-full bg-surface border border-line-2 px-[22px] text-[16px] text-ivory placeholder:text-ivory/40 outline-none focus:border-ivory/40';

export default function EditProfile({
  handleBackMenu,
  profileImage,
}: {
  handleBackMenu: () => void;
  profileImage?: string;
}) {
  const t = useTranslations('Auth');
  const tp = useTranslations('Profile');
  const locale = useLocale();
  const show = (v: string) => (locale === 'uz' ? toNewLatinName(v) : v);
  const { data } = useUser();
  const update = useUpdateUser();

  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState('male');
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [region, setRegion] = useState('');
  const [district, setDistrict] = useState('');
  const [email, setEmail] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const u = data?.data;
    if (!u || loaded) return;
    setName(u.name ?? '');
    setLastName(u.lastName ?? '');
    setGender(u.gender || 'male');
    if (u.birthDate) {
      const d = new Date(u.birthDate);
      setDay(String(d.getUTCDate()));
      setMonth(String(d.getUTCMonth() + 1));
      setYear(String(d.getUTCFullYear()));
    }
    setRegion(u.region ?? '');
    setDistrict(u.district ?? '');
    setEmail(u.email ?? '');
    setLoaded(true);
  }, [data, loaded]);

  const dateEmpty = !day && !month && !year;
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
  const canSave =
    name.trim().length >= 2 &&
    lastName.trim().length >= 2 &&
    (dateEmpty || !!birthDate) &&
    emailOk;

  const save = async () => {
    try {
      await update.mutateAsync({
        name: name.trim(),
        lastName: lastName.trim(),
        gender,
        email: email.trim(),
        ...(birthDate ? { birthDate } : {}),
        ...(region ? { region } : {}),
        ...(district ? { district } : {}),
        ...(profileImage !== undefined
          ? { profile_picture: profileImage }
          : {}),
      });
      toast.success(tp('messages.save_success'));
      handleBackMenu();
    } catch {
      /* xato xabari useUpdateUser ichida */
    }
  };

  const digits = (v: string, n: number) => v.replace(/\D/g, '').slice(0, n);

  return (
    <div className="flex flex-col gap-[18px] pb-4">
      <button
        onClick={handleBackMenu}
        className="flex items-center gap-2 text-ivory/60 hover:text-ivory text-[14px] w-fit"
      >
        <ArrowLeft size={18} />
        {tp('back_to_menu')}
      </button>

      <label className="flex flex-col gap-2.5">
        <span className={LBL}>{t('name')}</span>
        <input
          className={input}
          autoComplete="given-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </label>
      <label className="flex flex-col gap-2.5">
        <span className={LBL}>{t('last_name')}</span>
        <input
          className={input}
          autoComplete="family-name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
      </label>
      <div className="flex flex-col gap-2.5">
        <span className={LBL}>{tp('gender_label')}</span>
        <div className="flex gap-2">
          <Chip on={gender === 'male'} onClick={() => setGender('male')}>
            {t('male')}
          </Chip>
          <Chip on={gender === 'female'} onClick={() => setGender('female')}>
            {t('female')}
          </Chip>
        </div>
      </div>
      <div className="flex flex-col gap-2.5">
        <span className={LBL}>{t('birth')}</span>
        <div className="flex gap-2">
          <input
            inputMode="numeric"
            placeholder={t('day')}
            value={day}
            onChange={(e) => setDay(digits(e.target.value, 2))}
            className={cn(input, 'flex-1 min-w-0 text-center px-2')}
          />
          <input
            inputMode="numeric"
            placeholder={t('month')}
            value={month}
            onChange={(e) => setMonth(digits(e.target.value, 2))}
            className={cn(input, 'flex-1 min-w-0 text-center px-2')}
          />
          <input
            inputMode="numeric"
            placeholder={t('year')}
            value={year}
            onChange={(e) => setYear(digits(e.target.value, 4))}
            className={cn(input, 'flex-[1.4] min-w-0 text-center px-2')}
          />
        </div>
        {!dateEmpty && !birthDate && day && month && year.length === 4 && (
          <p className="text-sale text-[13px] ml-2">{t('bad_date')}</p>
        )}
      </div>
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
      <label className="flex flex-col gap-2.5">
        <span className={LBL}>{t('email')}</span>
        <input
          className={input}
          type="email"
          autoComplete="email"
          autoCapitalize="none"
          placeholder="name@gmail.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {!emailOk && (
          <p className="text-sale text-[13px] ml-2">{t('bad_email')}</p>
        )}
      </label>
      <label className="flex flex-col gap-2.5">
        <span className={LBL}>{tp('phone_label')}</span>
        <input
          className={cn(input, 'text-ivory/60')}
          value={data?.data?.phone ?? ''}
          readOnly
        />
      </label>
      <button
        type="button"
        disabled={!canSave || update.isPending}
        onClick={save}
        className="lbl !text-[11.5px] h-[50px] w-full rounded-full bg-ivory text-night mt-2 disabled:opacity-40"
      >
        {update.isPending ? '…' : tp('save_btn')}
      </button>
    </div>
  );
}
