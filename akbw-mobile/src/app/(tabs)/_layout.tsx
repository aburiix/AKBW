import { NativeTabs } from 'expo-router/native-tabs';
import { useT } from '@/lib/i18n';
import { cartCount, useCart } from '@/lib/cart';
import { F, useColors } from '@/lib/theme';

export default function TabsLayout() {
  const t = useT();
  const c = useColors();
  const count = useCart((s) => cartCount(s.items));
  return (
    <NativeTabs
      tintColor={c.text}
      iconColor={{ default: c.mute2, selected: c.text }}
      backgroundColor={c.bg}
      badgeBackgroundColor={c.ivory}
      badgeTextColor={c.onIvory}
      labelStyle={{ default: { color: c.mute2, fontFamily: F.label, fontSize: 9 }, selected: { color: c.text, fontFamily: F.label, fontSize: 9 } }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>{t("ASOSIY")}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'house', selected: 'house.fill' }} md="home" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="catalog">
        <NativeTabs.Trigger.Label>{t("KATALOG")}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="square.grid.2x2" md="grid_view" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="ai">
        <NativeTabs.Trigger.Label>AI</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="sparkles" md="auto_awesome" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="cart">
        <NativeTabs.Trigger.Label>{t("SAVAT")}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'bag', selected: 'bag.fill' }} md="shopping_bag" />
        {count > 0 && <NativeTabs.Trigger.Badge>{String(count)}</NativeTabs.Trigger.Badge>}
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Label>{t("PROFIL")}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'person', selected: 'person.fill' }} md="person" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
