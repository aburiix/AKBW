import { Image } from 'expo-image';
import { useT } from '@/lib/i18n';
import { router } from 'expo-router';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Center, Label, PageTitle, Screen } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { cartCount, useCart, type CartItem } from '@/lib/cart';
import { finalPrice, formatPrice } from '@/lib/format';
import { label, useColors, useStyles, useTabBarSpace, type Palette } from '@/lib/theme';

export default function Cart() {
  const t = useT();
  const insets = useSafeAreaInsets();
  const c = useColors();
  const s = useStyles(mk);
  const tabSpace = useTabBarSpace();
  const { items, setQty, remove } = useCart();
  const token = useAuth((st) => st.token);
  const total = items.reduce((sum, i) => sum + finalPrice(i.price, i.discount) * i.quantity, 0);

  if (items.length === 0)
    return (
      <Screen style={{ paddingTop: insets.top }}>
        <PageTitle kicker={t('AKBW · Savat')}>{t('Savat')}</PageTitle>
        <Center>
          <Text style={{ color: c.mute, fontSize: 15 }}>{t("Savat hozircha bo'sh")}</Text>
          <Button title={t("Katalogga o'tish")} variant="ghost" onPress={() => router.navigate('/catalog')} />
        </Center>
      </Screen>
    );

  const checkout = () => {
    if (!token) {
      Alert.alert(t('Avval kiring'), t('Buyurtma berish uchun profilingizga kiring.'), [
        { text: t('Bekor'), style: 'cancel' },
        { text: t('Kirish'), onPress: () => router.push('/login') },
      ]);
      return;
    }
    router.push('/checkout');
  };

  return (
    <Screen style={{ paddingTop: insets.top }}>
      <PageTitle kicker={t('AKBW · {n} ta mahsulot', { n: cartCount(items) })}>{t('Savat')}</PageTitle>
      <FlatList
        data={items}
        keyExtractor={(i) => i.key}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 10, paddingBottom: 24 }}
        renderItem={({ item }) => <Row item={item} onQty={(q) => setQty(item.key, q)} onRemove={() => remove(item.key)} />}
      />
      <View style={[s.footer, { paddingBottom: tabSpace }]}>
        <View style={s.totalRow}>
          <Label>{t('Jami')}</Label>
          <Text style={s.total}>{formatPrice(total)}</Text>
        </View>
        <Button title={t("Buyurtma berish")} onPress={checkout} />
      </View>
    </Screen>
  );
}

function Row({ item, onQty, onRemove }: { item: CartItem; onQty: (q: number) => void; onRemove: () => void }) {
  const t = useT();
  const c = useColors();
  const s = useStyles(mk);
  return (
    <View style={s.row}>
      <Pressable onPress={() => router.push({ pathname: '/product/[id]', params: { id: String(item.productId) } })}>
        <Image source={item.image} style={s.img} contentFit="cover" />
      </Pressable>
      <View style={{ flex: 1, gap: 5 }}>
        <Text style={s.name} numberOfLines={2}>
          {item.name}
        </Text>
        {!!(item.size || item.color) && <Label size={9.5}>{[item.size, item.color].filter(Boolean).join(' · ')}</Label>}
        <Text style={s.price}>{formatPrice(finalPrice(item.price, item.discount))}</Text>
        <View style={s.qtyRow}>
          <View style={s.qty}>
            <Pressable hitSlop={8} onPress={() => onQty(item.quantity - 1)} style={s.qtyBtn}>
              <Text style={s.qtyTxt}>−</Text>
            </Pressable>
            <Text style={s.qtyNum}>{item.quantity}</Text>
            <Pressable hitSlop={8} onPress={() => onQty(item.quantity + 1)} style={s.qtyBtn}>
              <Text style={s.qtyTxt}>+</Text>
            </Pressable>
          </View>
          <Pressable onPress={onRemove} style={({ pressed }) => [s.cancel, pressed && { opacity: 0.6 }]}>
            <Text style={[label(8.5), { color: c.sale, letterSpacing: 1.2 }]}>{t('Bekor qilish')}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const mk = (c: Palette) =>
  StyleSheet.create({
    row: { flexDirection: 'row', gap: 14, backgroundColor: c.s1, borderRadius: 20, borderWidth: 1, borderColor: c.line, padding: 10 },
    img: { width: 92, height: 122, borderRadius: 14, backgroundColor: c.s2 },
    name: { fontSize: 14, color: c.text },
    price: { fontSize: 15, color: c.text },
    qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
    cancel: { height: 34, width: 108, borderRadius: 999, borderWidth: 1, borderColor: c.sale, alignItems: 'center', justifyContent: 'center' },
    qty: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: 108, borderWidth: 1, borderColor: c.line2, borderRadius: 999, height: 34 },
    qtyBtn: { width: 34, alignItems: 'center' },
    qtyTxt: { fontSize: 18, color: c.text },
    qtyNum: { minWidth: 22, textAlign: 'center', color: c.text },
    footer: { paddingHorizontal: 16, paddingTop: 14, gap: 14, borderTopWidth: 1, borderTopColor: c.line, backgroundColor: c.glass },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    total: { fontSize: 22, color: c.text },
  });
