import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import {
  Modal,
  ModalClose,
  ModalContent,
  ModalDescription,
  ModalTitle,
  ModalTrigger,
} from '@/shared/ui/modal';
import { cn } from '@/shared/lib/utils';
import {
  AuthHeader,
  AuthConsent,
  Field,
  OtpInput,
  ResendRow,
  fieldError,
} from '@/shared/ui/auth';
import { sendSms, verifySms } from '@/shared/config/api/sms/sms.request';
import { login } from '@/shared/config/api/auth/auth.request';
import { useUserStore } from '@/shared/store/user.store';
import UseAuth from '@/shared/hooks/use-auth';
import { X } from 'lucide-react';
import React from 'react';
import * as z from 'zod';
import { toast } from '@/shared/ui/toast';
import { useMutation } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useCoordinatedModal } from '@/shared/hooks/use-coordinated-modal';

const registerSchema = z.object({
  phone: z
    .string()
    .min(12, 'phone_invalid')
    .regex(/^\+998 \d{2} \d{3} \d{2} \d{2}$/, 'phone_invalid'),
});

type Steps = 'register' | 'verify';

interface LoginProps {
  trigger?: React.ReactNode;
  className?: string;
}

function Login({ trigger, className }: LoginProps) {
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [steps, setSteps] = React.useState<Steps>('register');
  const [timeLeft, setTimeLeft] = React.useState(60);
  const [phone, setPhone] = React.useState('+998');
  const [otp, setOtp] = React.useState('');
  const [agree, setAgree] = React.useState(false);

  const { openModal, closeModal: _closeModal } =
    useCoordinatedModal('login-modal');

  const { handlePhoneChange, handleOtpChange } = UseAuth(
    phone,
    setPhone,
    setOtp,
  );

  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (steps === 'verify' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [steps, timeLeft]);

  const { setToken } = useUserStore();

  const loginMutation = useMutation({
    mutationKey: ['login'],
    mutationFn: login,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onSuccess: (data: any) => {
      if (data?.data.ok) {
        setToken(data.data.token, data.data.refreshToken);
        window.location.reload();
      }
    },
    onError: (error: any) => {
      if (error?.response?.status === 404) {
        toast.error(t('user_not_found'), {
          description: t('please_register'),
        });
      } else {
        toast.error(t('login_error'));
      }
    },
  });

  const sendSmsMutation = useMutation({
    mutationKey: ['send-sms'],
    mutationFn: sendSms,
    onSuccess: (data: any) => {
      if (!data?.data?.isRegistered) {
        toast.error(t('user_not_found'), {
          description: t('please_register'),
        });

        setErrors({ isRegistered: t('not_registered_error') });

        return;
      }
      setSteps('verify');
      setTimeLeft(60);
      setErrors({});
    },
    onError: (_error: any) => {
      setErrors({ isRegistered: t('not_registered_error') });
      toast.error(t('user_not_found'), {
        description: t('please_register'),
      });
      return;
    },
  });

  const verifySmsMutation = useMutation({
    mutationKey: ['verify-sms'],
    mutationFn: ({ phone, code }: { phone: string; code: string }) =>
      verifySms(phone, code),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onSuccess: async (res: any) => {
      setErrors({});
      await loginMutation.mutateAsync({
        phone,
        verifyToken: res?.data?.verifyToken ?? '',
      });
    },
    onError: () => {
      toast.error(t('login_error'));
    },
  });

  const handleRegister = async () => {
    const result = registerSchema.safeParse({ phone });

    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.issues.forEach((issue: z.ZodIssue) => {
        newErrors[issue.path[0] as string] = t(issue.message);
      });
      setErrors(newErrors);
      return;
    }

    await sendSmsMutation.mutateAsync({ phone, type: 'login' });
  };

  const handleVerify = async () => {
    if (otp.length < 5) {
      setErrors({ otp: t('otp_length_error') });
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

  const t = useTranslations('Login');

  const renderRegisterSteps = () => {
    switch (steps) {
      case 'register':
        return (
          <form
            className="mt-7 flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              handleRegister();
            }}
          >
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
            {errors.isRegistered && (
              <div className="rounded-2xl border border-sale/30 bg-sale/10 px-4 py-3 text-[12.5px] leading-relaxed text-sale">
                {errors.isRegistered}
              </div>
            )}

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

            <Button
              type="submit"
              className="mt-2 w-full"
              disabled={sendSmsMutation.isPending || !agree}
            >
              {sendSmsMutation.isPending ? t('sending') : t('send_code_btn')}
            </Button>

            <div className="flex items-center gap-3 my-1" aria-hidden>
              <span className="h-px flex-1 bg-line" />
              <span className="lbl text-ivory/30">AKBW</span>
              <span className="h-px flex-1 bg-line" />
            </div>

            <p className="text-center text-[13px] text-ivory/55">
              {t('not_registered_text')}{' '}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  openModal('register-modal');
                }}
                className="text-ivory underline underline-offset-4 decoration-ivory/40 hover:decoration-ivory cursor-pointer"
              >
                {t('register_link')}
              </button>
            </p>
          </form>
        );

      case 'verify':
        return (
          <form
            className="mt-7 flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              handleVerify();
            }}
          >
            <OtpInput
              value={otp}
              onChange={handleOtpChange}
              error={!!errors.otp}
            />
            {errors.otp && (
              <p className="text-xs text-sale text-center">{errors.otp}</p>
            )}
            <ResendRow
              timeLeft={timeLeft}
              onResend={handleResendCode}
              disabled={verifySmsMutation.isPending || loginMutation.isPending}
              label={t('resend_code_btn')}
            />

            <Button
              type="submit"
              className="mt-2 w-full"
              disabled={verifySmsMutation.isPending || loginMutation.isPending}
            >
              {verifySmsMutation.isPending || loginMutation.isPending
                ? t('verifying')
                : t('verify_btn')}
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
              {t('change_phone_btn')}
            </Button>
          </form>
        );
    }
  };

  return (
    <Modal modalId="login-modal">
      <ModalTrigger asChild>
        {trigger || <Button>{t('login_title')}</Button>}
      </ModalTrigger>
      <ModalContent className={cn('max-w-[440px]', className)}>
        <ModalClose>
          <X />
        </ModalClose>

        <ModalTitle className="sr-only">
          {steps === 'register' ? t('login_title') : t('verify_title')}
        </ModalTitle>
        <AuthHeader
          step={steps === 'register' ? 1 : 2}
          title={steps === 'register' ? t('login_title') : t('verify_title')}
          subtitle={
            steps === 'verify' ? (
              t('otp_sent_text', { phone })
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

export default Login;
