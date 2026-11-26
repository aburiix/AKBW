import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { finalPrice, formatPrice } from '@/lib/format';
import { label, useStyles, type Palette } from '@/lib/theme';
import type { Product } from '@/lib/types';

/** Saytdagi mahsulot kartasi: 3:4 rasm, sale yorlig'i, kategoriya yorlig'i, nom, narx. */
export function ProductCard({ product, width }: { product: Product; width: number }) {
  const s = useStyles(mk);
  const price = finalPrice(product.price, product.discount);
  const cat = product.categories?.[0]?.name;
  return (
    <Link href={{ pathname: '/product/[id]', params: { id: String(product.id) } }} asChild>
      <Pressable style={({ pressed }) => [{ width, gap: 10 }, pressed && { opacity: 0.8 }]}>
        <View style={[s.imgWrap, { width, height: (width * 4) / 3 }]}>
          <Image source={product.product_images?.[0]} style={StyleSheet.absoluteFill} contentFit="cover" transition={250} />
          {product.discount > 0 && (
            <View style={s.badge}>
              <Text style={s.badgeText}>-{product.discount}%</Text>
            </View>
          )}
        </View>
        <View style={{ gap: 4, paddingHorizontal: 2 }}>
          {!!cat && <Text style={s.cat}>{cat}</Text>}
          <Text style={s.name} numberOfLines={1}>
            {product.name}
          </Text>
          <View style={s.row}>
            <Text style={s.price}>{formatPrice(price)}</Text>
            {product.discount > 0 && <Text style={s.old}>{formatPrice(product.price)}</Text>}
          </View>
        </View>
      </Pressable>
    </Link>
  );
}

const mk = (c: Palette) =>
  StyleSheet.create({
    imgWrap: { borderRadius: 16, overflow: 'hidden', backgroundColor: c.s2 },
    badge: { position: 'absolute', top: 10, left: 10, height: 24, paddingHorizontal: 10, borderRadius: 999, backgroundColor: c.sale, justifyContent: 'center' },
    badgeText: { color: '#0E0D0B', fontSize: 11, fontWeight: '600' },
    cat: { ...label(9.5), color: c.mute2 },
    name: { fontSize: 14, color: c.text },
    row: { flexDirection: 'row', alignItems: 'baseline', gap: 6, flexWrap: 'wrap' },
    price: { fontSize: 13, color: c.mute },
    old: { fontSize: 12, color: c.mute2, textDecorationLine: 'line-through' },
  });
