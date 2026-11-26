import { ActivityIndicator, Pressable, StyleSheet, Text, View, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import { F, label, useColors, useStyles, type Palette } from '@/lib/theme';

/** Sahifa foni: v5 to'q/och fon + tepada iliq bronza nur. */
export function Screen({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const c = useColors();
  return (
    <View style={[{ flex: 1, backgroundColor: c.bg }, style]}>
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundImage: c.glow }]} />
      {children}
    </View>
  );
}

export function Wordmark({ size = 28, color }: { size?: number; color?: string }) {
  const c = useColors();
  return (
    <Text style={{ fontFamily: F.display, fontSize: size, letterSpacing: size * 0.12, color: color ?? c.text, textAlign: 'center' }}>
      AKBW
    </Text>
  );
}

/** Saytdagi .lbl yorlig'i */
export function Label({ children, size = 11, color, style }: { children: React.ReactNode; size?: number; color?: string; style?: object }) {
  const c = useColors();
  return <Text style={[label(size), { color: color ?? c.mute2 }, style]}>{children}</Text>;
}

type BtnProps = PressableProps & {
  title: string;
  variant?: 'ivory' | 'ghost' | 'onImage';
  size?: 'md' | 'sm';
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Saytdagi .pill: ivory (asosiy) / ghost (chiziqli). */
export function Button({ title, variant = 'ivory', size = 'md', loading, disabled, style, ...rest }: BtnProps) {
  const c = useColors();
  const s = useStyles(mk);
  const solid = variant === 'ivory';
  const fg = variant === 'onImage' ? c.onImage : solid ? c.onIvory : c.text;
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      style={({ pressed }) => [
        s.btn,
        size === 'sm' && { height: 40, paddingHorizontal: 16 },
        solid && { backgroundColor: c.ivory },
        variant === 'ghost' && { borderWidth: 1, borderColor: c.line2 },
        variant === 'onImage' && { borderWidth: 1, borderColor: 'rgba(239,232,219,0.4)' },
        (disabled || loading) && { opacity: 0.4 },
        pressed && { opacity: 0.75, transform: [{ scale: 0.98 }] },
        style,
      ]}
      {...rest}>
      {loading ? <ActivityIndicator color={fg} /> : <Text style={[label(11.5), { color: fg }]}>{title}</Text>}
    </Pressable>
  );
}

export function Chip({ label: text, active, onPress }: { label: string; active?: boolean; onPress?: () => void }) {
  const c = useColors();
  const s = useStyles(mk);
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [s.chip, active && { backgroundColor: c.ivory, borderColor: c.ivory }, pressed && { opacity: 0.7 }]}>
      <Text style={[label(10.5), { color: active ? c.onIvory : c.text }]}>{text}</Text>
    </Pressable>
  );
}

/** Bo'lim sarlavhasi: kichik yorliq + Didot sarlavha. */
export function SectionTitle({ kicker, children, right }: { kicker?: string; children: string; right?: React.ReactNode }) {
  const s = useStyles(mk);
  return (
    <View style={s.section}>
      <View style={{ flex: 1, gap: 8 }}>
        {!!kicker && <Label>{kicker}</Label>}
        <Text style={s.sectionText}>{children}</Text>
      </View>
      {right}
    </View>
  );
}

export function PageTitle({ kicker, children }: { kicker?: string; children: string }) {
  const s = useStyles(mk);
  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16, gap: 8 }}>
      {!!kicker && <Label>{kicker}</Label>}
      <Text style={s.pageTitle}>{children}</Text>
    </View>
  );
}

export function Center({ children }: { children: React.ReactNode }) {
  return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 14 }}>{children}</View>;
}

/** Yuza (surface) kartochka */
export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const s = useStyles(mk);
  return <View style={[s.card, style]}>{children}</View>;
}

const mk = (c: Palette) =>
  StyleSheet.create({
    btn: { height: 50, borderRadius: 999, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, flexDirection: 'row', gap: 10 },
    chip: { paddingHorizontal: 16, height: 36, borderRadius: 999, borderWidth: 1, borderColor: c.line2, justifyContent: 'center' },
    section: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 16, gap: 12 },
    sectionText: { fontFamily: F.serif, fontSize: 28, lineHeight: 30, color: c.text },
    pageTitle: { fontFamily: F.serif, fontSize: 34, lineHeight: 36, color: c.text },
    card: { backgroundColor: c.s1, borderRadius: 20, borderWidth: 1, borderColor: c.line },
  });
