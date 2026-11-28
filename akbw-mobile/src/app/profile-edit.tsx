import { notifyError } from '@/lib/notify';
import { Image } from 'expo-image';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button, Center, Chip, Label, Screen } from '@/components/ui';
import { api, httpsUrl } from '@/lib/api';
import { toNewLatin, useLang, useT } from '@/lib/i18n';
import { PickerField } from '@/components/Picker';
import { REGION_NAMES, UZ_REGIONS } from '@/lib/uzRegions';
import { F, label, useColors, useStyles, type Palette } from '@/lib/theme';

export default function ProfileEdit() {
  const t = useT();
  const c = useColors();
  const s = useStyles(mk);
  const [loaded, setLoaded] = useState(false);
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState('male');
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);
  const [avatar, setAvatar] = useState<string>(''); // serverdagi havola
  const [localPhoto, setLocalPhoto] = useState<string | null>(null); // yangi tanlangan, hali yuklanmagan
  const [removed, setRemoved] = useState(false);
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [region, setRegion] = useState('');
  const [district, setDistrict] = useState('');
  const [email, setEmail] = useState('');
  const lang = useLang((st) => st.lang);
  const show = (v: string) => (lang === 'uz' ? toNewLatin(v) : v);

  const pickPhoto = async (camera: boolean) => {
    const perm = camera ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return Alert.alert(t('Ruxsat kerak'), camera ? t('Kameraga ruxsat bering (Sozlamalar → Expo Go).') : t('Rasmlarga ruxsat bering.'));
    const opts: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.9 };
    const r = camera ? await ImagePicker.launchCameraAsync(opts) : await ImagePicker.launchImageLibraryAsync(opts);
    if (r.canceled || !r.assets?.[0]) return;
    // 600×600 kvadrat JPEG — profil rasmi uchun yetarli va tez yuklanadi
    const out = await (await ImageManipulator.manipulate(r.assets[0].uri).resize({ width: 600, height: 600 }).renderAsync()).saveAsync({
      format: SaveFormat.JPEG,
      compress: 0.85,
    });
    setLocalPhoto(out.uri);
    setRemoved(false);
  };

  const choosePhoto = () =>
    Alert.alert(t('Profil rasmi'), undefined, [
      { text: t('Suratga olish'), onPress: () => pickPhoto(true) },
      { text: t('Galereya'), onPress: () => pickPhoto(false) },
      ...((avatar || localPhoto)
        ? [{ text: t("Rasmni o'chirish"), style: 'destructive' as const, onPress: () => { setLocalPhoto(null); setRemoved(true); } }]
        : []),
      { text: t('Bekor'), style: 'cancel' as const },
    ]);

  useEffect(() => {
    api
      .me()
      .then((r) => {
        setName(r.data.name ?? '');
        setLastName(r.data.lastName ?? '');
        setGender(r.data.gender || 'male');
        setPhone(r.data.phone ?? '');
        setAvatar(r.data.profile_picture ?? '');
        if (r.data.birthDate) {
          const d = new Date(r.data.birthDate);
          setDay(String(d.getUTCDate()));
          setMonth(String(d.getUTCMonth() + 1));
          setYear(String(d.getUTCFullYear()));
        }
        setRegion(r.data.region ?? '');
        setDistrict(r.data.district ?? '');
        setEmail(r.data.email ?? '');
      })
      .catch(notifyError)
      .finally(() => setLoaded(true));
  }, []);

  // Tug'ilgan sana: bo'sh qoldirilsa yuborilmaydi; to'ldirilsa haqiqiy sana bo'lishi kerak
  const dateEmpty = !day && !month && !year;
  const birthDate = (() => {
    const d = Number(day), m = Number(month), y = Number(year);
    if (!d || !m || year.length !== 4) return '';
    const dt = new Date(Date.UTC(y, m - 1, d));
    if (dt.getUTCDate() !== d || dt.getUTCMonth() !== m - 1 || y < 1920 || dt > new Date()) return '';
    return dt.toISOString().slice(0, 10);
  })();
  const emailOk = !email.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const canSave = name.trim().length >= 2 && lastName.trim().length >= 2 && (dateEmpty || !!birthDate) && emailOk;

  const save = async () => {
    setBusy(true);
    try {
      let profile_picture: string | undefined;
      if (localPhoto) profile_picture = (await api.uploadImage(localPhoto)).url;
      else if (removed) profile_picture = '';
      await api.updateMe({
        name: name.trim(),
        lastName: lastName.trim(),
        gender,
        email: email.trim(),
        ...(birthDate ? { birthDate } : {}),
        ...(region ? { region } : {}),
        ...(district ? { district } : {}),
        ...(profile_picture !== undefined ? { profile_picture } : {}),
      });
      router.back();
    } catch (e: any) {
      Alert.alert(t('Xatolik yuz berdi'), e.message);
    } finally {
      setBusy(false);
    }
  };

  if (!loaded)
    return (
      <Screen>
        <Center>
          <ActivityIndicator color={c.text} />
        </Center>
      </Screen>
    );

  const inputProps = { placeholderTextColor: c.mute2, keyboardAppearance: c.scheme } as const;

  return (
    <Screen>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: 16, gap: 18, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          <Pressable onPress={choosePhoto} style={s.avatarWrap} accessibilityLabel={t('Profil rasmi')}>
            <View style={s.avatar}>
              {localPhoto || (avatar && !removed) ? (
                <Image source={localPhoto ?? httpsUrl(avatar)} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
              ) : (
                <Text style={s.avatarLetter}>{(name[0] ?? 'A').toUpperCase()}</Text>
              )}
            </View>
            <Text style={[label(10), { color: c.text }]}>{avatar || localPhoto ? t("Rasmni o'zgartirish") : t("Rasm qo'yish")}</Text>
          </Pressable>

          <View style={s.field}>
            <Label>{t('Ism')}</Label>
            <TextInput value={name} onChangeText={setName} style={s.input} textContentType="givenName" {...inputProps} />
          </View>
          <View style={s.field}>
            <Label>{t('Familiya')}</Label>
            <TextInput value={lastName} onChangeText={setLastName} style={s.input} textContentType="familyName" {...inputProps} />
          </View>
          <View style={s.field}>
            <Label>{t('Jins')}</Label>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Chip label={t('Erkak')} active={gender === 'male'} onPress={() => setGender('male')} />
              <Chip label={t('Ayol')} active={gender === 'female'} onPress={() => setGender('female')} />
            </View>
          </View>
          <View style={s.field}>
            <Label>{t("Tug'ilgan sana")}</Label>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TextInput value={day} onChangeText={(v) => setDay(v.replace(/\D/g, '').slice(0, 2))} placeholder={t('Kun')} keyboardType="number-pad" style={[s.input, s.dateInput]} {...inputProps} />
              <TextInput value={month} onChangeText={(v) => setMonth(v.replace(/\D/g, '').slice(0, 2))} placeholder={t('Oy')} keyboardType="number-pad" style={[s.input, s.dateInput]} {...inputProps} />
              <TextInput value={year} onChangeText={(v) => setYear(v.replace(/\D/g, '').slice(0, 4))} placeholder={t('Yil')} keyboardType="number-pad" style={[s.input, s.dateInput, { flex: 1.4 }]} {...inputProps} />
            </View>
            {!dateEmpty && !birthDate && day && month && year.length === 4 && <Text style={s.error}>{t("Sana noto'g'ri")}</Text>}
          </View>
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
          <View style={s.field}>
            <Label>{t('Email (ixtiyoriy)')}</Label>
            <TextInput
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="emailAddress"
              placeholder="name@gmail.com"
              style={s.input}
              {...inputProps}
            />
            {!emailOk && <Text style={s.error}>{t("Email noto'g'ri")}</Text>}
          </View>
          <View style={s.field}>
            <Label>{t('Telefon')}</Label>
            <TextInput value={phone} editable={false} style={[s.input, { color: c.mute }]} {...inputProps} />
          </View>
          <Button title={t('Saqlash')} loading={busy} disabled={!canSave} onPress={save} style={{ marginTop: 8 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const mk = (c: Palette) =>
  StyleSheet.create({
    field: { gap: 10 },
    avatarWrap: { alignItems: 'center', gap: 12, marginVertical: 8 },
    avatar: {
      width: 112,
      height: 112,
      borderRadius: 56,
      overflow: 'hidden',
      backgroundImage: c.heroBg,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: c.line2,
    },
    dateInput: { flex: 1, textAlign: 'center', paddingHorizontal: 8 },
    error: { color: c.sale, fontSize: 13, marginLeft: 8 },
    avatarLetter: { color: '#EFE8DB', fontSize: 44, fontFamily: F.serif },
    input: {
      height: 54,
      borderRadius: 999,
      backgroundColor: c.s1,
      borderWidth: 1,
      borderColor: c.line2,
      paddingHorizontal: 22,
      fontSize: 16,
      color: c.text,
    },
  });
