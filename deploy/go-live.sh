#!/usr/bin/env bash
# akbw.uz ga o'tish (DNS 45.138.159.81 ga yo'naltirilgandan keyin, root sifatida):
#   bash /opt/akbw/deploy/go-live.sh you@email.com
# 1) DNS tekshiruvi  2) SSL (Let's Encrypt)  3) client/admin'ni akbw.uz API bilan qayta build  4) shop-bot -> akbw.uz
set -euo pipefail
EMAIL="${1:-}"
IP=45.138.159.81
DOMAINS=(akbw.uz www.akbw.uz api.akbw.uz admin.akbw.uz)

echo "== DNS tekshiruvi (har biri $IP bo'lishi kerak)"
bad=0
for d in "${DOMAINS[@]}"; do
  got=$(dig +short @1.1.1.1 "$d" A | tail -1)
  echo "$d -> ${got:-topilmadi}"
  [ "$got" = "$IP" ] || bad=1
done
if [ "$bad" = 1 ]; then
  echo "XATO: hamma domenlar $IP ga qaramayapti (Cloudflare'da 'DNS only' — kulrang bulut bo'lishi kerak)." >&2
  exit 1
fi

echo "== SSL"
args=(--nginx --non-interactive --agree-tos --redirect)
if [ -n "$EMAIL" ]; then args+=(-m "$EMAIL"); else args+=(--register-unsafely-without-email); fi
for d in "${DOMAINS[@]}"; do args+=(-d "$d"); done
certbot "${args[@]}"

echo "== Ilovalarni akbw.uz uchun qayta build"
cd /opt/akbw/deploy
echo "PUBLIC_API_URL=https://api.akbw.uz/api" > .env
chown deploy:deploy .env
sed -i 's|^WEBAPP_URL=.*|WEBAPP_URL=https://akbw.uz|' /opt/akbw-env/shop-bot.env
sudo -u deploy bash /opt/akbw/deploy/deploy.sh

echo "== TAYYOR: https://akbw.uz"
