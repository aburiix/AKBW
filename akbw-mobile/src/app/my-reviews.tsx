import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text } from 'react-native';
import { Stars } from '@/components/Reviews';
import { Center, Screen } from '@/components/ui';
import { api } from '@/lib/api';
import { useT } from '@/lib/i18n';
import { F, useColors, useStyles, type Palette } from '@/lib/theme';
import type { User } from '@/lib/types';

/** Profil → Mening sharhlarim (saytdagi "Sharhlar" tabi). */
export default function MyReviews() {
  const t = useT();
  const c = useColors();
  const s = useStyles(mk);
  const [items, setItems] = useState<NonNullable<User['reviews']> | null>(null);

  useEffect(() => {
    api
      .me()
      .then((r) => setItems(r.data.reviews ?? []))
      .catch(() => setItems([]));
  }, []);

  if (!items)
    return (
      <Screen>
        <Center>
          <ActivityIndicator color={c.text} />
        </Center>
      </Screen>
    );

  return (
    <Screen>
      <FlatList
        data={items}
        keyExtractor={(r) => String(r.id)}
        contentContainerStyle={{ padding: 16, gap: 10, flexGrow: 1 }}
        ListEmptyComponent={
          <Center>
            <Text style={{ color: c.mute, textAlign: 'center' }}>{t("Siz hali sharh yozmagansiz. Sotib olgan kiyimingiz sahifasida «Sharh yozish» tugmasini bosing.")}</Text>
          </Center>
        }
        renderItem={({ item }) => (
          <Pressable onPress={() => router.push({ pathname: '/product/[id]', params: { id: String(item.product_id) } })} style={s.card}>
            <Stars value={item.rating} />
            <Text style={s.text}>“{item.comment}”</Text>
            <Text style={{ color: c.mute2, fontSize: 12 }}>
              {new Date(item.createdAt).toLocaleDateString()} · {t('Mahsulot #{n}', { n: item.product_id })} →
            </Text>
          </Pressable>
        )}
      />
    </Screen>
  );
}

const mk = (c: Palette) =>
  StyleSheet.create({
    card: { backgroundColor: c.s1, borderRadius: 18, borderWidth: 1, borderColor: c.line, padding: 16, gap: 10 },
    text: { fontFamily: F.serif, fontSize: 18, lineHeight: 24, color: c.text },
  });
