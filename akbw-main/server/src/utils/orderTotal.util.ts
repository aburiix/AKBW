/**
 * Buyurtma summasi (so'm): har bir mahsulot o'z chegirmasi (discount %) bilan,
 * so'ng butun summaga promokod chegirmasi (%). Yaxlitlash — har bosqichda butun so'mga.
 * Sayt va ilova savatda aynan shu formulani ko'rsatadi.
 */
export function computeOrderTotal(
  items: { productId: number; quantity: number }[],
  products: { id: number; price: number; discount?: number | null }[],
  couponDiscount = 0,
): number {
  const subtotal = items.reduce((acc, item) => {
    const p = products.find((x) => x.id === item.productId);
    if (!p) return acc;
    const unit = Math.round(p.price * (1 - clampPct(p.discount ?? 0) / 100));
    return acc + unit * Math.max(0, Math.floor(item.quantity));
  }, 0);
  return Math.round(subtotal * (1 - clampPct(couponDiscount) / 100));
}

const clampPct = (n: number) => Math.min(100, Math.max(0, Number(n) || 0));
