import { notifyError } from '@/lib/notify';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button, Label, Screen } from '@/components/ui';
import { api, BRAND } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useT } from '@/lib/i18n';
import { label, useColors, useStyles, type Palette } from '@/lib/theme';

export default function Contact() {
  const t = useT();
  const c = useColors();
  const s = useStyles(mk);
  const token = useAuth((st) => st.token);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+998 ');
  const [about, setAbout] = useState('');
  const [busy, setBusy] = useState(false);

  // kirgan bo'lsa ism va raqam o'zi to'ladi
  useEffect(() => {
    if (!token) return;
    api
      .me()
      .then((r) => {
        setName(`${r.data.name ?? ''} ${r.data.lastName ?? ''}`.trim());
        setPhone(r.data.phone ?? '+998 ');
      })
      .catch(notifyError);
  }, [token]);

  const send = async () => {
    setBusy(true);
    try {
      await api.contact({ name: name.trim(), phone: phone.trim(), about: about.trim() });
      Alert.alert(t('Xabaringiz yuborildi'), t("Tez orada siz bilan bog'lanamiz."), [{ text: 'OK', onPress: () => router.back() }]);
    } catch (e: any) {
      Alert.alert(t('Xatolik yuz berdi'), e.message);
    } finally {
      setBusy(false);
    }
  };

  const inputProps = { placeholderTextColor: c.mute2, keyboardAppearance: c.scheme } as const;
  const ok = name.trim().length >= 2 && phone.replace(/\D/g, '').length >= 9 && about.trim().length >= 5;

  return (
    <Screen>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          <Text style={s.lead}>{t("Savol, taklif yoki shikoyatingizni yozing — menejer Telegram orqali ko'rib, siz bilan bog'lanadi.")}</Text>

          <View style={s.quick}>
            <Pressable onPress={() => Linking.openURL(`tel:${BRAND.phone}`)} style={({ pressed }) => [s.quickBtn, pressed && { opacity: 0.7 }]}>
              <Text style={{ fontSize: 18, color: c.text }}>☏</Text>
              <Text style={[label(9), { color: c.text }]}>{t("Qo'ng'iroq")}</Text>
            </Pressable>
            <Pressable onPress={() => Linking.openURL(BRAND.telegram)} style={({ pressed }) => [s.quickBtn, pressed && { opacity: 0.7 }]}>
              <Text style={{ fontSize: 18, color: c.text }}>➤</Text>
              <Text style={[label(9), { color: c.text }]}>Telegram</Text>
            </Pressable>
            <Pressable onPress={() => Linking.openURL(BRAND.instagram)} style={({ pressed }) => [s.quickBtn, pressed && { opacity: 0.7 }]}>
              <Text style={{ fontSize: 18, color: c.text }}>◎</Text>
              <Text style={[label(9), { color: c.text }]}>Instagram</Text>
            </Pressable>
          </View>

          <View style={s.field}>
            <Label>{t('Ism')}</Label>
            <TextInput value={name} onChangeText={setName} style={s.input} {...inputProps} />
          </View>
          <View style={s.field}>
            <Label>{t('Telefon')}</Label>
            <TextInput value={phone} onChangeText={setPhone} keyboardType="phone-pad" style={s.input} {...inputProps} />
          </View>
          <View style={s.field}>
            <Label>{t('Xabar')}</Label>
            <TextInput
              value={about}
              onChangeText={setAbout}
              multiline
              maxLength={1000}
              placeholder={t('Masalan: buyurtmam qachon yetib keladi?')}
              style={[s.input, { height: 140, borderRadius: 22, paddingTop: 16, textAlignVertical: 'top' }]}
              {...inputProps}
            />
          </View>
          <Button title={t('Yuborish')} loading={busy} disabled={!ok} onPress={send} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const mk = (c: Palette) =>
  StyleSheet.create({
    lead: { color: c.mute, fontSize: 14, lineHeight: 21 },
    quick: { flexDirection: 'row', gap: 8 },
    quickBtn: { flex: 1, backgroundColor: c.s1, borderRadius: 18, borderWidth: 1, borderColor: c.line, paddingVertical: 14, alignItems: 'center', gap: 6 },
    field: { gap: 10 },
    input: { minHeight: 54, borderRadius: 999, backgroundColor: c.s1, borderWidth: 1, borderColor: c.line2, paddingHorizontal: 22, fontSize: 16, color: c.text },
  });
