import { router, Stack, useLocalSearchParams } from 'expo-router';
import { toNewLatin, useLang, useT } from '@/lib/i18n';
import { PickerField } from '@/components/Picker';
import { REGION_NAMES, UZ_REGIONS } from '@/lib/uzRegions';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button, Chip, Screen } from '@/components/ui';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { formatPhone, isPhoneComplete } from '@/lib/format';
import { label, useColors, useStyles, type Palette } from '@/lib/theme';

type Step = 'form' | 'code';

/**
 * Kirish va ro'yxatdan o'tish — alohida:
 *  Kirish: faqat telefon → SMS kod.
 *  Ro'yxatdan o'tish: ism, familiya, jins, taklif kodi va telefon → SMS kod → akkaunt yaratiladi.
 */
export default function Login() {
  const t = useT();
  const c = useColors();
  const s = useStyles(mk);
  const setTokens = useAuth((st) => st.setTokens);
  // ?mode=register — profildagi "Ro'yxatdan o'tish" tugmasidan; ekran ichida ham almashtirsa bo'ladi
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const [reg, setReg] = useState(mode === 'register');
  const [step, setStep] = useState<Step>('form');
  // Ro'yxatdan o'tishda raqam allaqachon bor bo'lsa — kod bilan oddiy kiriladi
  const [existing, setExisting] = useState(false);
  const [phone, setPhone] = useState('+998');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [referral, setReferral] = useState('');
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [region, setRegion] = useState('');
  const [district, setDistrict] = useState('');
  const [email, setEmail] = useState('');
  const lang = useLang((st) => st.lang);
  const show = (v: string) => (lang === 'uz' ? toNewLatin(v) : v);
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    if (timer <= 0) return;
    const t = setTimeout(() => setTimer(timer - 1), 1000);
    return () => clearTimeout(t);
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
    } catch (e: any) {
      setError(e instanceof ApiError ? e.message : t('Xatolik yuz berdi'));
    } finally {
      setBusy(false);
    }
  };

  const sendCode = () =>
    run(async () => {
      setNote(null);
      if (reg) {
        const r = await api.sendSms(phone);
        const already = !!r.isRegistered;
        setExisting(already);
        if (already) setNote(t("Bu raqam allaqachon ro'yxatdan o'tgan — kod bilan kirasiz."));
      } else {
        try {
          await api.sendSms(phone, 'login');
          setExisting(true);
        } catch (e) {
          // raqam bazada yo'q → qizil ogohlantirish (ro'yxatdan o'tish havolasi pastda)
          if (e instanceof ApiError && e.status === 404) {
            setError(t("Raqamingiz tizimda mavjud emas, iltimos avval ro'yxatdan o'ting."));
            return;
          }
          throw e;
        }
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
      if (reg && !existing) {
        const u = await api.register({
          phone,
          name: name.trim(),
          lastName: lastName.trim(),
          gender,
          birthDate: birthDate!,
          region,
          district,
          email: email.trim() || undefined,
          verifyToken: r.verifyToken,
          referralCode: referral.trim() || undefined,
        });
        return finish(u.token, u.refreshToken);
      }
      const l = await api.login(phone, r.verifyToken);
      await finish(l.token, l.refreshToken);
    });

  const inputProps = { placeholderTextColor: c.mute2, keyboardAppearance: c.scheme } as const;
  // Tug'ilgan sana: haqiqiy sana va 1920-yildan bugungacha bo'lishi kerak
  const birthDate = (() => {
    const d = Number(day), m = Number(month), y = Number(year);
    if (!d || !m || year.length !== 4) return null;
    const dt = new Date(Date.UTC(y, m - 1, d));
    if (dt.getUTCDate() !== d || dt.getUTCMonth() !== m - 1 || y < 1920 || dt > new Date()) return null;
    return dt.toISOString().slice(0, 10);
  })();
  const emailOk = !email.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const formOk =
    isPhoneComplete(phone) &&
    agree &&
    (!reg ||
      (name.trim().length >= 2 && lastName.trim().length >= 2 && !!birthDate && !!region && !!district && emailOk));

  return (
    <Screen>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.wrap} keyboardShouldPersistTaps="handled">
          <Stack.Screen options={{ title: '' }} />
          <View style={{ alignItems: 'center', gap: 14, marginBottom: 4 }}>
            <Text style={s.heading}>{reg ? t("RO'YXATDAN O'TISH") : t('KABINETGA KIRISH')}</Text>
            <Text style={s.lead}>
              {reg
                ? t("AKBW platformasida shaxsiy kabinet yaratish uchun iltimos barcha ma'lumotlaringizni kiriting.")
                : t('AKBW kabinetingizga kirish uchun iltimos raqamingizni yozing, biz sizga tasdiqlash kodini yuboramiz.')}
            </Text>
          </View>

          {step === 'form' && (
            <>
              {!!note && <Text style={s.note}>{note}</Text>}
              {reg && (
                <>
                  <TextInput value={name} onChangeText={setName} placeholder={t("Ism")} style={s.input} textContentType="givenName" {...inputProps} />
                  <TextInput
                    value={lastName}
                    onChangeText={setLastName}
                    placeholder={t("Familiya")}
                    style={s.input}
                    textContentType="familyName"
                    {...inputProps}
                  />
                  <Text style={s.fieldLabel}>{t("Tug'ilgan sana")}</Text>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TextInput value={day} onChangeText={(v) => setDay(v.replace(/\D/g, '').slice(0, 2))} placeholder={t('Kun')} keyboardType="number-pad" style={[s.input, s.dateInput]} {...inputProps} />
                    <TextInput value={month} onChangeText={(v) => setMonth(v.replace(/\D/g, '').slice(0, 2))} placeholder={t('Oy')} keyboardType="number-pad" style={[s.input, s.dateInput]} {...inputProps} />
                    <TextInput value={year} onChangeText={(v) => setYear(v.replace(/\D/g, '').slice(0, 4))} placeholder={t('Yil')} keyboardType="number-pad" style={[s.input, s.dateInput, { flex: 1.4 }]} {...inputProps} />
                  </View>
                  {day.length > 0 && month.length > 0 && year.length === 4 && !birthDate && (
                    <Text style={s.error}>{t("Sana noto'g'ri")}</Text>
                  )}
                  <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'center' }}>
                    <Chip label={t("Erkak")} active={gender === 'male'} onPress={() => setGender('male')} />
                    <Chip label={t("Ayol")} active={gender === 'female'} onPress={() => setGender('female')} />
                  </View>
                </>
              )}
              <TextInput
                value={phone}
                onChangeText={(v) => setPhone(formatPhone(v))}
                keyboardType="phone-pad"
                textContentType="telephoneNumber"
                autoFocus={!reg}
                style={s.input}
                {...inputProps}
              />
              {reg && (
                <>
                  <PickerField
                    label={t('Viloyat')}
                    value={region ? show(region) : undefined}
                    items={REGION_NAMES.map((r) => ({ code: r, name: show(r) }))}
                    onSelect={(v) => {
                      setRegion(v);
                      setDistrict('');
                    }}
                  />
                  <PickerField
                    label={t('Tuman / shahar')}
                    value={district ? show(district) : undefined}
                    items={(UZ_REGIONS[region] ?? []).map((d) => ({ code: d, name: show(d) }))}
                    disabled={!region}
                    onSelect={setDistrict}
                  />
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder={t('Email (ixtiyoriy)')}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    textContentType="emailAddress"
                    style={s.input}
                    {...inputProps}
                  />
                  {!emailOk && <Text style={s.error}>{t("Email noto'g'ri")}</Text>}
                </>
              )}
              {reg && (
                <TextInput
                  value={referral}
                  onChangeText={setReferral}
                  placeholder={t("Taklif kodi (ixtiyoriy)")}
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={s.input}
                  {...inputProps}
                />
              )}
              <Consent value={agree} onChange={setAgree} />
              <Button title={t("Kod olish")} disabled={!formOk} loading={busy} onPress={sendCode} />
              {!!error && <Text style={s.error}>{error}</Text>}
              <View style={s.switchRow}>
                <Text style={s.switchText}>{reg ? t('Akkauntingiz bormi?') : t("Akkauntingiz yo'qmi?")}</Text>
                <Text style={s.switchLink} onPress={() => switchMode(!reg)}>
                  {reg ? t('Kirish') : t("Ro'yxatdan o'tish")}
                </Text>
              </View>
            </>
          )}

          {step === 'code' && (
            <>
              <Text style={s.lead}>{t('{n} raqamiga yuborilgan kodni kiriting.', { n: phone })}</Text>
              {!!note && <Text style={s.note}>{note}</Text>}
              <TextInput
                value={code}
                onChangeText={(v) => setCode(v.replace(/\D/g, '').slice(0, 6))}
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                autoComplete="sms-otp"
                autoFocus
                style={[s.input, { letterSpacing: 10, textAlign: 'center' }]}
                {...inputProps}
              />
              <Button
                title={reg && !existing ? t("Ro'yxatdan o'tish") : t("Tasdiqlash")}
                disabled={code.length < 4}
                loading={busy}
                onPress={verify}
              />
              <Button
                title={timer > 0 ? t('Qayta yuborish ({n})', { n: timer }) : t('Kodni qayta yuborish')}
                variant="ghost"
                disabled={timer > 0 || busy}
                onPress={sendCode}
              />
              <Text style={s.link} onPress={() => setStep('form')}>
                {reg ? t("Ma'lumotlarni o'zgartirish") : t("Raqamni o'zgartirish")}
              </Text>
            </>
          )}

          {step === 'code' && !!error && <Text style={s.error}>{error}</Text>}
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
    heading: { ...label(20), color: c.text, textAlign: 'center' },
    fieldLabel: { ...label(10), color: c.mute, marginBottom: -8, marginLeft: 8 },
    dateInput: { flex: 1, textAlign: 'center', paddingHorizontal: 8 },
    lead: { fontSize: 13, color: c.mute, lineHeight: 19, textAlign: 'center', paddingHorizontal: 12 },
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
    note: { color: c.star, textAlign: 'center', fontSize: 13, lineHeight: 19 },
    switchRow: { flexDirection: 'row', justifyContent: 'center', gap: 6 },
    switchText: { color: c.mute, fontSize: 14 },
    switchLink: { color: c.text, fontSize: 14, fontWeight: '600', textDecorationLine: 'underline' },
    consent: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', paddingHorizontal: 4 },
    box: { width: 22, height: 22, borderRadius: 7, borderWidth: 1.5, borderColor: c.line2, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
    consentText: { flex: 1, fontSize: 13, lineHeight: 19, color: c.mute },
    consentLink: { color: c.text, textDecorationLine: 'underline' },
  });
