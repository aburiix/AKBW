/**
 * Rang nomini CSS rangiga aylantiradi. Admin panelda rang "Qora", "Чёрный"
 * yoki "#111" ko'rinishida kiritilishi mumkin — hammasi to'g'ri ko'rinadi.
 */
const MAP: Record<string, string> = {
  qora: '#111111',
  чёрный: '#111111',
  черный: '#111111',
  black: '#111111',
  oq: '#f1eee8',
  белый: '#f1eee8',
  white: '#f1eee8',
  bej: '#cbbfa8',
  бежевый: '#cbbfa8',
  beige: '#cbbfa8',
  kulrang: '#8d8a83',
  серый: '#8d8a83',
  gray: '#8d8a83',
  grey: '#8d8a83',
  zaytun: '#6b6e5f',
  оливковый: '#6b6e5f',
  olive: '#6b6e5f',
  jigarrang: '#7a5233',
  коричневый: '#7a5233',
  brown: '#7a5233',
  qizil: '#b23a30',
  красный: '#b23a30',
  red: '#b23a30',
  "ko'k": '#2f4a7a',
  синий: '#2f4a7a',
  blue: '#2f4a7a',
  havorang: '#8fb3d9',
  голубой: '#8fb3d9',
  yashil: '#3f6b4a',
  зелёный: '#3f6b4a',
  зеленый: '#3f6b4a',
  green: '#3f6b4a',
  sariq: '#e2c25a',
  жёлтый: '#e2c25a',
  желтый: '#e2c25a',
  yellow: '#e2c25a',
  pushti: '#e4a6b5',
  розовый: '#e4a6b5',
  pink: '#e4a6b5',
  "to'q ko'k": '#1f2d4a',
  navy: '#1f2d4a',
  qaymoq: '#efe6d2',
  krem: '#efe6d2',
  cream: '#efe6d2',
};

export function colorToCss(name?: string | null): string {
  if (!name) return 'transparent';
  const key = name
    .trim()
    .toLowerCase()
    .replace(/[‘’`ʻʼ]/g, "'");
  return MAP[key] ?? name;
}
