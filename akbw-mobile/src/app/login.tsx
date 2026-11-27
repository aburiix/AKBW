import { router } from 'expo-router';
import { useT } from '@/lib/i18n';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button, Chip, Label, Screen, Wordmark } from '@/components/ui';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { formatPhone, isPhoneComplete } from '@/lib/format';
import { F, useColors, useStyles, type Palette } from '@/lib/theme';

type Step = 'phone' | 'code' | 'register';

export default function Login() {
  const t = useT();
  const c = useColors();
  const s = useStyles(mk);
  const setTokens = useAuth((st) => st.setTokens);
  const [step, setStep] = useState<Step>('phone');
  const [isNew, setIsNew] = useState(false);
  const [phone, setPhone] = useState('+998');
  const [code, setCode] = useState('');
  const [verifyToken, setVerifyToken] = useState('');
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [referral, setReferral] = useState('');
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    if (timer <= 0) return;
    const t = setTimeout(() => setTimer(timer - 1), 1000);
    return () => clearTimeout(t);
  }, [timer]);

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await fn();
    } catch (e: any) {
      setError(e instanceof ApiError ? e.message : t('Xatolik yuz berdi'));
    } finally {
      setBusy(false);
    }
  };

  const sendCode = () =>
    run(async () => {
      try {
        await api.sendSms(phone, 'login');
        setIsNew(false);
      } catch (e) {
        // raqam ro'yxatda yo'q → ro'yxatdan o'tish uchun kod yuboriladi
        if (e instanceof ApiError && e.status === 404) {
          await api.sendSms(phone);
          setIsNew(true);
        } else throw e;
      }
      setCode('');
      setStep('code');
      setTimer(60);
    });

  const finish = async (token: string, refresh?: string | null) => {
    await setTokens(token, refresh ?? null);
    router.back();
  };

  const verify = () =>
    run(async () => {
      const r = await api.verifySms(phone, code);
      setVerifyToken(r.verifyToken);
      if (isNew) {
        setStep('register');
        return;
      }
      const l = await api.login(phone, r.verifyToken);
      await finish(l.token, l.refreshToken);
    });

  const register = () =>
    run(async () => {
      const r = await api.register({ phone, name: name.trim(), lastName: lastName.trim(), gender, verifyToken, referralCode: referral.trim() || undefined });
      await finish(r.token, r.refreshToken);
    });

  const inputProps = { placeholderTextColor: c.mute2, keyboardAppearance: c.scheme } as const;

  return (
    <Screen>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.wrap} keyboardShouldPersistTaps="handled">
          <Wordmark size={36} />
          <View style={{ alignItems: 'center', gap: 8 }}>
            <Label>{t('AKBW · Kabinet')}</Label>
            <Text style={s.title}>{step === 'register' ? t("Ro'yxatdan o'tish") : t('Kirish')}</Text>
          </View>

          {step === 'phone' && (
            <>
              <Text style={s.lead}>{t("Telefon raqamingizni kiriting — SMS orqali kod yuboramiz.")}</Text>
              <TextInput
                value={phone}
                onChangeText={(t) => setPhone(formatPhone(t))}
                keyboardType="phone-pad"
                textContentType="telephoneNumber"
                autoFocus
                style={s.input}
                {...inputProps}
              />
              <Consent value={agree} onChange={setAgree} />
              <Button title={t("Kod olish")} disabled={!isPhoneComplete(phone) || !agree} loading={busy} onPress={sendCode} />
              {!agree && <Text style={s.hint}>{t("Davom etish uchun shartlarga rozilik bering.")}</Text>}
            </>
          )}

          {step === 'code' && (
            <>
              <Text style={s.lead}>{t('{n} raqamiga yuborilgan kodni kiriting.', { n: phone })}</Text>
              <TextInput
                value={code}
                onChangeText={(t) => setCode(t.replace(/\D/g, '').slice(0, 6))}
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                autoComplete="sms-otp"
                autoFocus
                style={[s.input, { letterSpacing: 10, textAlign: 'center' }]}
                {...inputProps}
              />
              <Button title={t("Tasdiqlash")} disabled={code.length < 4} loading={busy} onPress={verify} />
              <Button
                title={timer > 0 ? t('Qayta yuborish ({n})', { n: timer }) : t('Kodni qayta yuborish')}
                variant="ghost"
                disabled={timer > 0 || busy}
                onPress={sendCode}
              />
              <Text style={s.link} onPress={() => setStep('phone')}>
                {t("Raqamni o'zgartirish")}
              </Text>
            </>
          )}

          {step === 'register' && (
            <>
              <Text style={s.lead}>{t("Siz yangi foydalanuvchisiz. Ismingizni kiriting.")}</Text>
              <TextInput value={name} onChangeText={setName} placeholder={t("Ism")} style={s.input} textContentType="givenName" {...inputProps} />
              <TextInput
                value={lastName}
                onChangeText={setLastName}
                placeholder={t("Familiya")}
                style={s.input}
                textContentType="familyName"
                {...inputProps}
              />
              <TextInput
                value={referral}
                onChangeText={setReferral}
                placeholder={t("Taklif kodi (ixtiyoriy)")}
                autoCapitalize="none"
                autoCorrect={false}
                style={s.input}
                {...inputProps}
              />
              <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'center' }}>
                <Chip label={t("Erkak")} active={gender === 'male'} onPress={() => setGender('male')} />
                <Chip label={t("Ayol")} active={gender === 'female'} onPress={() => setGender('female')} />
              </View>
              <Button
                title={t("Ro'yxatdan o'tish")}
                disabled={name.trim().length < 2 || lastName.trim().length < 2}
                loading={busy}
                onPress={register}
              />
            </>
          )}

          {error && <Text style={s.error}>{error}</Text>}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

