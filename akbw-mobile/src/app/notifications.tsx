import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { Center, Label, Screen } from '@/components/ui';
import { api } from '@/lib/api';
import { useT } from '@/lib/i18n';
import { F, useColors, useStyles, type Palette } from '@/lib/theme';

type Item = { id: number; title: string; message: string; createdAt: string };

export default function Notifications() {
  const t = useT();
  const c = useColors();
  const s = useStyles(mk);
  const [items, setItems] = useState<Item[] | null>(null);

  useEffect(() => {
    api
      .notifications()
      .then((r) => setItems(r.data ?? []))
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
        keyExtractor={(n) => String(n.id)}
        contentContainerStyle={{ padding: 16, gap: 10, flexGrow: 1 }}
        ListEmptyComponent={
          <Center>
            <Text style={{ fontSize: 32, color: c.mute2 }}>◔</Text>
            <Text style={{ color: c.mute, textAlign: 'center' }}>{t("Hozircha bildirishnoma yo'q")}</Text>
          </Center>
        }
        renderItem={({ item }) => (
          <View style={s.card}>
            <Label size={9.5}>{new Date(item.createdAt).toLocaleDateString()}</Label>
            <Text style={s.title}>{item.title}</Text>
            <Text style={s.msg}>{item.message}</Text>
          </View>
        )}
      />
    </Screen>
  );
}

const mk = (c: Palette) =>
  StyleSheet.create({
    card: { backgroundColor: c.s1, borderRadius: 20, borderWidth: 1, borderColor: c.line, padding: 16, gap: 8 },
    title: { fontFamily: F.serif, fontSize: 20, color: c.text },
    msg: { fontSize: 14, color: c.mute, lineHeight: 21 },
  });
