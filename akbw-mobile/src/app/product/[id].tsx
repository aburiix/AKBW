import { Image } from 'expo-image';
import { useLang, useT } from '@/lib/i18n';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ReviewsBlock, Stars } from '@/components/Reviews';
import { Button, Center, Chip, Label, Screen } from '@/components/ui';
import { api } from '@/lib/api';
import { useCart } from '@/lib/cart';
import { useFavorites } from '@/lib/favorites';
import { finalPrice, formatPrice } from '@/lib/format';
import { SITE_TEXT } from '@/lib/siteText';
import { F, useColors, useStyles, type Palette } from '@/lib/theme';
import type { Product } from '@/lib/types';

export default function ProductScreen() {
  const t = useT();
  const lang = useLang((st) => st.lang);
  const { id } = useLocalSearchParams<{ id: string }>();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const c = useColors();
  const s = useStyles(mk);
  const add = useCart((st) => st.add);
  const fav = useFavorites();
  const [p, setP] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [size, setSize] = useState<string>();
  const [color, setColor] = useState<string>();
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    api
      .product(id)
      .then(setP)
      .catch((e) => setError(e.status === 404 ? t('Mahsulot topilmadi') : e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, lang]);

  if (error)
    return (
      <Screen>
        <Center>
          <Text style={{ color: c.mute }}>{error}</Text>
          <Button title={t("Orqaga")} variant="ghost" onPress={() => router.back()} />
        </Center>
      </Screen>
    );
  if (!p)
    return (
      <Screen>
        <Center>
          <ActivityIndicator color={c.text} />
        </Center>
      </Screen>
    );

  const images = p.product_images?.length ? p.product_images : [undefined];
  const price = finalPrice(p.price, p.discount);
  const needSize = p.sizes?.length > 0;
  const needColor = p.colors?.length > 0;
  const liked = fav.items.some((i) => i.id === p.id);

  const onAdd = () => {
    if (needSize && !size) return Alert.alert(t("O'lchamni tanlang"));
    if (needColor && !color) return Alert.alert(t('Rangni tanlang'));
    add(p, size, color);
    Alert.alert(t("Savatga qo'shildi"), p.name, [
      { text: t('Xarid davom etsin'), style: 'cancel' },
      { text: t("Savatga o'tish"), onPress: () => router.navigate('/cart') },
    ]);
  };

  return (
    <Screen>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable hitSlop={10} onPress={() => fav.toggle(p)} style={s.heart} accessibilityLabel={t('Sevimlilar')}>
              <Text style={{ fontSize: 18, color: liked ? c.sale : '#EFE8DB' }}>{liked ? '♥' : '♡'}</Text>
            </Pressable>
          ),
        }}
      />
      <ScrollView contentContainerStyle={{ paddingBottom: 130 }}>
        <View>
          <FlatList
            data={images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, i) => String(i)}
            onMomentumScrollEnd={(e) => setSlide(Math.round(e.nativeEvent.contentOffset.x / width))}
            renderItem={({ item }) => (
              <Image source={item} style={{ width, height: (width * 4) / 3, backgroundColor: c.s2 }} contentFit="cover" transition={250} />
            )}
          />
          {images.length > 1 && (
            <View style={s.dots}>
              {images.map((_, i) => (
                <View key={i} style={[s.dot, i === slide && s.dotOn]} />
              ))}
            </View>
          )}
        </View>

        <View style={{ padding: 16, paddingTop: 22, gap: 10 }}>
          {!!p.categories?.[0] && <Label>{`AKBW · ${p.categories[0].name}`}</Label>}
          <Text style={s.name}>{p.name}</Text>
          {!!p.rating && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Stars value={p.rating} size={13} />
              <Text style={{ color: c.mute, fontSize: 12 }}>{Number(p.rating).toFixed(1)}</Text>
            </View>
          )}
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 10 }}>
            <Text style={s.price}>{formatPrice(price)}</Text>
            {p.discount > 0 && <Text style={s.old}>{formatPrice(p.price)}</Text>}
            {p.discount > 0 && <Text style={{ color: c.sale, fontSize: 13 }}>-{p.discount}%</Text>}
          </View>
        </View>

        {needSize && (
          <View style={s.block}>
            <Label>{t("O'lcham")}</Label>
            <View style={s.wrap}>
              {p.sizes.map((x) => (
                <Chip key={x.id} label={x.name} active={size === x.name} onPress={() => setSize(x.name)} />
              ))}
            </View>
          </View>
        )}
        {needColor && (
          <View style={s.block}>
            <Label>{t("Rang")}</Label>
            <View style={s.wrap}>
              {p.colors.map((x) => (
                <Chip key={x.id} label={x.name} active={color === x.name} onPress={() => setColor(x.name)} />
              ))}
            </View>
          </View>
        )}

        <View style={[s.block, { flexDirection: 'row', gap: 10 }]}>
          <Button
            title={t("Kiyib ko'rish")}
            variant="ghost"
            size="sm"
            style={{ flex: 1, height: 46 }}
            onPress={() => router.push({ pathname: '/tryon', params: { productId: String(p.id) } })}
          />
          <Button
            title={t("O'lchamni so'rash")}
            variant="ghost"
            size="sm"
            style={{ flex: 1, height: 46 }}
            onPress={() => router.navigate({ pathname: '/ai', params: { productId: String(p.id) } })}
          />
        </View>

        {!!p.description && (
          <View style={[s.block, s.descCard]}>
            <Label>{t("Tavsif")}</Label>
            <Text style={s.desc}>{p.description}</Text>
          </View>
        )}
        <Faq />
        <ReviewsBlock productId={p.id} />
      </ScrollView>

      <View style={[s.bar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <Button title={t("Savatga qo'shish")} onPress={onAdd} />
      </View>
    </Screen>
  );
}


