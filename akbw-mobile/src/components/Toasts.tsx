import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useToasts } from '@/lib/notify';
import { useColors } from '@/lib/theme';

/** Ekran tepasidagi xabarlar (xatolik — qizil chiziqli). Bosilsa yopiladi. */
export function Toasts() {
  const items = useToasts((s) => s.items);
  const remove = useToasts((s) => s.remove);
  const insets = useSafeAreaInsets();
  const c = useColors();
  if (!items.length) return null;
  return (
    <View pointerEvents="box-none" style={[st.wrap, { top: insets.top + 8 }]}>
      {items.map((x) => (
        <Animated.View key={x.id} entering={FadeInUp.duration(220)} exiting={FadeOutUp.duration(180)}>
          <Pressable
            onPress={() => remove(x.id)}
            accessibilityRole="alert"
            style={[
              st.toast,
              { backgroundColor: c.s1, borderColor: c.line, borderLeftColor: x.kind === 'error' ? c.sale : c.ok },
            ]}>
            <Text style={[st.text, { color: c.text }]}>{x.text}</Text>
          </Pressable>
        </Animated.View>
      ))}
    </View>
  );
}

const st = StyleSheet.create({
  wrap: { position: 'absolute', left: 12, right: 12, gap: 8, zIndex: 9999, elevation: 9999 },
  toast: {
    borderRadius: 14,
    borderWidth: 1,
    borderLeftWidth: 4,
    paddingVertical: 12,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  text: { fontSize: 14, lineHeight: 19, fontWeight: '500' },
});