/** Foydalanish shartlari va Maxfiylik siyosatiga rozilik (App Store / Google Play talabi, saytdagi bilan bir xil). */
function Consent({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  const t = useT();
  const c = useColors();
  const s = useStyles(mk);
  const open = (doc: 'terms' | 'privacy') => router.push({ pathname: '/legal', params: { doc } });
  return (
    <Pressable
      onPress={() => onChange(!value)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: value }}
      style={s.consent}>
      <View style={[s.box, value && { backgroundColor: c.ivory, borderColor: c.ivory }]}>
        {value && <Text style={{ color: c.onIvory, fontSize: 13, fontWeight: '700' }}>✓</Text>}
      </View>
      <Text style={s.consentText}>
        {t('Men AKBW')}{' '}
        <Text style={s.consentLink} onPress={() => open('terms')}>
          {t('Foydalanish shartlari')}
        </Text>{' '}
        {t('va')}{' '}
        <Text style={s.consentLink} onPress={() => open('privacy')}>
          {t('Maxfiylik siyosati')}
        </Text>{' '}
        {t('bilan tanishdim va roziman.')}
      </Text>
    </Pressable>
  );
}

const mk = (c: Palette) =>
  StyleSheet.create({
    wrap: { padding: 24, paddingTop: 36, gap: 18, alignItems: 'stretch' },
    title: { fontFamily: F.serif, fontSize: 32, color: c.text },
    lead: { fontSize: 15, color: c.mute, lineHeight: 22, textAlign: 'center' },
    input: {
      height: 56,
      borderRadius: 999,
      backgroundColor: c.s1,
      borderWidth: 1,
      borderColor: c.line2,
      paddingHorizontal: 22,
      fontSize: 18,
      color: c.text,
    },
    link: { textAlign: 'center', color: c.mute, fontSize: 14, paddingVertical: 6 },
    error: { color: c.sale, textAlign: 'center', fontSize: 14 },
    hint: { color: c.mute2, textAlign: 'center', fontSize: 12 },
    consent: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', paddingHorizontal: 4 },
    box: { width: 22, height: 22, borderRadius: 7, borderWidth: 1.5, borderColor: c.line2, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
    consentText: { flex: 1, fontSize: 13, lineHeight: 19, color: c.mute },
    consentLink: { color: c.text, textDecorationLine: 'underline' },
  });
