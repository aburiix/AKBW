import { Image } from 'expo-image';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button, Center, Chip, Label, Screen } from '@/components/ui';
import { api, httpsUrl } from '@/lib/api';
import { useT } from '@/lib/i18n';
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
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const save = async () => {
    setBusy(true);
    try {
      let profile_picture: string | undefined;
      if (localPhoto) profile_picture = (await api.uploadImage(localPhoto)).url;
      else if (removed) profile_picture = '';
      await api.updateMe({ name: name.trim(), lastName: lastName.trim(), gender, ...(profile_picture !== undefined ? { profile_picture } : {}) });
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
            <Label>{t('Telefon')}</Label>
            <TextInput value={phone} editable={false} style={[s.input, { color: c.mute }]} {...inputProps} />
          </View>
          <Button title={t('Saqlash')} loading={busy} disabled={name.trim().length < 2} onPress={save} style={{ marginTop: 8 }} />
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
