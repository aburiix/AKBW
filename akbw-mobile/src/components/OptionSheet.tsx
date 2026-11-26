import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { F, useColors, useStyles, type Palette } from '@/lib/theme';

/** Pastdan chiqadigan tanlov oynasi (til, ko'rinish). */
export function OptionSheet<T extends string>({
  visible,
  title,
  options,
  value,
  onSelect,
  onClose,
}: {
  visible: boolean;
  title: string;
  options: { id: T; title: string; hint?: string }[];
  value: T;
  onSelect: (v: T) => void;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const c = useColors();
  const s = useStyles(mk);
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={s.backdrop} onPress={onClose}>
        <Pressable style={[s.sheet, { paddingBottom: insets.bottom + 16 }]}>
          <View style={s.grip} />
          <Text style={s.title}>{title}</Text>
          {options.map((o) => {
            const on = o.id === value;
            return (
              <Pressable
                key={o.id}
                onPress={() => {
                  onSelect(o.id);
                  onClose();
                }}
                style={({ pressed }) => [s.row, on && { borderColor: c.ivory }, pressed && { opacity: 0.7 }]}>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={s.rowText}>{o.title}</Text>
                  {!!o.hint && <Text style={s.hint}>{o.hint}</Text>}
                </View>
                <View style={[s.radio, on && { borderColor: c.ivory }]}>{on && <View style={s.dot} />}</View>
              </Pressable>
            );
          })}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const mk = (c: Palette) =>
  StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
    sheet: { backgroundColor: c.bg, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 18, gap: 10, borderWidth: 1, borderColor: c.line },
    grip: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: c.line2, marginBottom: 6 },
    title: { fontFamily: F.serif, fontSize: 26, color: c.text, marginBottom: 6 },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: c.s1,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: c.line,
      paddingHorizontal: 18,
      paddingVertical: 16,
    },
    rowText: { fontSize: 16, color: c.text },
    hint: { fontSize: 12, color: c.mute2 },
    radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: c.line2, alignItems: 'center', justifyContent: 'center' },
    dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: c.ivory },
  });
