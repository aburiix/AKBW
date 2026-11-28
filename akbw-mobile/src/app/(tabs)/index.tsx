import { notifyError } from '@/lib/notify';
import { Image } from 'expo-image';
import { useLang, useT } from '@/lib/i18n';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProductCard } from '@/components/ProductCard';
import { RingCarousel, type RingItem } from '@/components/RingCarousel';
import { Stars } from '@/components/Reviews';
import { Button, Label, Screen, SectionTitle, Wordmark } from '@/components/ui';
import { api } from '@/lib/api';
import { F, label, useColors, useStyles, useTabBarSpace, type Palette } from '@/lib/theme';
import type { Product, Review, StyleItem } from '@/lib/types';

const STYLES = [
  { title: 'Old money', img: require('../../../assets/img/oldmoney.jpg') },
  { title: 'Oversize', img: require('../../../assets/img/oversize.jpg') },
  { title: 'Minimalistik', img: require('../../../assets/img/minimalistik.jpg') },
  { title: 'Sport', img: require('../../../assets/img/sport-style.jpg') },
  { title: 'Glamour', img: require('../../../assets/img/giamour.webp') },
];

const SEASONS = [
  { name: 'Bahor', icon: '✿', bg: 'radial-gradient(90% 80% at 70% 20%, #7C8466, #2A2C22 65%, #151610)' },
  { name: 'Yoz', icon: '☀', bg: 'radial-gradient(90% 80% at 70% 20%, #C9A46A, #4A3520 65%, #1A130C)' },
  { name: 'Kuz', icon: '❦', bg: 'radial-gradient(90% 80% at 70% 20%, #8A6243, #3A2416 65%, #150E09)' },
  { name: 'Qish', icon: '❄', bg: 'radial-gradient(90% 80% at 70% 20%, #8FA3B8, #2A3440 65%, #10141A)' },
];

