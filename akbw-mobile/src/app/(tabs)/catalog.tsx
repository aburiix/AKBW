import { useLocalSearchParams } from 'expo-router';
import { useLang, useT } from '@/lib/i18n';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { countFilters, EMPTY_FILTERS, FilterSheet, filterParams, type Filters } from '@/components/FilterSheet';
import { ProductCard } from '@/components/ProductCard';
import { Chip, PageTitle, Screen } from '@/components/ui';
import { api } from '@/lib/api';
import { label, useColors, useStyles, useTabBarSpace, type Palette } from '@/lib/theme';
import type { Category, Product } from '@/lib/types';

const LIMIT = 20;

export default function Catalog() {
  const t = useT();
  const lang = useLang((st) => st.lang);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const c = useColors();
  const s = useStyles(mk);
  const tabSpace = useTabBarSpace();
  const [q, setQ] = useState('');
  const [query, setQuery] = useState('');
  const [cats, setCats] = useState<Category[]>([]);
  const [cat, setCat] = useState<number | null>(null);
  const [items, setItems] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reqId = useRef(0);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [filterOpen, setFilterOpen] = useState(false);
  const nFilters = countFilters(filters);
  const params = useLocalSearchParams<{ category?: string }>();

  // Fasllar karuselidan kelganda kategoriya oldindan tanlanadi
  useEffect(() => {
    if (params.category) setCat(Number(params.category));
  }, [params.category]);

  useEffect(() => {
    api.categories().then(setCats).catch(() => {});
  }, [lang]);

  // qidiruv — yozib bo'lgach 350 ms kutadi
  useEffect(() => {
    const t = setTimeout(() => setQuery(q.trim()), 350);
    return () => clearTimeout(t);
  }, [q]);

  const load = useCallback(
    async (p: number) => {
      const id = ++reqId.current;
      setLoading(true);
      setError(null);
      try {
        const r = await api.products({ page: p, limit: LIMIT, q: query || undefined, category_id: cat ?? undefined, ...filterParams(filters) });
        if (id !== reqId.current) return;
        setItems((prev) => (p === 1 ? r.data : [...prev, ...r.data]));
        setPage(p);
        setTotalPages(r.meta?.totalPages ?? 1);
        setTotal(r.meta?.total ?? r.data.length);
      } catch (e: any) {
        if (id === reqId.current) setError(e.message);
      } finally {
        if (id === reqId.current) setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [query, cat, filters, lang],
  );

  useEffect(() => {
    load(1);
  }, [load]);

  const gap = 10;
  const cardW = (width - 32 - gap) / 2;

  return (
    <Screen style={{ paddingTop: insets.top }}>
      <PageTitle kicker={t('AKBW · {n} ta mahsulot', { n: total })}>{t('Katalog')}</PageTitle>
      <View style={s.searchRow}>
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder={t("Kiyim qidirish…")}
          placeholderTextColor={c.mute2}
          style={s.search}
          returnKeyType="search"
          clearButtonMode="while-editing"
          autoCorrect={false}
          keyboardAppearance={c.scheme}
        />
        <Pressable
          onPress={() => setFilterOpen(true)}
          accessibilityLabel="Filtr"
          style={({ pressed }) => [s.filterBtn, nFilters > 0 && { backgroundColor: c.ivory, borderColor: c.ivory }, pressed && { opacity: 0.7 }]}>
          <Text style={[label(10.5), { color: nFilters ? c.onIvory : c.text }]}>{nFilters ? t('Filtr · {n}', { n: nFilters }) : t('Filtr')}</Text>
        </Pressable>
      </View>
      {cats.length > 0 && (
        <View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chips}>
            <Chip label={t("Hammasi")} active={cat === null} onPress={() => setCat(null)} />
            {cats.map((x) => (
              <Chip key={x.id} label={x.name} active={cat === x.id} onPress={() => setCat(x.id)} />
            ))}
          </ScrollView>
        </View>
      )}
      <FlatList
        data={items}
        keyExtractor={(p) => String(p.id)}
        numColumns={2}
        columnWrapperStyle={{ gap, paddingHorizontal: 16 }}
        contentContainerStyle={{ gap: 26, paddingTop: 8, paddingBottom: tabSpace + 24 }}
        renderItem={({ item }) => <ProductCard product={item} width={cardW} />}
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (!loading && page < totalPages) load(page + 1);
        }}
        keyboardDismissMode="on-drag"
        ListEmptyComponent={
          loading ? undefined : (
            <View style={{ alignItems: 'center', gap: 12, marginTop: 60 }}>
              <Text style={s.empty}>{error ?? t('Hech narsa topilmadi')}</Text>
              {nFilters > 0 && (
                <Pressable onPress={() => setFilters(EMPTY_FILTERS)}>
                  <Text style={[label(10.5), { color: c.text }]}>{t("Filtrni tozalash")}</Text>
                </Pressable>
              )}
            </View>
          )
        }
        ListFooterComponent={loading ? <ActivityIndicator style={{ marginVertical: 24 }} color={c.text} /> : undefined}
      />
      <FilterSheet
        visible={filterOpen}
        value={filters}
        total={total}
        onClose={() => setFilterOpen(false)}
        onApply={(f) => {
          setFilters(f);
          setFilterOpen(false);
        }}
      />
    </Screen>
  );
}

const mk = (c: Palette) =>
  StyleSheet.create({
    searchRow: { flexDirection: 'row', gap: 8, marginHorizontal: 16 },
    filterBtn: { height: 48, paddingHorizontal: 18, borderRadius: 999, borderWidth: 1, borderColor: c.line2, justifyContent: 'center' },
    search: {
      flex: 1,
      height: 48,
      borderRadius: 999,
      backgroundColor: c.s1,
      borderWidth: 1,
      borderColor: c.line2,
      paddingHorizontal: 20,
      fontSize: 15,
      color: c.text,
    },
    chips: { paddingHorizontal: 16, paddingVertical: 14, gap: 8 },
    empty: { textAlign: 'center', color: c.mute },
  });
