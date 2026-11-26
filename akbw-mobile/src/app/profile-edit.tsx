import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { Button, Center, Chip, Label, Screen } from '@/components/ui';
import { api } from '@/lib/api';
import { useT } from '@/lib/i18n';
import { useColors, useStyles, type Palette } from '@/lib/theme';

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

  useEffect(() => {
    api
      .me()
      .then((r) => {
        setName(r.data.name ?? '');
        setLastName(r.data.lastName ?? '');
        setGender(r.data.gender || 'male');
        setPhone(r.data.phone ?? '');
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const save = async () => {
    setBusy(true);
    try {
      await api.updateMe({ name: name.trim(), lastName: lastName.trim(), gender });
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
