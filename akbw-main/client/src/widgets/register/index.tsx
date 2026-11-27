'use client';

import { sendSms, verifySms } from '@/shared/config/api/sms/sms.request';
import { register } from '@/shared/config/api/auth/auth.request';
import { Button } from '@/shared/ui/button';
import VerifyStep from './VerifyStep';
import { toast } from '@/shared/ui/toast';
import RegisterStep from './RegisterStep';
import { useTranslations } from 'next-intl';
import UseAuth from '@/shared/hooks/use-auth';
import { useMutation } from '@tanstack/react-query';
import { useUserStore } from '@/shared/store/user.store';
import { onError } from '@/shared/config/api/isAxiosError';
import {
  Modal,
  ModalClose,
  ModalContent,
  ModalDescription,
  ModalTitle,
  ModalTrigger,
} from '@/shared/ui/modal';
import { X } from 'lucide-react';
import React from 'react';
import * as z from 'zod';
import { AuthConsent, AuthHeader } from '@/shared/ui/auth';

const registerSchema = z.object({
  name: z.string().min(2, 'name_invalid'),
  lastName: z.string().min(2, 'lastname_invalid'),
  gender: z.string().min(2, 'gender_invalid'),
  phone: z
    .string()
    .min(12, 'phone_invalid')
    .regex(/^\+998 \d{2} \d{3} \d{2} \d{2}$/, 'phone_invalid'),
});

type Steps = 'register' | 'verify';

interface RegisterProps {
  trigger?: React.ReactNode;
}

function Register({ trigger }: RegisterProps) {
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [steps, setSteps] = React.useState<Steps>('register');
  const [referralCode, setReferralCode] = React.useState('');
  const [timeLeft, setTimeLeft] = React.useState(60);
  const [lastName, setLastName] = React.useState('');
  const [gender, setGender] = React.useState('male');
  const [phone, setPhone] = React.useState('+998');
  const [name, setName] = React.useState('');
  const [otp, setOtp] = React.useState('');
  const [agree, setAgree] = React.useState(false);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get('ref');
      if (ref) {
        setReferralCode(ref);
      }
    }
  }, []);

  const { setToken } = useUserStore();

  const { handlePhoneChange, handleOtpChange } = UseAuth(
    phone,
    setPhone,
    setOtp,
  );

  const t = useTranslations('Register');

  const registerMutation = useMutation({
    mutationKey: ['register'],
    mutationFn: (data: {
      name: string;
      lastName: string;
      phone: string;
      gender: string;
      verifyToken: string;
    }) => register({ ...data, referralCode }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onSuccess: (data: any) => {
      if (data.data.ok) {
        toast.success(t('register_success'));
        setToken(data.data.token, data.data.refreshToken);

        // Show bonus information if applicable
        if (data.data.data?.hasReferralBonus) {
          toast.success(
            t('referral_bonus_applied', {
              fallback: '🎉 10% referral bonus applied!',
            }),
          );
        }
        if (data.data.data?.welcomeBonus) {
          toast.success(
            t('welcome_bonus_applied', {
              fallback: '🎁 5% welcome bonus applied!',
            }),
          );
        }
      }

      setOtp('');
      setName('');
      setLastName('');
      setGender('male');
      setPhone('+998');
      setReferralCode('');
      setErrors({});
    },
    onError: (err) => onError(err, t('error')),
  });

  const sendSmsMutation = useMutation({
    mutationKey: ['send-sms'],
    mutationFn: sendSms,
    onSuccess: () => {
      if (steps !== 'verify') {
        setSteps('verify');
      }
      setTimeLeft(60);
      setErrors({});
    },
    onError: (err) => onError(err, t('error')),
  });

  const verifySmsMutation = useMutation({
    mutationKey: ['verify-sms'],
    mutationFn: ({ phone, code }: { phone: string; code: string }) =>
      verifySms(phone, code),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onSuccess: async (res: any) => {
      setSteps('register');
      setTimeLeft(60);
      setErrors({});

      await registerMutation.mutateAsync({
        name,
        lastName,
        phone,
        gender,
        verifyToken: res?.data?.verifyToken ?? '',
      });
    },
    onError: (err) => onError(err, t('error')),
  });

  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (steps === 'verify' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [steps, timeLeft]);

  const handleSendVerification = async () => {
    const result = registerSchema.safeParse({ name, lastName, gender, phone });
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.issues.forEach((issue: z.ZodIssue) => {
        newErrors[issue.path[0] as string] = t(issue.message);
      });
      setErrors(newErrors);
      return;
    }
    await sendSmsMutation.mutateAsync({ phone: phone });
  };

  const handleVerify = async () => {
    if (otp.length < 5) {
      setErrors({ otp: t('otp_invalid') });
      return;
    }
    setErrors({});

    await verifySmsMutation.mutateAsync({ phone, code: otp });
  };

  const handleResendCode = async () => {
    setTimeLeft(60);
    setOtp('');

    await sendSmsMutation.mutateAsync({ phone });
  };

  const renderRegisterSteps = () => {
    switch (steps) {
      case 'register':
        return (
          <RegisterStep
            name={name}
            setName={setName}
            setLastName={setLastName}
            lastName={lastName}
            gender={gender}
            setGender={setGender}
            phone={phone}
            errors={errors}
            handleRegister={handleSendVerification}
            handlePhoneChange={handlePhoneChange}
            isLoading={sendSmsMutation.isPending}
            agree={agree}
            consent={
              <AuthConsent
                checked={agree}
                onChange={setAgree}
                text={{
                  pre: t('consent_pre'),
                  terms: t('consent_terms'),
                  and: t('consent_and'),
                  privacy: t('consent_privacy'),
                  post: t('consent_post'),
                  required: t('consent_required'),
                }}
              />
            }
          />
        );

      case 'verify':
        return (
          <VerifyStep
            otp={otp}
            setSteps={setSteps}
            phone={phone}
            errors={errors}
            timeLeft={timeLeft}
            handleOtpChange={handleOtpChange}
            handleVerify={handleVerify}
            handleResendCode={handleResendCode}
            setTimeLeft={setTimeLeft}
            isLoading={
              verifySmsMutation.isPending || registerMutation.isPending
            }
          />
        );
    }
  };

  return (
    <Modal modalId="register-modal">
      <ModalTrigger asChild>
        {trigger ? (
          <div>{trigger}</div>
        ) : (
          <Button variant="outline">{t('register_btn')}</Button>
        )}
      </ModalTrigger>
      <ModalContent className="max-w-[480px]">
        <ModalClose>
          <X />
        </ModalClose>

        <ModalTitle className="sr-only">
          {steps === 'register' ? t('register_title') : t('verify_title')}
        </ModalTitle>
        <AuthHeader
          step={steps === 'register' ? 1 : 2}
          title={steps === 'register' ? t('register_title') : t('verify_title')}
          subtitle={
            steps === 'verify' ? (
              t('otp_sent_text', { phone })
            ) : referralCode ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-star/30 bg-star/10 px-3 py-1 lbl !tracking-[0.16em] text-star">
                Referral · {referralCode}
              </span>
            ) : (
              <span className="lbl !tracking-[0.24em] text-ivory/40">
                AKBW Club
              </span>
            )
          }
        />

        {renderRegisterSteps()}

        <ModalDescription asChild>
          <div>
            <p className="sr-only">{t('continue_terms_text')}</p>
          </div>
        </ModalDescription>
      </ModalContent>
    </Modal>
  );
}

export default Register;
