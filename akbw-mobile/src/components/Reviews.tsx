import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Button, Label } from '@/components/ui';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useT } from '@/lib/i18n';
import { F, label, useColors, useStyles, type Palette } from '@/lib/theme';
import type { Review } from '@/lib/types';

export function Stars({ value, size = 14, onChange }: { value: number; size?: number; onChange?: (v: number) => void }) {
  const c = useColors();
  return (
    <View style={{ flexDirection: 'row', gap: onChange ? 10 : 2 }}>
      {[1, 2, 3, 4, 5].map((i) => {
        const on = i <= Math.round(value);
        const star = <Text style={{ fontSize: size, color: on ? c.star : c.line2 }}>★</Text>;
        return onChange ? (
          <Pressable key={i} hitSlop={6} onPress={() => onChange(i)}>
            {star}
          </Pressable>
        ) : (
          <View key={i}>{star}</View>
        );
      })}
    </View>
  );
}

/** Mahsulot sahifasidagi sharhlar bloki: o'rtacha baho, ro'yxat, sharh yozish/tahrirlash/o'chirish. */
export function ReviewsBlock({ productId }: { productId: number }) {
  const t = useT();
  const c = useColors();
  const s = useStyles(mk);
  const token = useAuth((st) => st.token);
  const [items, setItems] = useState<Review[] | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [me, setMe] = useState<string | null>(null);
  const [editing, setEditing] = useState<Review | 'new' | null>(null);

  const load = useCallback(
    async (p = 1) => {
      try {
        const r = await api.reviews(productId, p);
        setItems((prev) => (p === 1 ? r.data : [...(prev ?? []), ...r.data]));
        setTotal(r.meta?.total ?? r.data.length);
        setPages(r.meta?.totalPages ?? 1);
        setPage(p);
      } catch {
        setItems((prev) => prev ?? []);
      }
    },
    [productId],
  );

  useEffect(() => {
    load(1);
  }, [load]);

  useEffect(() => {
    if (!token) return setMe(null);
    api
      .me()
      .then((r) => setMe(r.data.id))
      .catch(() => {});
  }, [token]);

  const avg = items?.length ? items.reduce((a, r) => a + r.rating, 0) / items.length : 0;
  const mine = items?.find((r) => r.user?.id === me);

  const write = () => {
    if (!token) {
      Alert.alert(t('Avval kiring'), t('Sharh yozish uchun profilingizga kiring.'), [
        { text: t('Bekor'), style: 'cancel' },
        { text: t('Kirish'), onPress: () => router.push('/login') },
      ]);
      return;
    }
    setEditing(mine ?? 'new');
  };

  const remove = (r: Review) =>
    Alert.alert(t("Sharhni o'chirasizmi?"), undefined, [
      { text: t('Bekor'), style: 'cancel' },
      {
        text: t("O'chirish"),
        style: 'destructive',
        onPress: async () => {
          await api.deleteReview(r.id).catch(() => {});
          load(1);
        },
      },
    ]);

  return (
    <View style={s.block}>
      <View style={s.head}>
        <View style={{ gap: 6 }}>
          <Label>{t('Sharhlar')}</Label>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={s.avg}>{items?.length ? avg.toFixed(1) : '—'}</Text>
            <View style={{ gap: 2 }}>
              <Stars value={avg} />
              <Text style={{ color: c.mute2, fontSize: 12 }}>{t('{n} ta sharh', { n: total })}</Text>
            </View>
          </View>
        </View>
        <Button title={mine ? t('Sharhimni tahrirlash') : t('Sharh yozish')} variant="ghost" size="sm" onPress={write} />
      </View>

      {items === null ? (
        <ActivityIndicator color={c.text} style={{ marginVertical: 16 }} />
      ) : items.length === 0 ? (
        <Text style={{ color: c.mute, fontSize: 14 }}>{t("Hali sharh yo'q. Birinchi bo'lib fikr qoldiring!")}</Text>
      ) : (
        items.map((r) => (
          <View key={r.id} style={s.card}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={s.ava}>
                  <Text style={{ color: c.text, fontFamily: F.serif, fontSize: 15 }}>{(r.user?.name?.[0] ?? 'A').toUpperCase()}</Text>
                </View>
                <View>
                  <Text style={{ color: c.text, fontSize: 14 }}>{r.user?.name ?? t('Mijoz')}</Text>
                  <Text style={{ color: c.mute2, fontSize: 11 }}>{new Date(r.createdAt).toLocaleDateString()}</Text>
                </View>
              </View>
              <Stars value={r.rating} size={12} />
            </View>
            <Text style={s.comment}>{r.comment}</Text>
            {r.user?.id === me && (
              <View style={{ flexDirection: 'row', gap: 16 }}>
                <Text onPress={() => setEditing(r)} style={[label(9.5), { color: c.text }]}>
                  {t('Tahrirlash')}
                </Text>
                <Text onPress={() => remove(r)} style={[label(9.5), { color: c.sale }]}>
                  {t("O'chirish")}
                </Text>
              </View>
            )}
          </View>
        ))
      )}
      {page < pages && <Button title={t("Yana ko'rsatish")} variant="ghost" size="sm" onPress={() => load(page + 1)} />}

      <ReviewSheet
        visible={editing !== null}
        review={editing === 'new' ? null : editing}
        onClose={() => setEditing(null)}
        onSave={async (rating, comment) => {
          if (editing && editing !== 'new') await api.editReview(editing.id, productId, rating, comment);
          else await api.addReview(productId, rating, comment);
          setEditing(null);
          load(1);
        }}
      />
    </View>
  );
}

