import { notifyError } from '@/lib/notify';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, useWindowDimensions } from 'react-native';
import { Button, Center, Label, Screen } from '@/components/ui';
import { api } from '@/lib/api';
import { useT } from '@/lib/i18n';
import { useColors, useStyles, type Palette } from '@/lib/theme';
import type { TryOnItem } from '@/lib/types';

export default function TryOnHistory() {
  const t = useT();
  const c = useColors();
  const s = useStyles(mk);
  const { width } = useWindowDimensions();
  const [items, setItems] = useState<TryOnItem[] | null>(null);

  useEffect(() => {
    api
      .tryOnMe()
      .then((r) => setItems(r.items ?? []))
      .catch((e) => {
        setItems([]);
        notifyError(e);
      });
  }, []);

  const remove = (id: string) =>
    Alert.alert(t("Rasmni o'chirasizmi?"), undefined, [
      { text: t('Bekor'), style: 'cancel' },
      {
        text: t("O'chirish"),
        style: 'destructive',
        onPress: async () => {
          try {
            await api.deleteTryOn(id);
            setItems((l) => l?.filter((x) => x.id !== id) ?? null);
          } catch (e) {
            notifyError(e, t("O'chirib bo'lmadi."));
          }
        },
      },
    ]);

  if (!items)
    return (
      <Screen>
        <Center>
          <ActivityIndicator color={c.text} />
        </Center>
      </Screen>
    );

  const w = (width - 32 - 10) / 2;

  return (
    <Screen>
      <FlatList
        data={items}
        numColumns={2}
        keyExtractor={(x) => x.id}
        columnWrapperStyle={{ gap: 10, paddingHorizontal: 16 }}
        contentContainerStyle={{ gap: 14, paddingVertical: 16, flexGrow: 1 }}
        ListEmptyComponent={
          <Center>
            <Text style={{ color: c.mute, textAlign: 'center' }}>{t("Hali kiyib ko'rilmagan. Mahsulot sahifasida «Kiyib ko'rish» tugmasini bosing.")}</Text>
            <Button title={t("Katalogga o'tish")} variant="ghost" onPress={() => router.navigate('/catalog')} />
          </Center>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push({ pathname: '/product/[id]', params: { id: String(item.productId) } })}
            onLongPress={() => remove(item.id)}
            style={{ width: w, gap: 6 }}>
            <Image source={item.resultUrl} style={[s.img, { width: w, height: w * 1.33 }]} contentFit="cover" />
            <Label size={9}>{new Date(item.createdAt).toLocaleDateString()}</Label>
          </Pressable>
        )}
        ListFooterComponent={items.length ? <Text style={s.hint}>{t("O'chirish uchun rasmni bosib turing")}</Text> : undefined}
      />
    </Screen>
  );
}

const mk = (c: Palette) =>
  StyleSheet.create({
    img: { borderRadius: 16, backgroundColor: c.s2 },
    hint: { textAlign: 'center', color: c.mute2, fontSize: 12, marginTop: 8 },
  });
