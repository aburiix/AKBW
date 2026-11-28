import { Image } from 'expo-image';
import { useT } from '@/lib/i18n';
import { useFocusEffect } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Button, Center } from '@/components/ui';
import { api, trName } from '@/lib/api';
import { formatPrice } from '@/lib/format';
import { F, label, useColors, useStyles, type Palette } from '@/lib/theme';
import type { Order, OrderState } from '@/lib/types';

const statusOf = (c: Palette): Record<OrderState, { label: string; color: string }> => ({
  REVIEW: { label: 'Tekshirilmoqda', color: c.mute },
  PENDING: { label: "To'lov kutilmoqda", color: c.star },
  PAID: { label: "To'langan", color: c.ok },
  SENT: { label: "Yo'lda", color: c.info },
  CANCELLED: { label: 'Bekor qilingan', color: c.sale },
});

const METHODS = [
  { id: 'payme', name: 'Payme' },
  { id: 'click', name: 'Click' },
  { id: 'paynet', name: 'Paynet' },
] as const;

export default function Orders() {
  const t = useT();
  const c = useColors();
  const s = useStyles(mk);
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [paying, setPaying] = useState<Order | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const r = await api.orders();
      setOrders(r.data ?? []);
    } catch (e: any) {
      setError(e.message);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const pay = async (method: (typeof METHODS)[number]['id']) => {
    if (!paying) return;
    setBusy(method);
    try {
      const r = await api.payLink(method, paying.id, paying.total_price);
      if (!r.link) throw new Error(t("To'lov havolasi olinmadi"));
      setBusy(null);
      setPaying(null);
      // iOS: oyna (Modal) to'liq yopilmasdan brauzer ochilsa, ekran qotib qoladi — yopilish animatsiyasini kutamiz
      await new Promise((res) => setTimeout(res, 450));
      await WebBrowser.openBrowserAsync(r.link, { dismissButtonStyle: 'close' });
      load();
    } catch (e: any) {
      setBusy(null);
      setPaying(null);
      // Xato oynasi ham Modal yopilgach chiqsin, aks holda u ko'rinmay qolib, ekran bosilmaydi
      setTimeout(() => Alert.alert(t("To'lov ochilmadi"), e.message), 450);
    }
  };

  if (!orders && !error)
    return (
      <Center>
        <ActivityIndicator color={c.text} />
      </Center>
    );

  return (
    <>
      <FlatList
        style={{ backgroundColor: c.bg }}
        data={orders ?? []}
        keyExtractor={(o) => String(o.id)}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              await load();
              setRefreshing(false);
            }}
          />
        }
        ListEmptyComponent={<Text style={s.empty}>{error ?? t("Hali buyurtma yo'q")}</Text>}
        renderItem={({ item: o }) => {
          const STATUS = statusOf(c);
          const st = STATUS[o.state] ?? STATUS.REVIEW;
          return (
            <View style={s.card}>
              <View style={s.head}>
                <Text style={s.id}>№ {o.id}</Text>
                <View style={[s.badge, { backgroundColor: st.color }]}>
                  <Text style={s.badgeText}>{t(st.label)}</Text>
                </View>
              </View>
              <Text style={s.date}>{new Date(o.createdAt).toLocaleDateString('uz-UZ')}</Text>
              {o.orderItems?.map((it) => (
                <View key={it.id} style={s.item}>
                  <Image source={it.product?.product_images?.[0]} style={s.img} contentFit="cover" />
                  <View style={{ flex: 1 }}>
                    <Text style={s.name} numberOfLines={2}>
                      {trName(it.product) || t('Mahsulot #{n}', { n: it.productId })}
                    </Text>
                    <Text style={s.meta}>
                      {[trName(it.size), trName(it.color)].filter(Boolean).join(' · ')}
                      {'  '}× {it.quantity}
                    </Text>
                  </View>
                </View>
              ))}
              <View style={s.foot}>
                <Text style={s.total}>{formatPrice(o.total_price)}</Text>
                {o.state === 'PENDING' && <Button title={t("To'lash")} onPress={() => setPaying(o)} style={{ height: 42 }} />}
              </View>
              {o.state === 'REVIEW' && <Text style={s.hint}>{t("Menejer tasdiqlagach, shu yerda to'lov tugmasi chiqadi.")}</Text>}
            </View>
          );
        }}
      />
      <Modal visible={!!paying} transparent animationType="fade" onRequestClose={() => setPaying(null)}>
        <Pressable style={s.backdrop} onPress={() => setPaying(null)}>
          <Pressable style={s.sheet}>
            <Text style={s.sheetTitle}>{t("To'lov usuli")}</Text>
            <Text style={s.sheetSum}>{paying ? formatPrice(paying.total_price) : ''}</Text>
            {METHODS.map((m) => (
              <Button key={m.id} title={m.name} variant="ghost" loading={busy === m.id} disabled={!!busy} onPress={() => pay(m.id)} />
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const mk = (c: Palette) =>
  StyleSheet.create({
  empty: { textAlign: 'center', color: c.mute, marginTop: 60 },
  card: { backgroundColor: c.s1, borderRadius: 22, borderWidth: 1, borderColor: c.line, padding: 14, gap: 10 },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  id: { fontFamily: F.serif, fontSize: 22, color: c.text },
  badge: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { color: '#0E0D0B', fontSize: 11, fontWeight: '600' },
  date: { fontSize: 12, color: c.mute, marginTop: -6 },
  item: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  img: { width: 48, height: 60, borderRadius: 8, backgroundColor: c.s2 },
  name: { fontSize: 14, color: c.text },
  meta: { fontSize: 12, color: c.mute, marginTop: 2 },
  foot: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  total: { fontSize: 18, color: c.text },
  hint: { fontSize: 12, color: c.mute },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: c.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 40, gap: 10 },
  sheetTitle: { fontFamily: F.serif, fontSize: 26, color: c.text, textAlign: 'center' },
  sheetSum: { fontSize: 15, color: c.mute, textAlign: 'center', marginBottom: 6 },
});
