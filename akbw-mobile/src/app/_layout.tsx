import { useFonts } from 'expo-font';
import { useT } from '@/lib/i18n';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Appearance, Platform } from 'react-native';
import { useAuth } from '@/lib/auth';
import { F, useColors, useThemeMode } from '@/lib/theme';
import { installGlobalErrorHandlers } from '@/lib/notify';
import { Toasts } from '@/components/Toasts';

SplashScreen.preventAutoHideAsync();
// Har qanday kutilmagan xato foydalanuvchiga xabar bilan ko'rsatiladi
installGlobalErrorHandlers();

export default function RootLayout() {
  const t = useT();
  const c = useColors();
  const [fontsLoaded, fontError] = useFonts({
    Kenao: require('../../assets/fonts/Kenao.otf'),
    DidotBold: require('../../assets/fonts/DidotBold.otf'),
    Futura: require('../../assets/fonts/futuralight.ttf'),
  });
  const ready = useAuth((s) => s.ready);
  const mode = useThemeMode((s) => s.mode);

  // Tanlangan rejimni tizim komponentlariga ham beramiz (pastki menyu, klaviatura, alertlar).
  useEffect(() => {
    if (Platform.OS !== 'web') Appearance.setColorScheme(mode === 'system' ? 'unspecified' : mode);
  }, [mode]);

  useEffect(() => {
    useAuth.getState().hydrate();
  }, []);

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(c.bg).catch(() => {});
  }, [c.bg]);

  const done = (fontsLoaded || !!fontError) && ready;
  useEffect(() => {
    if (done) SplashScreen.hideAsync();
  }, [done]);

  if (!done) return null;

  const base = c.scheme === 'dark' ? DarkTheme : DefaultTheme;
  const navTheme = {
    ...base,
    colors: { ...base.colors, background: c.bg, card: c.bg, text: c.text, border: c.line, primary: c.text },
  };

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: c.bg }}>
    <ThemeProvider value={navTheme}>
      <StatusBar style={c.scheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: c.bg },
          headerTintColor: c.text,
          headerShadowVisible: false,
          headerStyle: { backgroundColor: c.bg },
          headerTitleStyle: { fontFamily: F.label, fontSize: 12, color: c.text },
          headerBackButtonDisplayMode: 'minimal',
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="product/[id]" options={{ title: '', headerTransparent: true, headerStyle: { backgroundColor: 'transparent' } }} />
        <Stack.Screen name="login" options={{ presentation: 'modal', title: t("KIRISH") }} />
        <Stack.Screen name="checkout" options={{ title: t("BUYURTMA BERISH") }} />
        <Stack.Screen name="orders" options={{ title: t("BUYURTMALARIM") }} />
        <Stack.Screen name="favorites" options={{ title: t("SEVIMLILAR") }} />
        <Stack.Screen name="tryon" options={{ title: t("KIYIB KO'RISH") }} />
        <Stack.Screen name="profile-edit" options={{ title: t('PROFILNI TAHRIRLASH') }} />
        <Stack.Screen name="notifications" options={{ title: t('BILDIRISHNOMALAR') }} />
        <Stack.Screen name="contact" options={{ title: t("BOG'LANISH") }} />
        <Stack.Screen name="my-reviews" options={{ title: t('MENING SHARHLARIM') }} />
        <Stack.Screen name="about" options={{ title: t('BIZ HAQIMIZDA') }} />
        <Stack.Screen name="legal" options={{ title: '' }} />
        <Stack.Screen name="chat" options={{ title: '' }} />
        <Stack.Screen name="tryon-history" options={{ title: t("KIYIB KO'RISH TARIXI") }} />
      </Stack>
      <Toasts />
    </ThemeProvider>
    </GestureHandlerRootView>
  );
}

