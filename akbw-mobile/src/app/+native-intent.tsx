import { useLang, type Lang } from '@/lib/i18n';

/**
 * akbw.uz havolalarini ilova sahifalariga aylantiradi (Universal Links / App Links).
 * Masalan Google'dan https://akbw.uz/ru/product/5 bosilsa — ilova ochilib, 5-mahsulot ko'rsatiladi
 * va til ruscha bo'ladi. Ilova faqat haqiqiy build'da (TestFlight/App Store) akbw.uz havolalarini oladi;
 * buning uchun saytga apple-app-site-association va assetlinks.json qo'yiladi (Apple Team ID kerak).
 */
const MAP: [RegExp, (m: RegExpMatchArray) => string][] = [
  [/^\/product\/(\d+)/, (m) => `/product/${m[1]}`],
  [/^\/(filters|search|new|best)(\/|$)/, () => '/catalog'],
  [/^\/cart(\/|$)/, () => '/cart'],
  [/^\/favorites(\/|$)/, () => '/favorites'],
  [/^\/try-on(\/|$)/, () => '/catalog'],
  [/^\/about(\/|$)/, () => '/about'],
  [/^\/contact(\/|$)/, () => '/contact'],
  [/^\/terms(\/|$)/, () => '/legal?doc=terms'],
  [/^\/privacy(\/|$)/, () => '/legal?doc=privacy'],
  [/^\/profile(\/|$)/, () => '/profile'],
  [/^\/(orders|tryon-history|profile-edit|notifications|my-reviews)(\/|$)/, (m) => `/${m[1]}`],
  [/^\/chat(\/|$)/, (m) => `/chat${m.input?.includes('kind=ask') ? '?kind=ask' : '?kind=help'}`],
  [/^\/?$/, () => '/'],
];

export function redirectSystemPath({ path }: { path: string; initial: boolean }): string {
  try {
    // to'liq havola (https://akbw.uz/..., akbw://..., exp://host/--/...) bo'lsa faqat yo'lini olamiz
    const url = path.includes('://') ? new URL(path) : null;
    let p = url ? url.pathname + url.search : path;
    if (path.startsWith('akbw://')) p = '/' + path.slice('akbw://'.length).replace(/^\/+/, '');
    p = p.replace(/^\/--(?=\/|$)/, '') || '/';
    if (!p.startsWith('/')) p = '/' + p;
    // til prefiksi: /uz, /ru, /en → ilova tili ham shunga o'tadi
    const lang = p.match(/^\/(uz|ru|en)(?=\/|$)/)?.[1] as Lang | undefined;
    if (lang) {
      useLang.getState().setLang(lang);
      p = p.slice(lang.length + 1) || '/';
    }
    // moslash yo'lning o'zi bo'yicha; m.input'da so'rov qismi ham qoladi (chat?kind=ask uchun)
    const [pathOnly] = p.split('?');
    for (const [re, to] of MAP) {
      const m = pathOnly.match(re);
      if (m) return to(Object.assign(m, { input: p }));
    }
    return p;
  } catch {
    return '/';
  }
}
