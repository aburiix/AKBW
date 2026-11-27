#!/usr/bin/env bash
# BTS yetkazib berish sozlamalarini serverga yozadi (parol ekranda ko'rinmaydi) va serverni qayta ishga tushiradi.
# Ishga tushirish:  bash deploy/set-bts.sh
set -euo pipefail

HOST="deploy@45.138.159.81"
KEY="$HOME/.ssh/akbw_ci"
ENV_FILE="/opt/akbw-env/server.env"

echo "BTS sozlamalari (BTS bergan ma'lumotlar):"
read -r -p "API manzili [https://apitest.bts.uz:28345 — test]: " BASE
BASE="${BASE:-https://apitest.bts.uz:28345}"
read -r -p "Login: " LOGIN
read -r -s -p "Parol (ko'rinmaydi): " PASS; echo
read -r -p "Jo'natuvchi telefon (998901234567): " SENDER

if [[ -z "$LOGIN" || -z "$PASS" ]]; then
  echo "Login va parol bo'sh bo'lmasligi kerak." >&2
  exit 1
fi

# Qiymatlar buyruq qatoriga emas, stdin orqali uzatiladi (jarayonlar ro'yxatida ko'rinmaydi)
printf 'BTS_BASE_URL=%s\nBTS_LOGIN=%s\nBTS_PASSWORD=%s\nBTS_SENDER_PHONE=%s\n' "$BASE" "$LOGIN" "$PASS" "$SENDER" |
  ssh -i "$KEY" "$HOST" "
    set -e
    umask 077
    tmp=\$(mktemp)
    cat > \$tmp.new
    grep -v '^BTS_\(BASE_URL\|LOGIN\|PASSWORD\|SENDER_PHONE\)=' $ENV_FILE > \$tmp || true
    cat \$tmp.new >> \$tmp
    cp $ENV_FILE $ENV_FILE.bak
    cat \$tmp > $ENV_FILE
    rm -f \$tmp \$tmp.new
    cd /opt/akbw/deploy && docker compose up -d --force-recreate server >/dev/null 2>&1
    echo 'Server qayta ishga tushdi.'
  "

unset PASS
echo "Tayyor. Tekshirish: https://api.akbw.uz/api/delivery/regions"
