import { FlatList, Text, useWindowDimensions } from 'react-native';
import { useT } from '@/lib/i18n';
import { ProductCard } from '@/components/ProductCard';
import { useFavorites } from '@/lib/favorites';
import { useColors } from '@/lib/theme';

export default function Favorites() {
  const t = useT();
  const c = useColors();
  const { width } = useWindowDimensions();
  const items = useFavorites((s) => s.items);
  const cardW = (width - 32 - 12) / 2;
  return (
    <FlatList
      style={{ backgroundColor: c.bg }}
      data={items}
      numColumns={2}
      keyExtractor={(p) => String(p.id)}
      columnWrapperStyle={{ gap: 12, paddingHorizontal: 16 }}
      contentContainerStyle={{ gap: 20, paddingVertical: 16 }}
      renderItem={({ item }) => <ProductCard product={item} width={cardW} />}
      ListEmptyComponent={
        <Text style={{ textAlign: 'center', color: c.mute, marginTop: 60, paddingHorizontal: 24 }}>
          {t("Sevimlilar bo'sh. Mahsulot sahifasidagi ♡ tugmasini bosing.")}
        </Text>
      }
    />
  );
}
