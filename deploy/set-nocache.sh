#!/usr/bin/env bash
# akbw.uz sahifalari (HTML) uchun brauzer/Telegram keshini o'chiradi: har ochilganda yangi versiya so'raladi.
# Rasm, shrift va JS (/_next/static) keshda qoladi — sayt sekinlashmaydi.
# Ishga tushirish:  bash deploy/set-nocache.sh   (administrator — root, ~/.ssh/akbw_vps kaliti bilan; parol kerak emas)
set -euo pipefail

HOST="root@45.138.159.81"
KEY="$HOME/.ssh/akbw_vps"

REMOTE=$(cat <<'EOS'
set -euo pipefail
CONF=/etc/nginx/sites-available/akbw.conf
if grep -q 'no-cache, must-revalidate' "$CONF"; then
  echo "Allaqachon sozlangan."
  exit 0
fi
cp "$CONF" "$CONF.bak-nocache"
# "location / {" ichidagi 127.0.0.1:3000 (sayt) proxy_pass'dan keyin no-cache sarlavhalarini qo'shadi.
# /_next/static/ va boshqa bloklarga tegmaydi.
awk '
  /location[ \t]+\/[ \t]*\{/ { inroot=1 }
  { print }
  inroot && /proxy_pass[ \t]+http:\/\/127\.0\.0\.1:3000;/ {
    print "        # HTML har safar yangilansin (Telegram/brauzer eski nusxani korsatmasin)";
    print "        proxy_hide_header Cache-Control;";
    print "        add_header Cache-Control \"no-cache, must-revalidate\" always;";
    print "        add_header X-Content-Type-Options nosniff always;";
    print "        add_header Referrer-Policy strict-origin-when-cross-origin always;";
  }
  /\}/ { inroot=0 }
' "$CONF.bak-nocache" > "$CONF.new"
mv "$CONF.new" "$CONF"
if nginx -t; then
  systemctl reload nginx
  echo "Tayyor: nginx qayta yuklandi."
else
  echo "nginx tekshiruvdan o'tmadi — eski sozlama qaytarildi." >&2
  cp "$CONF.bak-nocache" "$CONF"
  exit 1
fi
EOS
)

printf '%s\n' "$REMOTE" | ssh -i "$KEY" "$HOST" 'bash -s'
echo "Tekshirish: curl -sI https://akbw.uz/uz | grep -i cache-control"
