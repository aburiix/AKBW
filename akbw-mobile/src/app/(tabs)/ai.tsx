import { Image } from 'expo-image';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components/ui';
import { api } from '@/lib/api';
import { AI_ERRORS, AssistantError, streamChat } from '@/lib/assistant';
import { useT } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { formatPrice } from '@/lib/format';
import { F, label, useColors, useStyles, useTabBarSpace, type Palette } from '@/lib/theme';
import type { AssistantMe, AssistantProduct, AssistantSize } from '@/lib/types';

type Msg = {
  key: string;
  role: 'user' | 'assistant';
  text: string;
  cards?: AssistantProduct[];
  size?: AssistantSize | null;
  pending?: boolean;
  error?: boolean;
};

const SUGGEST = ['Menga qaysi o‘lcham to‘g‘ri keladi?', 'Ofis uchun kiyim tavsiya qil', 'Yangi kelgan kiyimlarni ko‘rsat', 'Qishga nima kiyay?'];

const TOOL_LABEL: Record<string, string> = {
  search_products: 'Katalogdan qidiryapman…',
  get_product: "Mahsulotni ko'ryapman…",
  recommend_size: "O'lchamni hisoblayapman…",
  get_my_orders: "Buyurtmalaringizni ko'ryapman…",
  remember: 'Eslab qolyapman…',
  forget: "Unutyapman…",
};

