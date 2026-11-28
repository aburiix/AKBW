import { notifyError } from '@/lib/notify';
import Constants from 'expo-constants';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { OptionSheet } from '@/components/OptionSheet';
import { Button, Label, Screen, Wordmark } from '@/components/ui';
import { Image } from 'expo-image';
import { api, BRAND, httpsUrl } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { cartCount, useCart } from '@/lib/cart';
import { useFavorites } from '@/lib/favorites';
import { LANGS, useLang, useT } from '@/lib/i18n';
import { F, label, useColors, useStyles, useTabBarSpace, useThemeMode, type Palette, type ThemeMode } from '@/lib/theme';
import type { Order, User } from '@/lib/types';

const MODES: { id: ThemeMode; title: string }[] = [
  { id: 'system', title: 'Avto' },
  { id: 'dark', title: 'Tungi' },
  { id: 'light', title: 'Kunduzgi' },
];

export default function Profile() {
  const t = useT();
  const insets = useSafeAreaInsets();
  const tabSpace = useTabBarSpace();
  const c = useColors();
  const s = useStyles(mk);
  const token = useAuth((st) => st.token);
  const logout = useAuth((st) => st.logout);
  const favCount = useFavorites((st) => st.items.length);
  const inCart = useCart((st) => cartCount(st.items));
  const { lang, setLang } = useLang();
  const { mode, setMode } = useThemeMode();
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [sheet, setSheet] = useState<'lang' | 'theme' | null>(null);
  const [deleting, setDeleting] = useState(false);

  // App Store talabi: foydalanuvchi akkauntini ilovaning o'zidan o'chira olishi kerak
  const deleteAccount = () =>
    Alert.alert(
      t("Akkauntni o'chirasizmi?"),
      t("Ismingiz, telefon raqamingiz, AI suhbatlari va kiyib ko'rish rasmlari butunlay o'chiriladi. Buyurtmalar tarixi shaxssiz holda saqlanadi. Bu amalni qaytarib bo'lmaydi."),
      [
        { text: t('Bekor'), style: 'cancel' },
        {
          text: t("O'chirish"),
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await api.deleteMe();
              await logout();
              Alert.alert(t("Akkaunt o'chirildi"));
            } catch (e: any) {
              Alert.alert(t('Xatolik yuz berdi'), e.message);
            } finally {
              setDeleting(false);
            }
          },
        },
      ],
    );

  useFocusEffect(
    useCallback(() => {
      if (!token) {
        setUser(null);
        setOrders(null);
        return;
      }
      api
        .me()
        .then((r) => setUser(r.data))
        .catch(notifyError);
      api
        .orders()
        .then((r) => setOrders(r.data ?? []))
        .catch(notifyError);
    }, [token]),
  );

  const invite = () =>
    user?.referralCode &&
    Share.share({
      message: t("AKBW — zamonaviy kiyim do'koni. Ro'yxatdan o'tishda mening taklif kodimni kiriting: {code}\nhttps://akbw.uz", {
        code: user.referralCode,
      }),
    });

  const toPay = orders?.filter((o) => o.state === 'PENDING').length ?? 0;
  const version = Constants.expoConfig?.version ?? '1.0.0';
  const langTitle = LANGS.find((l) => l.id === lang)?.title ?? '';
  const modeTitle = t(MODES.find((m) => m.id === mode)?.title ?? 'Avto');
  const openLegal = (doc: 'terms' | 'privacy') => router.push({ pathname: '/legal', params: { doc } });

  const settings = (
    <Section title={t('Sozlamalar')}>
      <Row icon="◐" title={t('Til')} value={langTitle} onPress={() => setSheet('lang')} />
      <Row icon="◑" title={t("Ko'rinish")} value={modeTitle} onPress={() => setSheet('theme')} last={!token} />
      {!!token && <Row icon="◔" title={t('Bildirishnomalar')} onPress={() => router.push('/notifications')} last />}
    </Section>
  );

  const help = (
    <Section title={t('Yordam')}>
      <Row icon="✦" title={t('AKBW AI yordamchi')} onPress={() => router.navigate('/ai')} />
      {!!token && <Row icon="◍" title={t('Yordam chati')} onPress={() => router.push({ pathname: '/chat', params: { kind: 'help' } })} />}
      <Row icon="@" title={t("Biz bilan bog'lanish")} onPress={() => router.push('/contact')} />
      <Row icon="☏" title={t("Qo'ng'iroq qilish")} value={BRAND.phoneLabel} onPress={() => Linking.openURL(`tel:${BRAND.phone}`)} />
      <Row icon="➤" title="Telegram" value="@akbwuz" onPress={() => Linking.openURL(BRAND.telegram)} />
      <Row icon="◎" title="Instagram" value="@akbw.uz" onPress={() => Linking.openURL(BRAND.instagram)} last />
    </Section>
  );

  const legal = (
    <Section title={t("Ma'lumot")}>
      <Row icon="Ⓐ" title={t('Biz haqimizda')} onPress={() => router.push('/about')} />
      <Row icon="§" title={t('Maxfiylik siyosati')} onPress={() => openLegal('privacy')} />
      <Row icon="§" title={t('Foydalanish shartlari')} onPress={() => openLegal('terms')} last />
    </Section>
  );

  const sheets = (
    <>
      <OptionSheet visible={sheet === 'lang'} title={t('Til')} options={LANGS} value={lang} onSelect={setLang} onClose={() => setSheet(null)} />
      <OptionSheet
        visible={sheet === 'theme'}
        title={t("Ko'rinish")}
        options={MODES.map((m) => ({
          id: m.id,
          title: t(m.title),
          hint: m.id === 'system' ? t("«Avto» — telefoningiz sozlamasiga qarab o'zi almashadi.") : undefined,
        }))}
        value={mode}
        onSelect={setMode}
        onClose={() => setSheet(null)}
      />
    </>
  );

  const footer = <Text style={s.version}>AKBW · Aburiix Kraft Brand Wear · v{version}</Text>;

  // ---------- Mehmon (kirilmagan) ----------
  if (!token)
    return (
      <Screen>
        <ScrollView contentContainerStyle={{ paddingTop: insets.top + 20, paddingBottom: tabSpace + 24 }}>
          <View style={[s.hero, { backgroundImage: c.heroBg }]}>
            <Wordmark size={34} color="#EFE8DB" />
            <Text style={s.heroTitle}>{t('Shaxsiy kabinet')}</Text>
            <Text style={s.heroText}>{t("Buyurtmalar, saqlangan ma'lumotlar, kiyib ko'rish va AKBW AI uchun profilingizga kiring.")}</Text>
            <Pressable onPress={() => router.push('/login')} style={({ pressed }) => [s.heroBtn, pressed && { opacity: 0.8 }]}>
              <Text style={[label(11), { color: '#13110F' }]}>{t('Kirish')}</Text>
            </Pressable>
            <Pressable
              onPress={() => router.push({ pathname: '/login', params: { mode: 'register' } })}
              style={({ pressed }) => [s.heroBtnGhost, pressed && { opacity: 0.7 }]}>
              <Text style={[label(11), { color: '#EFE8DB' }]}>{t("Ro'yxatdan o'tish")}</Text>
            </Pressable>
          </View>

          <View style={s.stats}>
            <Stat value={favCount} title={t('Sevimlilar')} onPress={() => router.push('/favorites')} />
            <Stat value={inCart} title={t('Savatda')} onPress={() => router.navigate('/cart')} />
          </View>

          {settings}
          {help}
          {legal}
          {footer}
        </ScrollView>
        {sheets}
      </Screen>
    );

  // ---------- Kirilgan ----------
  const fullName = user ? `${user.name} ${user.lastName ?? ''}`.trim() : '…';

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: tabSpace + 24 }}>
        <View style={s.head}>
          <Pressable onPress={() => router.push('/profile-edit')} style={s.avatar}>
            {user?.profile_picture ? (
              <Image source={httpsUrl(user.profile_picture)} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
            ) : (
              <Text style={s.avatarText}>{(user?.name?.[0] ?? 'A').toUpperCase()}</Text>
            )}
          </Pressable>
          <View style={{ flex: 1, gap: 6 }}>
            <Text style={s.name} numberOfLines={2}>
              {fullName}
            </Text>
            <Label size={10}>{user?.phone ?? ''}</Label>
          </View>
          <Pressable
            onPress={() => router.push('/profile-edit')}
            hitSlop={8}
            style={({ pressed }) => [s.editBtn, pressed && { opacity: 0.7 }]}
            accessibilityLabel={t('Tahrirlash')}>
            <Text style={[label(9.5), { color: c.text }]}>{t('Tahrirlash')}</Text>
          </Pressable>
        </View>

        <View style={s.stats}>
          <Stat value={orders?.length ?? '–'} title={t('Buyurtmalar')} onPress={() => router.push('/orders')} />
          <Stat value={favCount} title={t('Sevimlilar')} onPress={() => router.push('/favorites')} />
          <Stat value={inCart} title={t('Savatda')} onPress={() => router.navigate('/cart')} />
        </View>

        {toPay > 0 && (
          <Pressable onPress={() => router.push('/orders')} style={({ pressed }) => [s.alert, pressed && { opacity: 0.85 }]}>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={[label(10), { color: c.star }]}>{t("To'lov kutilmoqda")}</Text>
              <Text style={{ color: c.text, fontSize: 14 }}>{t("{n} ta buyurtma tasdiqlandi — to'lov qiling", { n: toPay })}</Text>
            </View>
            <Text style={{ color: c.text, fontSize: 18 }}>→</Text>
          </Pressable>
        )}

        <Section title={t('Xaridlar')}>
          <Row icon="▤" title={t('Buyurtmalarim')} onPress={() => router.push('/orders')} badge={toPay || undefined} />
          <Row icon="♡" title={t('Sevimlilar')} onPress={() => router.push('/favorites')} />
          <Row icon="◈" title={t("Kiyib ko'rish tarixi")} onPress={() => router.push('/tryon-history')} />
          <Row icon="★" title={t('Mening sharhlarim')} onPress={() => router.push('/my-reviews')} />
          <Row icon="⌕" title={t("Mahsulot so'rash")} onPress={() => router.push({ pathname: '/chat', params: { kind: 'ask' } })} last />
        </Section>

        {!!user?.referralCode && (
          <Pressable onPress={invite} style={({ pressed }) => [s.invite, { backgroundImage: c.heroBg }, pressed && { opacity: 0.85 }]}>
            <View style={{ flex: 1, gap: 6 }}>
              <Text style={[label(10), { color: 'rgba(239,232,219,0.6)' }]}>AKBW Club</Text>
              <Text style={s.inviteTitle}>{t("Do'stlarni taklif qiling")}</Text>
              <Text style={{ color: 'rgba(239,232,219,0.7)', fontSize: 13 }}>
                {t('Taklif kodingiz')}: <Text style={{ color: '#EFE8DB', fontWeight: '600', fontSize: 11 }} selectable>{user.referralCode}</Text>
              </Text>
            </View>
            <Text style={[label(10), { color: '#EFE8DB' }]}>{t('Ulashish')} ↗</Text>
          </Pressable>
        )}

        {settings}
        {help}
        {legal}

        <View style={{ paddingHorizontal: 16, marginTop: 26 }}>
          <Button
            title={t('Chiqish')}
            variant="ghost"
            onPress={() =>
              Alert.alert(t('Profildan chiqasizmi?'), undefined, [
                { text: t('Bekor'), style: 'cancel' },
                { text: t('Chiqish'), style: 'destructive', onPress: () => logout() },
              ])
            }
          />
          <Pressable
            onPress={deleteAccount}
            disabled={deleting}
            style={({ pressed }) => [s.dangerBtn, (pressed || deleting) && { opacity: 0.6 }]}>
            <Text style={[label(11.5), { color: c.sale }]}>{t("Akkauntni o'chirish")}</Text>
          </Pressable>
        </View>
        {footer}
      </ScrollView>
      {sheets}
    </Screen>
  );
}

