import { Image } from 'expo-image';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useFrameCallback, useSharedValue, type SharedValue } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { label, useColors } from '@/lib/theme';

export type RingItem = { key: string; image: string | number; label: string };

const CARD_W = 160;
const CARD_H = CARD_W * 1.4; // saytdagi 3:4.2
const PERSPECTIVE = 1600;
const IDLE = 0.12; // gradus / kadr — saytdagi kabi sekin aylanish

/**
 * Saytdagi 3D halqa karusel (ring-carousel.tsx) ning ilova varianti:
 * o'zi sekin aylanadi, barmoq bilan suriladi (inersiya bilan), bosilganda old kartani ochadi.
 */
export function RingCarousel({ items, onOpen }: { items: RingItem[]; onOpen: (index: number) => void }) {
  const c = useColors();

  // Halqa to'liq ko'rinishi uchun kamida 8 ta joy
  const slots = useMemo(() => {
    const out: (RingItem & { src: number })[] = [];
    while (items.length && out.length < Math.max(8, items.length)) {
      const i = out.length % items.length;
      out.push({ ...items[i], src: i });
    }
    return out;
  }, [items]);

  const n = slots.length;
  const step = 360 / Math.max(n, 1);
  const radius = Math.round(CARD_W / 2 / Math.tan(Math.PI / Math.max(n, 3))) + 70;

  const rot = useSharedValue(0);
  const dragging = useSharedValue(false);
  const vel = useSharedValue(IDLE);

  useFrameCallback(() => {
    if (dragging.get()) return;
    vel.set(vel.get() + (IDLE - vel.get()) * 0.02);
    rot.set(rot.get() + vel.get());
  });

  const open = (slot: number) => onOpen(slots[slot]?.src ?? 0);

  const pan = Gesture.Pan()
    .activeOffsetX([-8, 8])
    .failOffsetY([-14, 14])
    .onBegin(() => {
      dragging.set(true);
    })
    .onChange((e) => {
      rot.set(rot.get() + e.changeX * 0.25);
    })
    .onFinalize((e) => {
      dragging.set(false);
      // qo'yib yuborilganda inersiya: tezlik asta-sekin IDLE ga qaytadi
      vel.set(Math.max(-12, Math.min(12, (e.velocityX * 0.25) / 60)));
    });

  const tap = Gesture.Tap()
    .maxDistance(6)
    .onEnd(() => {
      // eng oldidagi karta: burchagi 0° ga eng yaqin
      let best = 0;
      let bestCos = -2;
      for (let i = 0; i < n; i++) {
        const a = ((rot.get() + i * step) * Math.PI) / 180;
        if (Math.cos(a) > bestCos) {
          bestCos = Math.cos(a);
          best = i;
        }
      }
      scheduleOnRN(open, best);
    });

  if (n === 0) return null;

  return (
    <GestureDetector gesture={Gesture.Exclusive(pan, tap)}>
      <View style={s.wrap}>
        {/* Ikki alohida qatlam: har bir View o'z 3D tarkibini tekislaydi, shuning uchun
            old qatlam butunicha orqa qatlam ustida chiziladi (kartalar bir-birini kesmaydi). */}
        <View style={s.layer} pointerEvents="none">
          {slots.map((it, i) => (
            <Card key={`b-${it.key}-${i}`} back item={it} index={i} step={step} radius={radius} rot={rot} line={c.line2} bg={c.s2} />
          ))}
        </View>
        <View style={s.layer} pointerEvents="none">
          {slots.map((it, i) => (
            <Card key={`f-${it.key}-${i}`} item={it} index={i} step={step} radius={radius} rot={rot} line={c.line2} bg={c.s2} />
          ))}
        </View>
        <View pointerEvents="none" style={s.shadow} />
      </View>
    </GestureDetector>
  );
}

function Card({
  back,
  item,
  index,
  step,
  radius,
  rot,
  line,
  bg,
}: {
  back?: boolean;
  item: RingItem;
  index: number;
  step: number;
  radius: number;
  rot: SharedValue<number>;
  line: string;
  bg: string;
}) {
  const style = useAnimatedStyle(() => {
    const deg = rot.get() + index * step;
    const a = (deg * Math.PI) / 180;
    const cos = Math.cos(a);
    // CSS: translateZ(-R) rotateY(θ) translateZ(R) → chuqurlik z = R(cosθ − 1)
    const z = radius * (cos - 1);
    const scale = PERSPECTIVE / (PERSPECTIVE - z);
    return {
      zIndex: Math.round((cos + 1) * 100),
      // ikki qatlam: old kartalar to'liq tiniq, orqa/chetdagilar xira
      opacity: back
        ? 0.28 * Math.min(1, Math.max(0, (0.55 - cos) / 0.2)) // chetga va orqaga o'tganlar — xira
        : Math.min(1, Math.max(0, (cos - 0.35) / 0.2)), // oldidagilar — 100% tiniq
      transform: [
        { perspective: PERSPECTIVE },
        { translateX: radius * Math.sin(a) * scale },
        { scale },
        { rotateY: `${deg}deg` },
      ],
    };
  });

  return (
    <Animated.View style={[s.card, { borderColor: line, backgroundColor: bg }, back && s.backCard, style]}>
      <Image source={item.image} style={StyleSheet.absoluteFill} contentFit="cover" />
      <View style={[s.tag, back && { opacity: 0 }]}>
        <Text style={[label(10), { color: '#EFE8DB', textAlign: 'center' }]} numberOfLines={1}>
          {item.label}
        </Text>
      </View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  layer: { position: 'absolute', width: CARD_W, height: CARD_H },
  wrap: { height: CARD_H + 150, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  card: {
    position: 'absolute',
    width: CARD_W,
    height: CARD_H,
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    backfaceVisibility: 'hidden',
    boxShadow: '0 30px 60px -20px rgba(0,0,0,0.7)',
  },
  backCard: { backfaceVisibility: 'visible', boxShadow: 'none' },
  tag: {
    position: 'absolute',
    left: 10,
    right: 10,
    bottom: 10,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(14,13,11,0.55)',
    borderWidth: 1,
    borderColor: 'rgba(246,240,230,0.2)',
  },
  shadow: {
    position: 'absolute',
    bottom: 22,
    width: '60%',
    height: 40,
    borderRadius: 999,
    backgroundImage: 'radial-gradient(ellipse, rgba(0,0,0,0.45), transparent 70%)',
  },
});
