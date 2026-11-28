import { notifyError } from '@/lib/notify';
import { Image } from 'expo-image';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Center, Screen } from '@/components/ui';
import { api } from '@/lib/api';
import { useT } from '@/lib/i18n';
import { F, useColors, useStyles, type Palette } from '@/lib/theme';
import type { Chat, ChatMessage } from '@/lib/types';

/** Server http havola qaytarishi mumkin — iOS faqat https rasmni ko'rsatadi. */
const https = (u?: string) => (u ? u.replace(/^http:\/\/api\.akbw\.uz/, 'https://api.akbw.uz') : u);

/**
 * Admin bilan chat (saytdagi profil chatlari):
 *  kind=help — Yordam chati; kind=ask — katalogda yo'q mahsulotni so'rash (rasm bilan).
 * Javoblar admin paneldan keladi; ekran ochiq turganda har 6 soniyada yangilanadi.
 */
export default function ChatScreen() {
  const { kind } = useLocalSearchParams<{ kind?: string }>();
  const ask = kind === 'ask';
  const t = useT();
  const c = useColors();
  const s = useStyles(mk);
  const insets = useSafeAreaInsets();
  const [me, setMe] = useState<string | null>(null);
  const [chat, setChat] = useState<Chat | null | undefined>(undefined);
  const [text, setText] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const listRef = useRef<FlatList<ChatMessage>>(null);

  // har 6 s yangilanadi — xato bo'lsa bir marta xabar beriladi (yana ishlaguncha takrorlanmaydi)
  const failed = useRef(false);
  const load = useCallback(async () => {
    try {
      const r = ask ? await api.askChat() : await api.helpChat();
      setChat(r && (r as Chat).id ? (r as Chat) : null);
      failed.current = false;
    } catch (e) {
      setChat((x) => (x === undefined ? null : x));
      if (!failed.current) notifyError(e);
      failed.current = true;
    }
  }, [ask]);

  useFocusEffect(
    useCallback(() => {
      api
        .me()
        .then((r) => setMe(r.data.id))
        .catch(notifyError);
      load();
      const timer = setInterval(load, 6000);
      return () => clearInterval(timer);
    }, [load]),
  );

  const pick = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return Alert.alert(t('Ruxsat kerak'), t('Rasmlarga ruxsat bering.'));
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.9 });
    if (r.canceled || !r.assets?.[0]) return;
    const a = r.assets[0];
    const ctx = ImageManipulator.manipulate(a.uri);
    if (a.width > 1280) ctx.resize({ width: 1280 });
    const out = await (await ctx.renderAsync()).saveAsync({ format: SaveFormat.JPEG, compress: 0.85 });
    setPhoto(out.uri);
  };

  const send = async () => {
    const msg = text.trim();
    if ((!msg && !photo) || busy) return;
    setBusy(true);
    try {
      let current = chat;
      if (!current) current = ask ? await api.createAskChat() : await api.createHelpChat();
      let photoUrl: string | undefined;
      if (photo) photoUrl = (await api.uploadImage(photo)).url;
      if (ask) await api.sendAsk(current.id, msg || '📷', photoUrl);
      else await api.sendHelp(current.id, msg);
      setText('');
      setPhoto(null);
      await load();
    } catch (e: any) {
      Alert.alert(t('Xatolik yuz berdi'), e.message);
    } finally {
      setBusy(false);
    }
  };

  const title = ask ? t("MAHSULOT SO'RASH") : t('YORDAM CHATI');
  const msgs = chat?.messages ?? [];

  return (
    <Screen>
      <Stack.Screen options={{ title }} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
        {chat === undefined ? (
          <Center>
            <ActivityIndicator color={c.text} />
          </Center>
        ) : (
          <FlatList
            ref={listRef}
            data={msgs}
            keyExtractor={(m) => String(m.id)}
            contentContainerStyle={{ padding: 16, gap: 10, flexGrow: 1 }}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
            ListEmptyComponent={
              <Center>
                <Text style={s.introTitle}>{ask ? t("Kerakli kiyimni so'rang") : t('Savolingiz bormi?')}</Text>
                <Text style={s.intro}>
                  {ask
                    ? t("Katalogda topilmagan kiyimning rasmini yoki tavsifini yuboring — menejer topib, narxini aytadi.")
                    : t('Menejerga yozing — buyurtma, yetkazib berish yoki to‘lov bo‘yicha yordam beramiz.')}
                </Text>
              </Center>
            }
            renderItem={({ item }) => {
              const mine = item.sender_id === me;
              return (
                <View style={{ alignItems: mine ? 'flex-end' : 'flex-start', gap: 4 }}>
                  {!mine && <Text style={s.who}>AKBW</Text>}
                  <View style={[s.bubble, mine ? s.mine : s.theirs]}>
                    {!!item.photo && <Image source={https(item.photo)} style={s.photo} contentFit="cover" />}
                    {!!item.message && item.message !== '📷' && (
                      <Text style={[s.msg, mine && { color: c.onIvory }]}>{item.message}</Text>
                    )}
                  </View>
                  <Text style={s.time}>
                    {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              );
            }}
          />
        )}

        {!!photo && (
          <View style={s.preview}>
            <Image source={photo} style={{ width: 56, height: 56, borderRadius: 10 }} />
            <Text style={{ color: c.mute, flex: 1 }}>{t('Rasm biriktirildi')}</Text>
            <Text onPress={() => setPhoto(null)} style={{ color: c.sale, fontSize: 18, padding: 6 }}>
              ✕
            </Text>
          </View>
        )}

        <View style={[s.bar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
          {ask && (
            <Pressable onPress={pick} style={({ pressed }) => [s.attach, pressed && { opacity: 0.6 }]} accessibilityLabel={t('Rasm')}>
              <Text style={{ color: c.text, fontSize: 18 }}>＋</Text>
            </Pressable>
          )}
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder={t('Xabar yozing…')}
            placeholderTextColor={c.mute2}
            keyboardAppearance={c.scheme}
            multiline
            maxLength={1000}
            style={s.input}
          />
          <Pressable
            onPress={send}
            disabled={busy || (!text.trim() && !photo)}
            style={({ pressed }) => [s.send, (busy || (!text.trim() && !photo)) && { opacity: 0.35 }, pressed && { opacity: 0.6 }]}>
            {busy ? <ActivityIndicator color={c.onIvory} size="small" /> : <Text style={{ color: c.onIvory, fontSize: 20, fontWeight: '700' }}>↑</Text>}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const mk = (c: Palette) =>
  StyleSheet.create({
    introTitle: { fontFamily: F.serif, fontSize: 26, color: c.text, textAlign: 'center' },
    intro: { color: c.mute, fontSize: 14, lineHeight: 21, textAlign: 'center' },
    who: { color: c.mute2, fontSize: 10, letterSpacing: 2, marginLeft: 6 },
    bubble: { maxWidth: '82%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10, gap: 8 },
    mine: { backgroundColor: c.ivory, borderBottomRightRadius: 6 },
    theirs: { backgroundColor: c.s1, borderWidth: 1, borderColor: c.line, borderBottomLeftRadius: 6 },
    msg: { fontSize: 15, lineHeight: 21, color: c.text },
    photo: { width: 200, height: 240, borderRadius: 12, backgroundColor: c.s2 },
    time: { fontSize: 10, color: c.mute2, marginHorizontal: 6 },
    preview: { flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: 12, padding: 8, borderRadius: 14, backgroundColor: c.s1 },
    bar: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, paddingHorizontal: 12, paddingTop: 8, borderTopWidth: 1, borderTopColor: c.line, backgroundColor: c.bg },
    attach: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: c.line2, alignItems: 'center', justifyContent: 'center' },
    input: {
      flex: 1,
      minHeight: 44,
      maxHeight: 120,
      backgroundColor: c.s1,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: c.line2,
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 12,
      fontSize: 15,
      color: c.text,
    },
    send: { width: 44, height: 44, borderRadius: 22, backgroundColor: c.ivory, alignItems: 'center', justifyContent: 'center' },
  });