function Stat({ value, title, onPress }: { value: number | string; title: string; onPress: () => void }) {
  const s = useStyles(mk);
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [s.stat, pressed && { opacity: 0.75 }]}>
      <Text style={s.statValue}>{value}</Text>
      <Label size={9}>{title}</Label>
    </Pressable>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const s = useStyles(mk);
  return (
    <View style={{ marginTop: 26, marginHorizontal: 16, gap: 10 }}>
      <Label style={{ paddingHorizontal: 4 }}>{title}</Label>
      <View style={s.list}>{children}</View>
    </View>
  );
}

function Row({
  icon,
  title,
  value,
  badge,
  onPress,
  last,
}: {
  icon: string;
  title: string;
  value?: string;
  badge?: number;
  onPress: () => void;
  last?: boolean;
}) {
  const c = useColors();
  const s = useStyles(mk);
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [s.row, last && { borderBottomWidth: 0 }, pressed && { backgroundColor: c.s2 }]}>
      <View style={s.icon}>
        <Text style={{ color: c.text, fontSize: 15 }}>{icon}</Text>
      </View>
      <Text style={s.rowText} numberOfLines={1}>
        {title}
      </Text>
      {!!badge && (
        <View style={s.badge}>
          <Text style={{ color: c.onIvory, fontSize: 11, fontWeight: '700' }}>{badge}</Text>
        </View>
      )}
      {!!value && (
        <Text style={s.rowValue} numberOfLines={1}>
          {value}
        </Text>
      )}
      <Text style={{ color: c.mute2, fontSize: 18 }}>›</Text>
    </Pressable>
  );
}

