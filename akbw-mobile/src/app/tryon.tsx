import { notifyError } from '@/lib/notify';
import { Image } from 'expo-image';
import { useT } from '@/lib/i18n';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Button, Center } from '@/components/ui';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { F, useColors, useStyles, type Palette } from '@/lib/theme';
import type { Product, TryOnMe } from '@/lib/types';

/** Rasmni 1280 px gacha kichraytirib JPEG qiladi (server 8 MB va jpeg/png/webp qabul qiladi). */
async function prepare(uri: string, width: number) {
  const ctx = ImageManipulator.manipulate(uri);
  if (width > 1280) ctx.resize({ width: 1280 });
  const img = await ctx.renderAsync();
  const out = await img.saveAsync({ format: SaveFormat.JPEG, compress: 0.85 });
  return out.uri;
}

export default function TryOn() {
  const t = useT();
  const c = useColors();
  const s = useStyles(mk);
  const { productId } = useLocalSearchParams<{ productId: string }>();
  const token = useAuth((s) => s.token);
  const { width } = useWindowDimensions();
  const [product, setProduct] = useState<Product | null>(null);
  const [me, setMe] = useState<TryOnMe | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.product(productId).then(setProduct).catch(notifyError);
    if (token) api.tryOnMe().then(setMe).catch(notifyError);
  }, [productId, token]);

  const pick = async (camera: boolean) => {
    const perm = camera ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(t('Ruxsat kerak'), camera ? t('Kameraga ruxsat bering (Sozlamalar → Expo Go).') : t('Rasmlarga ruxsat bering.'));
      return;
    }
    const opts: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 0.9, cameraType: ImagePicker.CameraType.front };
    const r = camera ? await ImagePicker.launchCameraAsync(opts) : await ImagePicker.launchImageLibraryAsync(opts);
    if (r.canceled || !r.assets?.[0]) return;
    try {
      setPhoto(await prepare(r.assets[0].uri, r.assets[0].width));
      setResult(null);
    } catch {
      Alert.alert(t("Rasmni o'qib bo'lmadi"), t('Boshqa rasm tanlang.'));
    }
  };

  const run = async () => {
    if (!photo || !product) return;
    setBusy(true);
    try {
      const r = await api.createTryOn(photo, product.id);
      setResult(r.resultUrl);
      setMe((m) => (m ? { ...m, left: r.left } : m));
    } catch (e) {
      const code = e instanceof ApiError ? (e.body as any)?.code : null;
      Alert.alert(
        t("Kiyib ko'rish ishlamadi"),
        code === 'DISABLED'
          ? t("Kiyib ko'rish xizmati hali ishga tushirilmagan. Tez orada!")
          : code === 'LIMIT'
            ? t('Bugungi urinishlar tugadi. Ertaga yana urinib ko‘ring.')
            : (e as Error).message,
      );
    } finally {
      setBusy(false);
    }
  };

  if (!token)
    return (
      <Center>
        <Text style={s.lead}>{t("Kiyib ko'rish faqat ro'yxatdan o'tganlar uchun.")}</Text>
        <Button title={t("Kirish")} onPress={() => router.push('/login')} />
      </Center>
    );

  const imgW = width - 32;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: c.bg }} contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 40 }}>
      <Text style={s.title}>{t("Kiyib ko'rish")}</Text>
      <Text style={s.lead}>
        {t("O'zingizning to'liq bo'y rasmingizni yuklang — AI {n} ustingizga kiygizib ko'rsatadi.", {
          n: product ? `«${product.name}»` : t('kiyimni'),
        })}
      </Text>
      {me && me.enabled && <Text style={s.left}>{t('Bugun qoldi: {a} / {b}', { a: me.left, b: me.limit })}</Text>}
      {me && !me.enabled && <Text style={[s.left, { color: c.sale }]}>{t('Xizmat hali ishga tushirilmagan — tez orada.')}</Text>}

      <View style={s.row}>
        {product?.product_images?.[0] && <Image source={product.product_images[0]} style={s.thumb} contentFit="cover" />}
        <Text style={{ fontSize: 22, color: c.mute }}>+</Text>
        <View style={[s.thumb, { alignItems: 'center', justifyContent: 'center' }]}>
          {photo ? <Image source={photo} style={StyleSheet.absoluteFill} contentFit="cover" /> : <Text style={{ color: c.mute }}>{t('Siz')}</Text>}
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Button title={t("Suratga olish")} variant="ghost" onPress={() => pick(true)} style={{ flex: 1 }} disabled={busy} />
        <Button title={t("Galereya")} variant="ghost" onPress={() => pick(false)} style={{ flex: 1 }} disabled={busy} />
      </View>
      <Button title={busy ? t('AI ishlayapti…') : t("Kiyib ko'rish")} onPress={run} disabled={!photo || !product || busy} />
      {busy && (
        <View style={{ alignItems: 'center', gap: 8 }}>
          <ActivityIndicator color={c.text} />
          <Text style={s.left}>{t("Bu 10–40 soniya davom etadi")}</Text>
        </View>
      )}
      {result && (
        <View style={{ gap: 10 }}>
          <Text style={s.title}>{t("Natija")}</Text>
          <Image source={result} style={{ width: imgW, height: imgW * 1.33, borderRadius: 18, backgroundColor: c.s2 }} contentFit="cover" />
        </View>
      )}
    </ScrollView>
  );
}

const mk = (c: Palette) =>
  StyleSheet.create({
  title: { fontFamily: F.serif, fontSize: 30, color: c.text },
  lead: { fontSize: 15, color: c.mute, lineHeight: 22 },
  left: { fontSize: 13, color: c.mute },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16, marginVertical: 6 },
  thumb: { width: 120, height: 160, borderRadius: 14, backgroundColor: c.s2, overflow: 'hidden' },
});
