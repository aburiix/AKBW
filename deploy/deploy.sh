#!/usr/bin/env bash
# Serverda ishga tushiriladi (GitHub Actions yoki qo'lda): /opt/akbw/deploy/deploy.sh
# Yangi kodni build qiladi va konteynerlarni yangilaydi. Build xato bo'lsa — eski versiya ishlashda davom etadi.
set -euo pipefail
cd "$(dirname "$0")"
ENV_DIR=/opt/akbw-env

for f in db server bot shop-bot; do
  if [ ! -f "$ENV_DIR/$f.env" ]; then
    echo "XATO: $ENV_DIR/$f.env yo'q" >&2
    exit 1
  fi
done

services=(db server client admin)
# Botlar faqat tokeni yozilgan bo'lsa ishga tushadi
if grep -qE '^TELEGRAM_BOT_TOKEN=.+' "$ENV_DIR/bot.env"; then services+=(bot); else echo "!! bot: token yo'q — o'tkazib yuborildi"; fi
if grep -qE '^SHOP_BOT_TOKEN=.+' "$ENV_DIR/shop-bot.env"; then services+=(shop-bot); else echo "!! shop-bot: token yo'q — o'tkazib yuborildi"; fi

# Kichik server (4 GB RAM): build'lar navbat bilan
for svc in "${services[@]}"; do
  [ "$svc" = db ] || [ "$svc" = backup ] && continue
  echo "== build: $svc"
  docker compose build "$svc"
done

# Zaxira nusxa servisi (tayyor image, build kerak emas)
services+=(backup)

echo "== up: ${services[*]}"
docker compose up -d --remove-orphans "${services[@]}"

echo "== tozalash"
docker image prune -f >/dev/null

echo "== holat"
sleep 10
docker compose ps

# Sog'liq tekshiruvi
fail=0
for url in http://127.0.0.1:3000/uz http://127.0.0.1:3001 http://127.0.0.1:8000/api/product; do
  code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 30 "$url" || true)
  echo "$url -> $code"
  case "$code" in 2*|3*|401|404) ;; *) fail=1 ;; esac
done
# Zaxira nusxa oxirgi 26 soat ichida olinganmi
if [ -f /opt/akbw-backups/LAST_OK ]; then
  age=$(( $(date +%s) - $(cat /opt/akbw-backups/LAST_OK) ))
  if [ "$age" -gt 93600 ]; then echo "!! backup: oxirgi nusxa $((age/3600)) soat oldin"; else echo "backup OK ($((age/3600)) soat oldin)"; fi
else
  echo "!! backup: hali nusxa yo'q (akbw-backup konteyneri loglarini tekshiring)"
fi
exit $fail
