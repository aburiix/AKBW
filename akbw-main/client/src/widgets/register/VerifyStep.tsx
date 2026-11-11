import { Button } from '@/shared/ui/button';
import { OtpInput, ResendRow } from '@/shared/ui/auth';
import { useTranslations } from 'next-intl';
import React from 'react';

interface Props {
  otp: string;
  phone: string;
  errors: Record<string, string>;
  timeLeft: number;
  handleOtpChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleVerify: () => void;
  handleResendCode: () => void;
  setSteps: (step: 'register' | 'verify') => void;
  setTimeLeft: (timeLeft: number) => void;
  isLoading: boolean;
}

export default function VerifyStep({
  otp,
  errors,
  timeLeft,
  handleOtpChange,
  handleVerify,
  handleResendCode,
  setSteps,
  setTimeLeft,
  isLoading,
}: Props) {
  const t = useTranslations('Register');
  return (
    <form
      className="mt-7 flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        handleVerify();
      }}
    >
      <OtpInput value={otp} onChange={handleOtpChange} error={!!errors.otp} />
      {errors.otp && (
        <p className="text-xs text-sale text-center">{errors.otp}</p>
      )}
      <ResendRow
        timeLeft={timeLeft}
        onResend={handleResendCode}
        disabled={isLoading}
        label={t('resend_code_btn')}
      />

      <Button type="submit" className="mt-2 w-full" disabled={isLoading}>
        {isLoading ? t('verifying') : t('verify_btn')}
      </Button>

      <Button
        type="button"
        variant="outline"
        onClick={() => {
          setSteps('register');
          setTimeLeft(60);
        }}
        className="w-full"
      >
        {t('edit_info_btn')}
      </Button>
    </form>
  );
}
