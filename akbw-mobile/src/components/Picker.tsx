import { useState } from 'react';
import { useT } from '@/lib/i18n';
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { F, label, useColors, useStyles, type Palette } from '@/lib/theme';

type Item = { code: string; name: string; sub?: string };

/** Ro'yxatdan bitta qiymat tanlash (viloyat, tuman, filial). */
export function PickerField({
  label,
  value,
  items,
  disabled,
  loading,
  onSelect,
}: {
  label: string;
  value?: string;
  items: Item[];
  disabled?: boolean;
  loading?: boolean;
  onSelect: (code: string) => void;
}) {
  const t = useT();
  const c = useColors();
  const s = useStyles(mk);
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const shown = q ? items.filter((i) => (i.name + ' ' + (i.sub ?? '')).toLowerCase().includes(q.toLowerCase())) : items;

  return (
    <>
      <Pressable
        disabled={disabled}
        onPress={() => setOpen(true)}
        style={({ pressed }) => [s.field, disabled && { opacity: 0.45 }, pressed && { opacity: 0.7 }]}>
        <Text style={s.label}>{label}</Text>
        <Text style={[s.value, !value && { color: c.mute }]} numberOfLines={2}>
          {loading ? t('Yuklanmoqda…') : value || t('Tanlang')}
        </Text>
      </Pressable>
      <Modal visible={open} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setOpen(false)}>
        <View style={{ flex: 1, backgroundColor: c.bg, paddingTop: 16 }}>
          <View style={s.head}>
            <Text style={s.headTitle}>{label}</Text>
            <Text style={s.close} onPress={() => setOpen(false)}>
              {t('Yopish')}
            </Text>
          </View>
          <TextInput value={q} onChangeText={setQ} placeholder={t("Qidirish…")} placeholderTextColor={c.mute} style={s.search} />
          <FlatList
            data={shown}
            keyExtractor={(i) => i.code}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => {
                  onSelect(item.code);
                  setOpen(false);
                  setQ('');
                }}
                style={({ pressed }) => [s.row, pressed && { backgroundColor: c.s2 }]}>
                <Text style={s.rowText}>{item.name}</Text>
                {!!item.sub && <Text style={s.rowSub}>{item.sub}</Text>}
              </Pressable>
            )}
            ListEmptyComponent={<Text style={{ textAlign: 'center', color: c.mute, marginTop: 40 }}>{t('Hech narsa topilmadi')}</Text>}
          />
        </View>
      </Modal>
    </>
  );
}

const mk = (c: Palette) =>
  StyleSheet.create({
  field: { backgroundColor: c.s1, borderRadius: 20, borderWidth: 1, borderColor: c.line, paddingHorizontal: 16, paddingVertical: 12, gap: 2 },
  label: { ...label(10), color: c.mute2 },
  value: { fontSize: 15, color: c.text },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 12 },
  headTitle: { fontFamily: F.serif, fontSize: 26, color: c.text },
  close: { fontSize: 15, color: c.mute },
  search: {
    marginHorizontal: 16,
    marginBottom: 8,
    height: 44,
    borderRadius: 22,
    backgroundColor: c.s1,
    borderWidth: 1,
    borderColor: c.line,
    paddingHorizontal: 18,
    fontSize: 15,
    color: c.text,
  },
  row: { paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.line },
  rowText: { fontSize: 15, color: c.text },
  rowSub: { fontSize: 12, color: c.mute, marginTop: 2 },
});
