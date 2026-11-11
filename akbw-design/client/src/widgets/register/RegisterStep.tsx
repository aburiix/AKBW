import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Field, Segmented, fieldError } from '@/shared/ui/auth';
import { useTranslations } from 'next-intl';
import React from 'react';

interface Props {
  name: string;
  lastName: string;
  gender: string;
  phone: string;
  errors: Record<string, string>;
  handleRegister: () => void;
  handlePhoneChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setName: (name: string) => void;
  setLastName: (lastName: string) => void;
  setGender: (gender: string) => void;
  isLoading: boolean;
}

export default function RegisterStep({
  name,
  lastName,
  gender,
  phone,
  errors,
  handleRegister,
  handlePhoneChange,
  setName,
  setLastName,
  setGender,
  isLoading,
}: Props) {
  const t = useTranslations('Register');
  return (
    <form
      className="mt-7 flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        handleRegister();
      }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label={t('name_label')} error={errors.name}>
          <Input
            autoComplete="given-name"
            placeholder={t('name_placeholder')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={fieldError(errors.name)}
          />
        </Field>
        <Field label={t('lastname_label')} error={errors.lastName}>
          <Input
            autoComplete="family-name"
            placeholder={t('lastname_placeholder')}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className={fieldError(errors.lastName)}
          />
        </Field>
      </div>

      <Field label={t('gender_label')} error={errors.gender}>
        <Segmented
          value={gender}
          onChange={setGender}
          options={[
            { value: 'male', label: t('gender_male') },
            { value: 'female', label: t('gender_female') },
          ]}
        />
      </Field>

      <Field label={t('phone_label')} error={errors.phone}>
        <Input
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder={t('phone_placeholder')}
          value={phone}
          onChange={handlePhoneChange}
          className={cn(
            'h-14 text-[17px] tracking-[0.04em]',
            fieldError(errors.phone),
          )}
        />
      </Field>

      <Button type="submit" className="mt-2 w-full" disabled={isLoading}>
        {isLoading ? t('sending') : t('send_code_btn')}
      </Button>
    </form>
  );
}