/** Saytdagi kabi "Savollar" bloki — bosilganda javob ochiladi. */
function Faq() {
  const t = useT();
  const c = useColors();
  const s = useStyles(mk);
  const lang = useLang((st) => st.lang);
  const FAQ = (SITE_TEXT[lang] ?? SITE_TEXT.uz).Faqs;
  const [open, setOpen] = useState<number | null>(null);
  return (
    <View style={[s.block, { gap: 8 }]}>
      <Label>{t('Savollar')}</Label>
      {FAQ.map((f, i) => (
        <Pressable key={i} onPress={() => setOpen(open === i ? null : i)} style={s.faq}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
            <Text style={{ flex: 1, color: c.text, fontSize: 15 }}>{f.q}</Text>
            <Text style={{ color: c.mute, fontSize: 18 }}>{open === i ? '−' : '+'}</Text>
          </View>
          {open === i && <Text style={{ color: c.mute, fontSize: 14, lineHeight: 21, marginTop: 8 }}>{f.a}</Text>}
        </Pressable>
      ))}
    </View>
  );
}

const mk = (c: Palette) =>
  StyleSheet.create({
    heart: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(14,13,11,0.55)', alignItems: 'center', justifyContent: 'center' },
    dots: { position: 'absolute', bottom: 14, alignSelf: 'center', flexDirection: 'row', gap: 6 },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(239,232,219,0.45)' },
    dotOn: { backgroundColor: '#EFE8DB', width: 18 },
    name: { fontFamily: F.serif, fontSize: 30, color: c.text, lineHeight: 33 },
    price: { fontSize: 19, color: c.text },
    old: { fontSize: 14, color: c.mute2, textDecorationLine: 'line-through' },
    block: { marginHorizontal: 16, marginTop: 20, gap: 12 },
    wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    faq: { backgroundColor: c.s1, borderRadius: 18, borderWidth: 1, borderColor: c.line, padding: 16 },
    descCard: { backgroundColor: c.s1, borderRadius: 20, borderWidth: 1, borderColor: c.line, padding: 18 },
    desc: { fontSize: 15, lineHeight: 23, color: c.mute },
    bar: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: 16,
      paddingTop: 12,
      backgroundColor: c.bg,
      borderTopWidth: 1,
      borderTopColor: c.line,
    },
  });
