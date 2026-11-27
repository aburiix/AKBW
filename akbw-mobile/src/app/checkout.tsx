import { router } from 'expo-router';
import { useT } from '@/lib/i18n';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PickerField } from '@/components/Picker';
import { Button } from '@/components/ui';
import { api } from '@/lib/api';
import { useCart } from '@/lib/cart';
import { finalPrice, formatPrice } from '@/lib/format';
import { F, label, useColors, useStyles, type Palette } from '@/lib/theme';
import type { BtsBranch, BtsPlace } from '@/lib/types';

const BTS_DOWN_UZ = "Yetkazib berish xizmati (BTS) hozircha ishlamayapti. Birozdan keyin urinib ko'ring.";

export default function Checkout() {
  const t = useT();
  const BTS_DOWN = t(BTS_DOWN_UZ);
  const c = useColors();
  const s = useStyles(mk);
  const insets = useSafeAreaInsets();
  const { items, clear } = useCart();
  const [regions, setRegions] = useState<BtsPlace[]>([]);
  const [cities, setCities] = useState<BtsPlace[]>([]);
  const [branches, setBranches] = useState<BtsBranch[]>([]);
  const [region, setRegion] = useState('');
  const [city, setCity] = useState('');
  const [branch, setBranch] = useState<BtsBranch | null>(null);
  const [delivery, setDelivery] = useState<number | null>(null);
  const [loading, setLoading] = useState<'regions' | 'cities' | 'branches' | 'price' | null>('regions');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [promo, setPromo] = useState('');
  const [coupon, setCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [promoBusy, setPromoBusy] = useState(false);

  const applyPromo = async () => {
    setPromoBusy(true);
    try {
      const r = await api.applyCoupon(promo.trim());
      setCoupon({ code: r.coupon.code ?? promo.trim(), discount: r.coupon.discount });
    } catch {
      Alert.alert(t("Promokod noto'g'ri"), t('Promokod topilmadi yoki muddati tugagan.'));
    } finally {
      setPromoBusy(false);
    }
  };

  const subtotal = items.reduce((sum, i) => sum + finalPrice(i.price, i.discount) * i.quantity, 0);
  const promoOff = coupon ? Math.round(subtotal * (coupon.discount / 100)) : 0;
  // Server ham aynan shunday hisoblaydi: mahsulot chegirmasi, keyin promokod (yetkazib berish alohida)
  const total = subtotal - promoOff + (delivery ?? 0);

  useEffect(() => {
    api
      .regions()
      .then((r) => (r.status === false ? setError(BTS_DOWN) : setRegions(r.data?.items ?? [])))
      .catch(() => setError(BTS_DOWN))
      .finally(() => setLoading(null));
  }, []);

  const pickRegion = async (code: string) => {
    setRegion(code);
    setCity('');
    setBranch(null);
    setCities([]);
    setBranches([]);
    setDelivery(null);
    setLoading('cities');
    try {
      const r = await api.cities(code);
      setCities(r.data?.items ?? []);
    } catch {
      setError(BTS_DOWN);
    } finally {
      setLoading(null);
    }
  };

  const pickCity = async (code: string) => {
    setCity(code);
    setBranch(null);
    setBranches([]);
    setDelivery(null);
    setLoading('branches');
    try {
      const r = await api.branches(region, code);
      setBranches(r.data?.items ?? []);
    } catch {
      setError(BTS_DOWN);
    } finally {
      setLoading(null);
    }
  };

  const pickBranch = async (code: string) => {
    const b = branches.find((x) => x.code === code) ?? null;
    setBranch(b);
    if (!b) return;
    setLoading('price');
    try {
      const r = await api.deliveryPrice(
        b.cityCode,
        items.map((i) => ({ productId: String(i.productId), quantity: String(i.quantity) })),
      );
      setDelivery(r.total_price ?? 0);
    } catch {
      setDelivery(0);
    } finally {
      setLoading(null);
    }
  };

  const submit = async () => {
    if (!branch) return;
    setSubmitting(true);
    try {
      await api.createOrder({
        items: items.map((i) => ({ productId: i.productId, sizeId: i.sizeId ?? null, colorId: i.colorId ?? null, quantity: i.quantity })),
        total_price: total,
        selectedBranch: branch,
        coupon_code: coupon?.code,
      });
      clear();
      Alert.alert(
        t('Buyurtma qabul qilindi'),
        t("Menejer buyurtmani tekshiradi. Tasdiqlangach, «Buyurtmalarim» bo'limida to'lov qilasiz."),
        [{ text: t('Buyurtmalarim'), onPress: () => router.replace('/orders') }],
      );
    } catch (e: any) {
      Alert.alert(t('Buyurtma yuborilmadi'), e.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0)
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: c.bg }}>
        <Text style={{ color: c.mute }}>{t("Savat bo'sh")}</Text>
      </View>
    );

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 40 }}>
        <Text style={s.h}>{t("Yetkazib berish manzili")}</Text>
        <Text style={s.note}>{t("Buyurtma BTS orqali siz tanlagan filialga yetkaziladi.")}</Text>
        {error ? (
          <View style={s.err}>
            <Text style={{ color: c.sale, lineHeight: 20 }}>{error}</Text>
          </View>
        ) : (
          <>
            <PickerField
              label={t("Viloyat")}
              value={regions.find((r) => r.code === region)?.name}
              items={regions}
              loading={loading === 'regions'}
              disabled={loading === 'regions'}
              onSelect={pickRegion}
            />
            <PickerField
              label={t("Tuman / shahar")}
              value={cities.find((c) => c.code === city)?.name}
              items={cities}
              loading={loading === 'cities'}
              disabled={!region || loading === 'cities'}
              onSelect={pickCity}
            />
            <PickerField
              label={t("BTS filiali")}
              value={branch ? `${branch.name}` : undefined}
              items={branches.map((b) => ({ code: b.code, name: b.name, sub: b.address }))}
              loading={loading === 'branches'}
              disabled={!city || loading === 'branches'}
              onSelect={pickBranch}
            />
            {branch && <Text style={s.note}>{branch.address}</Text>}
          </>
        )}

        <Text style={[s.h, { marginTop: 12 }]}>{t('Promokod')}</Text>
        {coupon ? (
          <View style={s.promoRow}>
            <Text style={{ flex: 1, color: c.ok, fontSize: 15 }}>✓ {coupon.code} — {t('{n}% chegirma qo‘llandi', { n: coupon.discount })}</Text>
            <Text onPress={() => setCoupon(null)} style={{ color: c.mute, fontSize: 13, padding: 8 }}>
              {t('Bekor')}
            </Text>
          </View>
        ) : (
          <View style={s.promoRow}>
            <TextInput
              value={promo}
              onChangeText={setPromo}
              placeholder={t('Promokodni kiriting')}
              placeholderTextColor={c.mute2}
              autoCapitalize="characters"
              autoCorrect={false}
              keyboardAppearance={c.scheme}
              style={s.promoInput}
            />
            <Button title={t("Qo'llash")} size="sm" variant="ghost" loading={promoBusy} disabled={promo.trim().length < 2} onPress={applyPromo} />
          </View>
        )}

        <Text style={[s.h, { marginTop: 12 }]}>{t("Buyurtma")}</Text>
        <View style={s.card}>
          {items.map((i) => (
            <View key={i.key} style={s.line}>
              <Text style={s.lineName} numberOfLines={1}>
                {i.name} × {i.quantity}
              </Text>
              <Text style={s.lineVal}>{formatPrice(finalPrice(i.price, i.discount) * i.quantity)}</Text>
            </View>
          ))}
          {coupon && (
            <View style={s.line}>
              <Text style={[s.lineName, { color: c.ok }]}>{t('Promokod')} · {coupon.code} (−{coupon.discount}%)</Text>
              <Text style={[s.lineVal, { color: c.ok }]}>−{formatPrice(promoOff)}</Text>
            </View>
          )}
          <View style={s.sep} />
          <View style={s.line}>
            <Text style={s.lineName}>{t("Yetkazib berish")}</Text>
            {loading === 'price' ? (
              <ActivityIndicator size="small" color={c.text} />
            ) : (
              <Text style={s.lineVal}>{delivery === null ? '—' : formatPrice(delivery)}</Text>
            )}
          </View>
          <View style={s.line}>
            <Text style={[s.lineName, { fontWeight: '700' }]}>{t("Jami")}</Text>
            <Text style={[s.lineVal, { fontSize: 18 }]}>{formatPrice(total)}</Text>
          </View>
        </View>
        <Text style={s.note}>
          {t("To'lov menejer buyurtmani tasdiqlagandan keyin Payme, Click yoki Paynet orqali qilinadi. Yakuniy summa tasdiqlangan buyurtmada ko'rsatiladi.")}
        </Text>
      </ScrollView>
      <View style={[s.bar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <Button title={t("Buyurtmani yuborish")} disabled={!branch || loading === 'price'} loading={submitting} onPress={submit} />
      </View>
    </View>
  );
}

const mk = (c: Palette) =>
  StyleSheet.create({
  h: { ...label(11), color: c.mute2 },
  note: { fontSize: 13, color: c.mute, lineHeight: 19 },
  err: { backgroundColor: 'rgba(224,137,111,0.14)', borderRadius: 14, padding: 14 },
  card: { backgroundColor: c.s1, borderRadius: 22, borderWidth: 1, borderColor: c.line, padding: 16, gap: 10 },
  line: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  lineName: { flex: 1, fontSize: 14, color: c.text },
  lineVal: { fontSize: 15, color: c.text },
  sep: { height: StyleSheet.hairlineWidth, backgroundColor: c.line },
  promoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: c.s1, borderRadius: 999, borderWidth: 1, borderColor: c.line2, paddingLeft: 18, paddingRight: 4, minHeight: 52 },
    promoInput: { flex: 1, fontSize: 15, color: c.text, height: 48 },
  bar: { paddingHorizontal: 16, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.line, backgroundColor: c.bg },
});
