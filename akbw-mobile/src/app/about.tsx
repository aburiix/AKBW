import { Image } from 'expo-image';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Label, Screen, Wordmark } from '@/components/ui';
import { useLang } from '@/lib/i18n';
import { SITE_TEXT } from '@/lib/siteText';
import { F, useColors, useStyles, type Palette } from '@/lib/theme';

/** Saytdagi "Biz haqimizda" sahifasi — matnlar saytdan (scripts/sync-site-text.py), 3 tilda. */
export default function About() {
  const lang = useLang((st) => st.lang);
  const c = useColors();
  const s = useStyles(mk);
  const A = (SITE_TEXT[lang] ?? SITE_TEXT.uz).AboutPage;
  const features = [
    { title: A.features.minimalism_title, text: A.features.minimalism_description },
    { title: A.features.quality_title, text: A.features.quality_description },
    { title: A.features.future_title, text: A.features.future_description },
  ];
  const values = [
    { title: A.values.honesty_title, text: A.values.honesty_description },
    { title: A.values.online_exp_title, text: A.values.online_exp_description },
  ];
  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: 48 }}>
        <View style={[s.hero, { backgroundImage: c.heroBg }]}>
          <Wordmark size={40} color="#EFE8DB" />
          <Text style={s.heroSub}>{A.hero_subtitle}</Text>
        </View>

        <View style={s.block}>
          <Label>{A.akbw_full_name}</Label>
          <Text style={s.h}>{A.intro_title}</Text>
          <Text style={s.p}>AKBW {A.intro_description_1}</Text>
          <Text style={s.p}>{A.intro_description_2}</Text>
        </View>

        <Image source={require('../../assets/img/welcome.jpg')} style={s.img} contentFit="cover" />

        <View style={s.block}>
          <Label>{A.vision_label}</Label>
          <Text style={s.h}>{A.vision_title}</Text>
          <Text style={s.p}>{A.vision_description}</Text>
        </View>

        <View style={[s.block, { gap: 10 }]}>
          {features.map((f) => (
            <View key={f.title} style={s.card}>
              <Text style={s.cardTitle}>{f.title}</Text>
              <Text style={s.p}>{f.text}</Text>
            </View>
          ))}
        </View>

        <View style={s.block}>
          <Label>{A.growth_title}</Label>
          <Text style={s.p}>{A.growth_description_1}</Text>
          <Text style={s.p}>{A.growth_description_2}</Text>
          <Text style={[s.p, { color: c.text }]}>
            — {A.founder_name}, {A.founder_role}
          </Text>
        </View>

        <View style={[s.block, { flexDirection: 'row', gap: 10 }]}>
          {values.map((v) => (
            <View key={v.title} style={[s.card, { flex: 1 }]}>
              <Text style={s.cardTitle}>{v.title}</Text>
              <Text style={s.p}>{v.text}</Text>
            </View>
          ))}
        </View>

        <View style={[s.quote, { backgroundImage: c.heroBg }]}>
          <Text style={s.quoteText}>{A.bottom_quote}</Text>
          <Text style={s.heroText}>{A.bottom_description}</Text>
        </View>

        <View style={[s.block, { flexDirection: 'row', gap: 10 }]}>
          <Button title={A.home_link} variant="ghost" style={{ flex: 1 }} onPress={() => router.navigate('/')} />
          <Button title={A.contact_link} style={{ flex: 1 }} onPress={() => router.push('/contact')} />
        </View>
      </ScrollView>
    </Screen>
  );
}

const mk = (c: Palette) =>
  StyleSheet.create({
    hero: { margin: 16, borderRadius: 28, borderWidth: 1, borderColor: c.line, paddingVertical: 48, alignItems: 'center', gap: 14, overflow: 'hidden' },
    heroSub: { fontFamily: F.serif, fontSize: 22, color: '#EFE8DB', textAlign: 'center', paddingHorizontal: 20 },
    heroText: { fontSize: 14, lineHeight: 21, color: 'rgba(239,232,219,0.7)', textAlign: 'center' },
    block: { marginHorizontal: 16, marginTop: 24, gap: 12 },
    h: { fontFamily: F.serif, fontSize: 28, lineHeight: 32, color: c.text },
    p: { fontSize: 15, lineHeight: 23, color: c.mute },
    img: { height: 260, marginHorizontal: 16, marginTop: 24, borderRadius: 24, backgroundColor: c.s2 },
    card: { backgroundColor: c.s1, borderRadius: 20, borderWidth: 1, borderColor: c.line, padding: 18, gap: 8 },
    cardTitle: { fontFamily: F.serif, fontSize: 22, color: c.text },
    quote: { marginHorizontal: 16, marginTop: 24, borderRadius: 28, borderWidth: 1, borderColor: c.line, padding: 28, gap: 12, overflow: 'hidden' },
    quoteText: { fontFamily: F.serif, fontSize: 26, lineHeight: 31, color: '#EFE8DB', textAlign: 'center' },
  });
