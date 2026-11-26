import { tr } from './i18n';

export function formatPrice(value: number): string {
  const n = Math.round(value);
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ' + tr("so'm");
}

export function finalPrice(price: number, discount?: number | null): number {
  if (!discount) return price;
  return Math.round(price * (1 - discount / 100));
}

/** "+998 90 123 45 67" — saytdagi kabi format (server shu ko'rinishda saqlaydi). */
export function formatPhone(input: string): string {
  const digits = input.replace(/\D/g, '').replace(/^998/, '').slice(0, 9);
  const parts = [digits.slice(0, 2), digits.slice(2, 5), digits.slice(5, 7), digits.slice(7, 9)].filter(Boolean);
  return '+998' + (parts.length ? ' ' + parts.join(' ') : '');
}

export function isPhoneComplete(phone: string): boolean {
  return /^\+998 \d{2} \d{3} \d{2} \d{2}$/.test(phone);
}
