"""Saytdagi (akbw-main/client) huquqiy va "Biz haqimizda" matnlarini ilovaga ko'chiradi.
Ishga tushirish: python3 scripts/sync-site-text.py  → src/lib/siteText.ts
Matn faqat saytda tahrirlanadi, keyin shu skript qayta ishga tushiriladi — ikkalasi doim bir xil."""
import json, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[1]
MSG = ROOT.parent / 'akbw-main/client/src/shared/config/i18n/messages'
KEYS = ['AboutPage', 'TermsAndConditions', 'PrivacyPage']
out = {}
for lang in ('uz', 'ru', 'en'):
    d = json.loads((MSG / f'{lang}.json').read_text())
    out[lang] = {k: d[k] for k in KEYS}
    out[lang]['Faqs'] = d['ProductPage']['faqs']
    out[lang]['Consent'] = {
        'text': d['Login']['continue_terms_text'],
        'link': d['Login']['terms_link_text'],
    }
body = json.dumps(out, ensure_ascii=False, indent=2)
(ROOT / 'src/lib/siteText.ts').write_text(
    '// Avtomatik yaratilgan: scripts/sync-site-text.py (manba — sayt tarjimalari). Qo\'lda tahrirlamang.\n'
    f'export const SITE_TEXT = {body} as const;\n\n'
    'export type SiteLang = keyof typeof SITE_TEXT;\n'
)
print('ok', (ROOT / 'src/lib/siteText.ts').stat().st_size)