export default function Assistant() {
  const t = useT();
  const c = useColors();
  const s = useStyles(mk);
  const tabSpace = useTabBarSpace();
  const [kb, setKb] = useState(false);

  // klaviatura ochiq bo'lsa pastki menyu yashiringan — yozish qatori klaviaturaga yopishadi
  useEffect(() => {
    const show = Keyboard.addListener('keyboardWillShow', () => setKb(true));
    const hide = Keyboard.addListener('keyboardWillHide', () => setKb(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);
  const insets = useSafeAreaInsets();
  const token = useAuth((s) => s.token);
  const params = useLocalSearchParams<{ productId?: string }>();
  const [me, setMe] = useState<AssistantMe | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [tool, setTool] = useState<string | null>(null);
  const [history, setHistory] = useState(false);
  const listRef = useRef<FlatList<Msg>>(null);
  const abortRef = useRef<AbortController | null>(null);
  const seq = useRef(0);
  const productId = params.productId ? Number(params.productId) : null;

  const loadMe = useCallback(() => {
    if (!token) return;
    api.assistantMe().then(setMe).catch(() => {});
  }, [token]);

  useFocusEffect(loadMe);

  useEffect(() => () => abortRef.current?.abort(), []);

  const send = async (text?: string) => {
    const q = (text ?? input).trim();
    if (!q || busy) return;
    setInput('');
    setBusy(true);
    const n = ++seq.current;
    const aKey = `a${n}`;
    setMsgs((l) => [...l, { key: `u${n}`, role: 'user', text: q }, { key: aKey, role: 'assistant', text: '', pending: true }]);
    const patch = (fn: (m: Msg) => Msg) => setMsgs((l) => l.map((m) => (m.key === aKey ? fn(m) : m)));
    const ac = new AbortController();
    abortRef.current = ac;
    try {
      await streamChat(
        { message: q, threadId, productId },
        (ev, data) => {
          if (ev === 'meta') setThreadId(data.threadId);
          else if (ev === 'text') {
            setTool(null);
            patch((m) => ({ ...m, text: m.text + data.delta }));
          } else if (ev === 'tool') setTool(data.name);
          else if (ev === 'cards')
            patch((m) => ({
              ...m,
              cards: [...(m.cards ?? []), ...data.products.filter((p: AssistantProduct) => !m.cards?.some((c) => c.id === p.id))],
            }));
          else if (ev === 'size') patch((m) => ({ ...m, size: data }));
          else if (ev === 'error') patch((m) => ({ ...m, error: true, text: m.text || t(AI_ERRORS[data.code] || AI_ERRORS.AI_ERROR) }));
          else if (ev === 'notice') patch((m) => ({ ...m, text: m.text || t(AI_ERRORS.REFUSAL) }));
          else if (ev === 'done') setMe((x) => (x ? { ...x, left: data.left } : x));
        },
        ac.signal,
      );
    } catch (e) {
      if (!ac.signal.aborted) {
        const code = e instanceof AssistantError ? e.code : 'AI_ERROR';
        patch((m) => ({ ...m, error: true, text: t(AI_ERRORS[code] ?? AI_ERRORS.AI_ERROR) }));
      }
    } finally {
      patch((m) => ({ ...m, pending: false }));
      setTool(null);
      setBusy(false);
    }
  };

  const openThread = async (id: string) => {
    setHistory(false);
    try {
      const r = await api.assistantThread(id);
      setThreadId(id);
      setMsgs(r.messages.map((m) => ({ key: String(m.id), role: m.role, text: m.ui.text, cards: m.ui.cards, size: m.ui.size })));
    } catch {
      // e'tiborsiz
    }
  };

  const newChat = () => {
    abortRef.current?.abort();
    setMsgs([]);
    setThreadId(null);
  };

  if (!token)
    return (
      <View style={[s.center, { paddingTop: insets.top }]}>
        <Text style={s.brand}>AKBW AI</Text>
        <Text style={s.lead}>{t("Shaxsiy moda yordamchingiz: o'lcham, kiyim tanlash va uslub bo'yicha maslahat beradi.")}</Text>
        <Button title={t('Kirish')} onPress={() => router.push('/login')} style={{ alignSelf: 'stretch' }} />
      </View>
    );

  const disabled = me && !me.enabled;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: c.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
      <View style={[s.header, { paddingTop: insets.top + 6 }]}>
        <Pressable hitSlop={10} onPress={() => setHistory(true)}>
          <Text style={s.headBtn}>{t('Tarix')}</Text>
        </Pressable>
        <Text style={s.brandSmall}>AKBW AI</Text>
        <Pressable hitSlop={10} onPress={newChat}>
          <Text style={s.headBtn}>{t('Yangi')}</Text>
        </Pressable>
      </View>

      {disabled ? (
        <View style={s.center}>
          <Text style={s.lead}>{t(AI_ERRORS.DISABLED)}</Text>
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={msgs}
          keyExtractor={(m) => m.key}
          contentContainerStyle={{ padding: 16, gap: 12, flexGrow: 1 }}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          keyboardDismissMode="interactive"
          ListEmptyComponent={
            <View style={{ flex: 1, justifyContent: 'center', gap: 14 }}>
              <Text style={s.hello}>{t('Salom! Men AKBW AI.')}</Text>
              <Text style={s.lead}>{t("Kiyim, o'lcham yoki uslub haqida so'rang.")}</Text>
              <View style={{ gap: 8, marginTop: 8 }}>
                {SUGGEST.map((q) => (
                  <Pressable key={q} onPress={() => send(t(q))} style={({ pressed }) => [s.suggest, pressed && { opacity: 0.6 }]}>
                    <Text style={s.suggestText}>{t(q)}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          }
          renderItem={({ item }) => <Bubble m={item} tool={item.pending ? tool : null} />}
        />
      )}

      {!disabled && !!me && me.enabled && <Text style={s.left}>{t('Bugun qoldi: {a} / {b}', { a: me.left, b: me.limit })}</Text>}
      {!disabled && (
        <View style={[s.inputBar, { paddingBottom: kb ? 10 : tabSpace }]}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder={t('Savol yozing…')}
            placeholderTextColor={c.mute}
            style={s.input}
            multiline
            maxLength={2000}
          />
          <Pressable
            onPress={() => send()}
            disabled={!input.trim() || busy}
            style={({ pressed }) => [s.send, (!input.trim() || busy) && { opacity: 0.35 }, pressed && { opacity: 0.6 }]}>
            {busy ? <ActivityIndicator color={c.onIvory} size="small" /> : <Text style={s.sendText}>↑</Text>}
          </Pressable>
        </View>
      )}

      <Modal visible={history} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setHistory(false)}>
        <View style={{ flex: 1, backgroundColor: c.bg, padding: 16 }}>
          <View style={[s.header, { paddingTop: 0, paddingHorizontal: 0 }]}>
            <Text style={s.brandSmall}>{t('Suhbatlar')}</Text>
            <Text style={s.headBtn} onPress={() => setHistory(false)}>
              {t('Yopish')}
            </Text>
          </View>
          <ScrollView contentContainerStyle={{ gap: 8 }}>
            {(me?.threads ?? []).length === 0 && <Text style={s.lead}>{t("Hali suhbat yo'q")}</Text>}
            {me?.threads.map((th) => (
              <Pressable key={th.id} onPress={() => openThread(th.id)} style={({ pressed }) => [s.thread, pressed && { opacity: 0.6 }]}>
                <Text style={{ fontSize: 15, color: c.text }} numberOfLines={1}>
                  {th.title || t('Suhbat')}
                </Text>
                <Text style={{ fontSize: 12, color: c.mute }}>{new Date(th.updatedAt).toLocaleDateString()}</Text>
              </Pressable>
            ))}
            {!!me?.memories?.length && (
              <View style={{ marginTop: 20, gap: 6 }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: c.mute }}>{t('AI siz haqingizda eslab qolgan')}</Text>
                {me.memories.map((m) => (
                  <Text key={m.id} style={{ fontSize: 14, color: c.text }}>
                    • {m.fact}
                  </Text>
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

function Bubble({ m, tool }: { m: Msg; tool: string | null }) {
  const t = useT();
  const c = useColors();
  const s = useStyles(mk);
  const mine = m.role === 'user';
  return (
    <View style={{ alignItems: mine ? 'flex-end' : 'flex-start', gap: 8 }}>
      {(!!m.text || m.pending) && (
        <View style={[s.bubble, mine ? s.mine : s.theirs, m.error && { backgroundColor: 'rgba(224,137,111,0.14)' }]}>
          {m.text ? (
            <Text style={[s.msg, mine && { color: c.onIvory }, m.error && { color: c.sale }]}>{m.text}</Text>
          ) : (
            <Text style={[s.msg, { color: c.mute }]}>{tool ? t(TOOL_LABEL[tool] ?? 'Ishlayapman…') : t('Yozyapti…')}</Text>
          )}
        </View>
      )}
      {m.size && (
        <View style={s.size}>
          <Text style={s.sizeBig}>{m.size.size}</Text>
          <Text style={s.sizeText}>
            {m.size.product_name ? `${m.size.product_name}\n` : ''}
            {t("{n} o'tirish", { n: t(m.size.fit === 'tight' ? 'Tor' : m.size.fit === 'loose' ? 'Keng' : 'Odatiy') })}
            {m.size.between_sizes ? t(" · o'lchamlar orasida") : ''}
          </Text>
        </View>
      )}
      {!!m.cards?.length && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }} style={{ alignSelf: 'stretch' }}>
          {m.cards.map((p) => (
            <Pressable
              key={p.id}
              onPress={() => router.push({ pathname: '/product/[id]', params: { id: String(p.id) } })}
              style={({ pressed }) => [s.card, pressed && { opacity: 0.7 }]}>
              <Image source={p.image} style={s.cardImg} contentFit="cover" />
              <Text style={s.cardName} numberOfLines={2}>
                {p.name}
              </Text>
              <Text style={s.cardPrice}>{formatPrice(p.price)}</Text>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const mk = (c: Palette) =>
  StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16, backgroundColor: c.bg },
  brand: { fontFamily: F.display, fontSize: 34, letterSpacing: 3, color: c.text },
  brandSmall: { fontFamily: F.display, fontSize: 20, letterSpacing: 2, color: c.text },
  lead: { fontSize: 15, color: c.mute, textAlign: 'center', lineHeight: 22 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: c.line,
  },
  headBtn: { ...label(10.5), color: c.text },
  hello: { fontFamily: F.serif, fontSize: 32, color: c.text, textAlign: 'center' },
  suggest: { backgroundColor: c.s1, borderRadius: 16, borderWidth: 1, borderColor: c.line, paddingHorizontal: 16, paddingVertical: 12 },
  suggestText: { fontSize: 14, color: c.text },
  bubble: { maxWidth: '85%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  mine: { backgroundColor: c.ivory, borderBottomRightRadius: 6 },
  theirs: { backgroundColor: c.s1, borderBottomLeftRadius: 6 },
  msg: { fontSize: 15, lineHeight: 21, color: c.text },
  size: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: c.s1, borderRadius: 16, padding: 12, borderWidth: 1, borderColor: c.line },
  sizeBig: { fontSize: 28, fontWeight: '800', color: c.text, minWidth: 44, textAlign: 'center' },
  sizeText: { fontSize: 13, color: c.mute, lineHeight: 18 },
  card: { width: 140, backgroundColor: c.s1, borderRadius: 14, padding: 8 },
  cardImg: { width: '100%', height: 160, borderRadius: 10, backgroundColor: c.s2 },
  cardName: { fontSize: 12, color: c.text, marginTop: 6 },
  cardPrice: { fontSize: 13, fontWeight: '700', color: c.text, marginTop: 2 },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, paddingHorizontal: 12, paddingTop: 8, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.line },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    backgroundColor: c.s1,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: c.line,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    fontSize: 15,
    color: c.text,
  },
  send: { width: 44, height: 44, borderRadius: 22, backgroundColor: c.ivory, alignItems: 'center', justifyContent: 'center' },
  sendText: { color: c.onIvory, fontSize: 20, fontWeight: '700' },
  thread: { backgroundColor: c.s1, borderRadius: 14, padding: 14, gap: 4 },
  left: { fontSize: 11, color: c.mute, textAlign: 'center', paddingBottom: 6 },
});
