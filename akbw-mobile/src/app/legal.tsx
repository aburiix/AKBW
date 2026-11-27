import { Stack, useLocalSearchParams } from 'expo-router';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Label, Screen } from '@/components/ui';
import { useLang } from '@/lib/i18n';
import { SITE_TEXT } from '@/lib/siteText';
import { F, useColors, useStyles, type Palette } from '@/lib/theme';

type Section = Record<string, unknown> & { title: string };

/**
 * Foydalanish shartlari (doc=terms) va Maxfiylik siyosati (doc=privacy) — ilovaning o'zida.
 * Matn saytdan olinadi (scripts/sync-site-text.py), shuning uchun ikkalasi doim bir xil.
 */
export default function Legal() {
  const { doc } = useLocalSearchParams<{ doc?: string }>();
  const lang = useLang((st) => st.lang);
  const c = useColors();
  const s = useStyles(mk);
  const T = SITE_TEXT[lang] ?? SITE_TEXT.uz;
  const privacy = doc === 'privacy';
  const P = T.PrivacyPage;
  const R = T.TermsAndConditions;

  const title = privacy ? P.hero.title : R.hero.title;
  const subtitle = privacy ? P.hero.description : R.hero.subtitle;
  const intro = privacy ? P.intro : R.introduction;
  const sections = (privacy ? P.sections : R.sections) as unknown as Section[];
  const contact = (privacy ? P.contact : R.contact) as Record<string, string>;
  const footer = privacy ? P.footerNote : R.footerNote;

  const bullets = (items: unknown[], key: string, sub = false) => (
    <View key={key} style={{ gap: 6, paddingLeft: sub ? 14 : 0 }}>
      {items.map((it, i) => (
        <View key={i} style={{ flexDirection: 'row', gap: 10 }}>
          <Text style={[s.p, { color: c.mute2 }]}>{sub ? '–' : '•'}</Text>
          <Text style={[s.p, { flex: 1 }]}>{String(it)}</Text>
        </View>
      ))}
    </View>
  );

  const renderPart = (k: string, v: unknown) => {
    if (k === 'title' || k === 'isImportant' || v == null) return null;
    if (k === 'stages' && Array.isArray(v))
      return (
        <View key={k} style={{ gap: 10 }}>
          {(v as { title: string; items: string[] }[]).map((st, i) => (
            <View key={i} style={s.stage}>
              <Text style={s.stageTitle}>{st.title}</Text>
              {bullets(st.items, `st${i}`)}
            </View>
          ))}
        </View>
      );
    if (Array.isArray(v)) return bullets(v, k, k === 'subList');
    if (k === 'warning')
      return (
        <Text key={k} style={[s.p, s.warning]}>
          {String(v)}
        </Text>
      );
    return (
      <Text key={k} style={[s.p, k === 'note' && { fontStyle: 'italic' }]}>
        {String(v)}
      </Text>
    );
  };

  return (
    <Screen>
      <Stack.Screen options={{ title: title.toUpperCase() }} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 56, gap: 14 }}>
        <View style={[s.hero, { backgroundImage: c.heroBg }]}>
          <Label color="rgba(239,232,219,0.6)">AKBW</Label>
          <Text style={s.heroTitle}>{title}</Text>
          <Text style={s.heroSub}>{subtitle}</Text>
        </View>

        <Text style={[s.p, { color: c.text }]}>{intro}</Text>

        {sections.map((sec, i) => (
          <View key={i} style={[s.card, sec.isImportant ? { borderColor: c.star } : null]}>
            <Text style={s.h}>{sec.title}</Text>
            {Object.entries(sec).map(([k, v]) => renderPart(k, v))}
          </View>
        ))}

        <View style={s.card}>
          <Text style={s.h}>{contact.title}</Text>
          <Text style={s.p}>{contact.description}</Text>
          <Text style={s.link} onPress={() => Linking.openURL('tel:+998905661107')}>
            {contact.phoneLabel}: {contact.phone}
          </Text>
          <Text style={s.link} onPress={() => Linking.openURL(`mailto:${contact.email}`)}>
            {contact.emailLabel}: {contact.email}
          </Text>
          {!!contact.address && (
            <Text style={s.p}>
              {contact.addressLabel}: {contact.address}
            </Text>
          )}
        </View>

        <Text style={s.foot}>{footer}</Text>
      </ScrollView>
    </Screen>
  );
}

const mk = (c: Palette) =>
  StyleSheet.create({
    hero: { borderRadius: 28, borderWidth: 1, borderColor: c.line, padding: 24, gap: 10, overflow: 'hidden' },
    heroTitle: { fontFamily: F.serif, fontSize: 30, lineHeight: 34, color: '#EFE8DB' },
    heroSub: { fontSize: 14, lineHeight: 21, color: 'rgba(239,232,219,0.7)' },
    card: { backgroundColor: c.s1, borderRadius: 22, borderWidth: 1, borderColor: c.line, padding: 18, gap: 10 },
    h: { fontFamily: F.serif, fontSize: 21, lineHeight: 26, color: c.text },
    p: { fontSize: 14.5, lineHeight: 22, color: c.mute },
    warning: { color: c.text, backgroundColor: c.s2, borderRadius: 14, padding: 12, overflow: 'hidden' },
    stage: { backgroundColor: c.s2, borderRadius: 16, padding: 14, gap: 8 },
    stageTitle: { fontSize: 14, fontWeight: '600', color: c.text },
    link: { fontSize: 14.5, lineHeight: 22, color: c.text, textDecorationLine: 'underline' },
    foot: { textAlign: 'center', fontSize: 11, color: c.mute2, letterSpacing: 0.5, marginTop: 6 },
  });
