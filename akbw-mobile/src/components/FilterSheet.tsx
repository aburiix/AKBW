import { useEffect, useState } from 'react';
import { useT } from '@/lib/i18n';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Chip, Label } from '@/components/ui';
import { api } from '@/lib/api';
import { formatPrice } from '@/lib/format';
import { F, label, useColors, useStyles, type Palette } from '@/lib/theme';
import type { Named } from '@/lib/types';

export type Filters = {
  sort: 'new' | 'cheap' | 'expensive' | null;
  sizes: number[];
  colors: number[];
  min: string;
  max: string;
};

export const EMPTY_FILTERS: Filters = { sort: null, sizes: [], colors: [], min: '', max: '' };

export const SORTS: { id: NonNullable<Filters['sort']>; title: string; sortBy: string; sortOrder: 'asc' | 'desc' }[] = [
  { id: 'new', title: 'Yangilari', sortBy: 'createdAt', sortOrder: 'desc' },
  { id: 'cheap', title: 'Arzonroq', sortBy: 'price', sortOrder: 'asc' },
  { id: 'expensive', title: 'Qimmatroq', sortBy: 'price', sortOrder: 'desc' },
];

const PRICE_PRESETS = [
  { title: '200 mingacha', min: '', max: '200000' },
  { title: '200–500 ming', min: '200000', max: '500000' },
  { title: '500 mingdan', min: '500000', max: '' },
];

export const countFilters = (f: Filters) => (f.sort ? 1 : 0) + f.sizes.length + f.colors.length + (f.min || f.max ? 1 : 0);

/** Filtrlarni server parametrlariga aylantiradi (/product?size_id=1,2&min_price=…). */
export function filterParams(f: Filters): Record<string, string | undefined> {
  const sort = SORTS.find((x) => x.id === f.sort);
  return {
    size_id: f.sizes.length ? f.sizes.join(',') : undefined,
    color_id: f.colors.length ? f.colors.join(',') : undefined,
    min_price: f.min || undefined,
    max_price: f.max || undefined,
    sortBy: sort?.sortBy,
    sortOrder: sort?.sortOrder,
  };
}

export function FilterSheet({
  visible,
  value,
  total,
  onClose,
  onApply,
}: {
  visible: boolean;
  value: Filters;
  total: number;
  onClose: () => void;
  onApply: (f: Filters) => void;
}) {
  const insets = useSafeAreaInsets();
  const t = useT();
  const c = useColors();
  const s = useStyles(mk);
  const [draft, setDraft] = useState<Filters>(value);
  const [sizes, setSizes] = useState<Named[]>([]);
  const [colors, setColors] = useState<Named[]>([]);

  useEffect(() => {
    api.sizes().then(setSizes).catch(() => {});
    api.colors().then(setColors).catch(() => {});
  }, []);

  const toggle = (key: 'sizes' | 'colors', id: number) =>
    setDraft((d) => ({ ...d, [key]: d[key].includes(id) ? d[key].filter((x) => x !== id) : [...d[key], id] }));

  const digits = (t: string) => t.replace(/\D/g, '').slice(0, 9);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onShow={() => setDraft(value)}
      onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: c.bg }}>
        <View style={s.head}>
          <Pressable hitSlop={10} onPress={() => setDraft(EMPTY_FILTERS)}>
            <Text style={[label(10.5), { color: c.mute }]}>{t("Tozalash")}</Text>
          </Pressable>
          <Text style={s.title}>{t("Filtr")}</Text>
          <Pressable hitSlop={10} onPress={onClose}>
            <Text style={[label(10.5), { color: c.text }]}>{t("Yopish")}</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={{ padding: 16, gap: 26, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          <View style={s.block}>
            <Label>{t("Saralash")}</Label>
            <View style={s.wrap}>
              {SORTS.map((x) => (
                <Chip
                  key={x.id}
                  label={t(x.title)}
                  active={draft.sort === x.id}
                  onPress={() => setDraft((d) => ({ ...d, sort: d.sort === x.id ? null : x.id }))}
                />
              ))}
            </View>
          </View>

          {sizes.length > 0 && (
            <View style={s.block}>
              <Label>{t("O'lcham")}</Label>
              <View style={s.wrap}>
                {sizes.map((x) => (
                  <Chip key={x.id} label={x.name} active={draft.sizes.includes(x.id)} onPress={() => toggle('sizes', x.id)} />
                ))}
              </View>
            </View>
          )}

          {colors.length > 0 && (
            <View style={s.block}>
              <Label>{t("Rang")}</Label>
              <View style={s.wrap}>
                {colors.map((x) => (
                  <Chip key={x.id} label={x.name} active={draft.colors.includes(x.id)} onPress={() => toggle('colors', x.id)} />
                ))}
              </View>
            </View>
          )}

          <View style={s.block}>
            <Label>{t("Narx, so'm")}</Label>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TextInput
                value={draft.min}
                onChangeText={(t) => setDraft((d) => ({ ...d, min: digits(t) }))}
                placeholder={t("dan")}
                placeholderTextColor={c.mute2}
                keyboardType="number-pad"
                keyboardAppearance={c.scheme}
                style={s.input}
              />
              <TextInput
                value={draft.max}
                onChangeText={(t) => setDraft((d) => ({ ...d, max: digits(t) }))}
                placeholder={t("gacha")}
                placeholderTextColor={c.mute2}
                keyboardType="number-pad"
                keyboardAppearance={c.scheme}
                style={s.input}
              />
            </View>
            <View style={s.wrap}>
              {PRICE_PRESETS.map((p) => (
                <Chip
                  key={p.title}
                  label={t(p.title)}
                  active={draft.min === p.min && draft.max === p.max}
                  onPress={() => setDraft((d) => ({ ...d, min: p.min, max: p.max }))}
                />
              ))}
            </View>
            {!!(draft.min || draft.max) && (
              <Text style={{ color: c.mute, fontSize: 13 }}>
                {draft.min ? formatPrice(Number(draft.min)) : '0'} — {draft.max ? formatPrice(Number(draft.max)) : t('cheksiz')}
              </Text>
            )}
          </View>
        </ScrollView>

        <View style={[s.bar, { paddingBottom: Math.max(insets.bottom, 14) }]}>
          <Button
            title={countFilters(draft) ? t("Qo'llash ({n})", { n: countFilters(draft) }) : t("Qo'llash")}
            onPress={() => onApply(draft)}
          />
          <Text style={{ textAlign: 'center', color: c.mute2, fontSize: 12 }}>{t('Hozir katalogda: {n} ta mahsulot', { n: total })}</Text>
        </View>
      </View>
    </Modal>
  );
}

const mk = (c: Palette) =>
  StyleSheet.create({
    head: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingTop: 18,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: c.line,
    },
    title: { fontFamily: F.serif, fontSize: 26, color: c.text },
    block: { gap: 12 },
    wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    input: {
      flex: 1,
      height: 50,
      borderRadius: 999,
      backgroundColor: c.s1,
      borderWidth: 1,
      borderColor: c.line2,
      paddingHorizontal: 20,
      fontSize: 15,
      color: c.text,
    },
    bar: { paddingHorizontal: 16, paddingTop: 12, gap: 8, borderTopWidth: 1, borderTopColor: c.line, backgroundColor: c.bg },
  });