function ReviewSheet({
  visible,
  review,
  onClose,
  onSave,
}: {
  visible: boolean;
  review: Review | null;
  onClose: () => void;
  onSave: (rating: number, comment: string) => Promise<void>;
}) {
  const t = useT();
  const c = useColors();
  const s = useStyles(mk);
  const insets = useSafeAreaInsets();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onShow={() => {
        setRating(review?.rating ?? 5);
        setComment(review?.comment ?? '');
      }}
      onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={s.backdrop} onPress={onClose}>
          <Pressable style={[s.sheet, { paddingBottom: insets.bottom + 16 }]}>
            <Text style={s.sheetTitle}>{review ? t('Sharhni tahrirlash') : t('Sharh yozish')}</Text>
            <Stars value={rating} size={30} onChange={setRating} />
            <TextInput
              value={comment}
              onChangeText={setComment}
              multiline
              maxLength={1000}
              placeholder={t('Mahsulot haqida fikringiz…')}
              placeholderTextColor={c.mute2}
              keyboardAppearance={c.scheme}
              style={s.input}
            />
            <Button
              title={t('Yuborish')}
              loading={busy}
              disabled={comment.trim().length < 3}
              onPress={async () => {
                setBusy(true);
                try {
                  await onSave(rating, comment.trim());
                } catch (e: any) {
                  Alert.alert(t('Xatolik yuz berdi'), e.message);
                } finally {
                  setBusy(false);
                }
              }}
            />
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const mk = (c: Palette) =>
  StyleSheet.create({
    block: { marginHorizontal: 16, marginTop: 28, gap: 12 },
    head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', gap: 10 },
    avg: { fontFamily: F.serif, fontSize: 34, color: c.text },
    card: { backgroundColor: c.s1, borderRadius: 18, borderWidth: 1, borderColor: c.line, padding: 14, gap: 10 },
    ava: { width: 34, height: 34, borderRadius: 17, backgroundColor: c.s3, alignItems: 'center', justifyContent: 'center' },
    comment: { fontFamily: F.serif, fontSize: 17, lineHeight: 23, color: c.text },
    backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
    sheet: { backgroundColor: c.bg, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, gap: 16, borderWidth: 1, borderColor: c.line },
    sheetTitle: { fontFamily: F.serif, fontSize: 26, color: c.text },
    input: {
      minHeight: 120,
      borderRadius: 20,
      backgroundColor: c.s1,
      borderWidth: 1,
      borderColor: c.line2,
      padding: 16,
      fontSize: 15,
      color: c.text,
      textAlignVertical: 'top',
    },
  });