export default function Home() {
  const t = useT();
  const lang = useLang((st) => st.lang);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const c = useColors();
  const s = useStyles(mk);
  const tabSpace = useTabBarSpace();
  const [newest, setNewest] = useState<Product[]>([]);
  const [mostSold, setMostSold] = useState<Product[]>([]);
  const [styles, setStyles] = useState<StyleItem[]>([]);
  const [top, setTop] = useState<Review[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const r = await api.recommended();
      setNewest(r.newest ?? []);
      setMostSold(r.mostSold ?? []);
      api
        .styles()
        .then((x) => setStyles(x.data ?? []))
        .catch(notifyError);
      api
        .topReviews()
        .then((x) => setTop(x.data ?? []))
        .catch(notifyError);
    } catch (e: any) {
      setError(e.message);
    }
    // til almashsa mahsulot nomlari yangi tilda qayta yuklanadi
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const cardW = Math.min(190, width * 0.44);

  // Uslublar: admin paneldagi uslublar + brend uslub rasmlari (karusel to'liq bo'lishi uchun)
  const ring: RingItem[] = [
    ...styles.map((x) => ({ key: `s${x.id}`, image: x.image, label: x.category?.name ?? '' })),
    ...STYLES.map((x) => ({ key: x.title, image: x.img, label: t(x.title) })),
  ];
  const openRing = (i: number) => {
    const sItem = styles[i];
    if (sItem) router.navigate({ pathname: '/catalog', params: { category: String(sItem.categoryId) } });
    else router.navigate('/catalog');
  };

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + 6, paddingBottom: tabSpace + 28 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={c.text} />}>
        <View style={s.header}>
          <Wordmark size={24} />
        </View>

        {/* Banner — saytdagi bronza radial fon + kiyim rasmi */}
        <View style={[s.hero, { backgroundImage: c.heroBg }]}>
          {/* Juftlik ortida saytdagi 3D shisha AKBW logosi (saytdagi Three.js sahnasidan olingan tasvir) */}
          <View style={s.heroMedia}>
            <Image source={require('../../../assets/img/hero-glass-logo.jpg')} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition="top" />
            <Image source={require('../../../assets/img/welcome-right.png')} style={s.heroImg} contentFit="contain" contentPosition="bottom" />
          </View>
          <View style={s.heroText}>
            <Label color="rgba(239,232,219,0.6)">{t("AKBW · Yangi qo'shilganlar")}</Label>
            <Text style={s.heroTitle}>{t("Bizning Brendimiz — Uslub va Ishonch")}</Text>
            <Text style={s.heroSub}>{t("Kiyimga bo'lgan munosabatni o'zgartiramiz. Sifatli kiyim sizning tarafingizdir.")}</Text>
            <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap', marginTop: 4 }}>
              <Pressable onPress={() => router.navigate('/catalog')} style={({ pressed }) => [s.pillIvory, pressed && { opacity: 0.8 }]}>
                <Text style={[label(11), { color: '#13110F' }]}>{t("Mahsulotlar →")}</Text>
              </Pressable>
              <Button title={t("Yangilari")} variant="onImage" size="sm" style={{ height: 46 }} onPress={() => router.navigate('/catalog')} />
            </View>
          </View>
        </View>

        {/* Fasllar — 4 ta fasl, banner ostida bir qatorda */}
        <View style={s.seasons}>
          {SEASONS.map((f) => (
            <Pressable
              key={f.name}
              onPress={() => router.navigate('/catalog')}
              style={({ pressed }) => [s.season, { backgroundImage: f.bg }, pressed && { opacity: 0.85 }]}>
              <Text style={s.seasonIcon}>{f.icon}</Text>
              <View style={{ gap: 4 }}>
                <Text style={[label(8.5), { color: 'rgba(239,232,219,0.6)' }]}>{t("Fasl")}</Text>
                <Text style={s.seasonName}>{t(f.name)}</Text>
              </View>
            </Pressable>
          ))}
        </View>

        {error && (
          <View style={{ padding: 16, gap: 10 }}>
            <Text style={{ color: c.sale }}>{error}</Text>
            <Button title={t("Qayta urinish")} variant="ghost" onPress={load} />
          </View>
        )}

        {newest.length > 0 && (
          <View style={{ marginTop: 44 }}>
            <SectionTitle
              kicker={t("AKBW · Yangi")}
              right={<Button title={t("Hammasi")} variant="ghost" size="sm" onPress={() => router.navigate('/catalog')} />}>
              {t("Yangi qo'shilganlar")}
            </SectionTitle>
            <FlatList
              horizontal
              data={newest}
              keyExtractor={(p) => String(p.id)}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
              renderItem={({ item }) => <ProductCard product={item} width={cardW} />}
            />
          </View>
        )}

        {mostSold.length > 0 && (
          <View style={{ marginTop: 44 }}>
            <SectionTitle kicker={t("AKBW · Top")}>{t("Ko'p sotilganlar")}</SectionTitle>
            <FlatList
              horizontal
              data={mostSold}
              keyExtractor={(p) => String(p.id)}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
              renderItem={({ item }) => <ProductCard product={item} width={cardW} />}
            />
          </View>
        )}

        {/* Uslublar — saytdagi 3D aylanma karusel */}
        <View style={{ marginTop: 48 }}>
          <SectionTitle kicker={t("AKBW · Asartimentlar")}>{t("Uslublar")}</SectionTitle>
          <RingCarousel items={ring} onOpen={openRing} />
          <Label style={{ textAlign: 'center', marginTop: -6 }}>{t("← suring · bosib oching →")}</Label>
        </View>

        {/* Mamnun mijozlar — saytdagi sharhlar bo'limi */}
        {top.length > 0 && (
          <View style={{ marginTop: 44 }}>
            <SectionTitle kicker={t('Sevimli mijozlarimiz')}>{t('Mamnun mijozlar')}</SectionTitle>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} snapToInterval={width * 0.82 + 12} decelerationRate="fast" contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
              {top.map((r) => (
                <Pressable
                  key={r.id}
                  onPress={() => router.push({ pathname: '/product/[id]', params: { id: String(r.product_id) } })}
                  style={[s.review, { width: width * 0.82 }]}>
                  <Stars value={r.rating} />
                  <Text style={s.reviewText} numberOfLines={4}>
                    “{r.comment}”
                  </Text>
                  <Text style={{ color: c.mute, fontSize: 13 }}>{r.user?.name ?? t('Mijoz')} ✓</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Biz haqimizda kartasi */}
        <View style={s.about}>
          <Image source={require('../../../assets/img/welcome.jpg')} style={{ height: 220 }} contentFit="cover" />
          <View style={{ padding: 22, gap: 12 }}>
            <Label>{t("AKBW · Brend")}</Label>
            <Text style={s.aboutTitle}>Aburiix Kraft Brand Wear</Text>
            <Text style={{ color: c.mute, fontSize: 14, lineHeight: 21 }}>
              {t("Sifatli mato, puxta tikuv va o'zingizga mos uslub. AKBW AI yordamida o'lchamingizni toping va kiyimni kiyib ko'ring.")}
            </Text>
            <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap', marginTop: 4 }}>
              <Button title={t("AKBW AI bilan gaplashish")} onPress={() => router.navigate('/ai')} />
              <Button title={t('Biz haqimizda')} variant="ghost" onPress={() => router.push('/about')} />
            </View>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const mk = (c: Palette) =>
  StyleSheet.create({
    header: { alignItems: 'center', paddingVertical: 12 },
    hero: { marginHorizontal: 16, borderRadius: 28, overflow: 'hidden', borderWidth: 1, borderColor: c.line, minHeight: 560 },
    heroMedia: { height: 348, overflow: 'hidden' },
    heroImg: { height: 330, marginTop: 18 },
    heroText: { padding: 22, paddingTop: 6, gap: 14 },
    heroTitle: { fontFamily: F.serif, fontSize: 34, lineHeight: 36, color: '#EFE8DB' },
    heroSub: { color: 'rgba(239,232,219,0.6)', fontSize: 14, lineHeight: 21 },
    pillIvory: { height: 46, paddingHorizontal: 20, borderRadius: 999, backgroundColor: '#EFE8DB', alignItems: 'center', justifyContent: 'center' },
    seasons: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingTop: 22 },
    season: {
      flex: 1,
      aspectRatio: 0.78,
      borderRadius: 18,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: c.line,
      padding: 10,
      justifyContent: 'space-between',
    },
    seasonIcon: { color: '#EFE8DB', fontSize: 18, opacity: 0.85 },
    seasonName: { fontFamily: F.serif, fontSize: 19, color: '#EFE8DB' },
    about: { marginTop: 48, marginHorizontal: 16, borderRadius: 28, overflow: 'hidden', borderWidth: 1, borderColor: c.line, backgroundColor: c.s1 },
    review: { backgroundColor: c.s1, borderRadius: 18, borderWidth: 1, borderColor: c.line, padding: 20, gap: 14, minHeight: 190, justifyContent: 'space-between' },
    reviewText: { fontFamily: F.serif, fontSize: 19, lineHeight: 26, color: c.text },
    aboutTitle: { fontFamily: F.serif, fontSize: 28, lineHeight: 30, color: c.text },
  });