const mk = (c: Palette) =>
  StyleSheet.create({
    hero: { marginHorizontal: 16, borderRadius: 28, overflow: 'hidden', borderWidth: 1, borderColor: c.line, padding: 24, gap: 14, alignItems: 'center' },
    heroTitle: { fontFamily: F.serif, fontSize: 30, color: '#EFE8DB', marginTop: 6 },
    heroText: { textAlign: 'center', color: 'rgba(239,232,219,0.65)', fontSize: 14, lineHeight: 21 },
    heroBtn: { alignSelf: 'stretch', height: 50, borderRadius: 999, backgroundColor: '#EFE8DB', alignItems: 'center', justifyContent: 'center', marginTop: 6 },
    heroBtnGhost: { alignSelf: 'stretch', height: 50, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(239,232,219,0.35)', alignItems: 'center', justifyContent: 'center' },
    head: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, paddingVertical: 12 },
    avatar: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundImage: c.heroBg,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: c.line2,
      overflow: 'hidden',
    },
    avatarText: { color: '#EFE8DB', fontSize: 26, fontFamily: F.serif },
    name: { fontFamily: F.serif, fontSize: 22, lineHeight: 26, color: c.text },
    editBtn: { height: 36, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1, borderColor: c.line2, justifyContent: 'center' },
    stats: { flexDirection: 'row', gap: 8, marginHorizontal: 16, marginTop: 16 },
    stat: { flex: 1, backgroundColor: c.s1, borderRadius: 20, borderWidth: 1, borderColor: c.line, paddingVertical: 16, alignItems: 'center', gap: 6 },
    statValue: { fontFamily: F.serif, fontSize: 28, color: c.text },
    alert: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginHorizontal: 16,
      marginTop: 14,
      padding: 16,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: c.star,
      backgroundColor: c.s1,
    },
    list: { backgroundColor: c.s1, borderRadius: 22, borderWidth: 1, borderColor: c.line, overflow: 'hidden' },
    row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, height: 58, borderBottomWidth: 1, borderBottomColor: c.line },
    icon: { width: 32, height: 32, borderRadius: 10, backgroundColor: c.s2, alignItems: 'center', justifyContent: 'center' },
    rowText: { flex: 1, fontSize: 15, color: c.text },
    rowValue: { fontSize: 13, color: c.mute, maxWidth: 160 },
    badge: { minWidth: 20, height: 20, borderRadius: 10, paddingHorizontal: 6, backgroundColor: c.ivory, alignItems: 'center', justifyContent: 'center' },
    invite: { flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: 16, marginTop: 26, padding: 20, borderRadius: 24, borderWidth: 1, borderColor: c.line, overflow: 'hidden' },
    inviteTitle: { fontFamily: F.serif, fontSize: 22, color: '#EFE8DB' },
    dangerBtn: { height: 50, marginTop: 12, borderRadius: 999, borderWidth: 1, borderColor: c.sale, alignItems: 'center', justifyContent: 'center' },
    version: { textAlign: 'center', color: c.mute2, fontSize: 11, marginTop: 26, letterSpacing: 1 },
  });
