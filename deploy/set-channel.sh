#!/usr/bin/env bash
# Telegram kanalga mahsulot post qilishni yoqadi.
# Do'kon botining kaliti serverdagi shop-bot.env dan ko'chiriladi (hech qayerda ko'rinmaydi) — faqat kanal nomi so'raladi.
# Oldin: do'kon botini kanalga ADMIN qilib qo'shing ("Post yuborish" va "Postlarni tahrirlash" huquqi bilan).
# Ishga tushirish:  bash deploy/set-channel.sh
set -euo pipefail

HOST="deploy@45.138.159.81"
KEY="$HOME/.ssh/akbw_ci"

read -r -p "Kanal (masalan @akbwuz yoki -100…): " CH
CH="$(printf '%s' "$CH" | tr -d '[:space:]')"
CH="${CH#https://t.me/}"
if [[ -z "$CH" ]]; then
  echo "Kanal bo'sh bo'lmasligi kerak." >&2
  exit 1
fi
if [[ "$CH" != @* && "$CH" != -100* ]]; then
  CH="@$CH"
fi
if [[ ! "$CH" =~ ^(@[A-Za-z0-9_]{4,64}|-100[0-9]{5,20})$ ]]; then
  echo "Kanal nomi noto'g'ri: $CH" >&2
  exit 1
fi

REMOTE=$(cat <<'EOS'
set -euo pipefail
umask 077
CH="$1"
ENV=/opt/akbw-env/server.env
TOKEN=$(grep '^SHOP_BOT_TOKEN=' /opt/akbw-env/shop-bot.env | tail -1 | cut -d= -f2- | tr -d "\"' \t\r")
if [ -z "$TOKEN" ]; then echo "shop-bot.env da SHOP_BOT_TOKEN topilmadi." >&2; exit 1; fi

# Tekshiruv: bot kanalda admin-mi va post yubora oladimi (faqat holat chiqariladi, kalit emas)
ME=$(curl -s "https://api.telegram.org/bot$TOKEN/getMe" | sed -n 's/.*"id":\([0-9]*\).*/\1/p' | head -1)
R=$(curl -s --data-urlencode "chat_id=$CH" --data-urlencode "user_id=$ME" "https://api.telegram.org/bot$TOKEN/getChatMember")
STATUS=$(printf '%s' "$R" | sed -n 's/.*"status":"\([a-z]*\)".*/\1/p')
CANPOST=$(printf '%s' "$R" | grep -o '"can_post_messages":true' || true)
if [ "$STATUS" != "administrator" ] || [ -z "$CANPOST" ]; then
  echo "Bot kanalda admin emas yoki post yuborish huquqi yo'q (holat: ${STATUS:-topilmadi})." >&2
  echo "Do'kon botini kanalga admin qilib qo'shing va qayta ishga tushiring." >&2
  exit 1
fi

tmp=$(mktemp)
grep -v '^\(CHANNEL_BOT_TOKEN\|CHANNEL_ID\|SITE_URL\)=' "$ENV" > "$tmp" || true
printf 'CHANNEL_BOT_TOKEN=%s\nCHANNEL_ID=%s\nSITE_URL=https://akbw.uz\n' "$TOKEN" "$CH" >> "$tmp"
cp "$ENV" "$ENV.bak"
cat "$tmp" > "$ENV"
rm -f "$tmp"
cd /opt/akbw/deploy && docker compose up -d --force-recreate server >/dev/null 2>&1
echo "Tayyor: kanal $CH ulandi, server qayta ishga tushdi."
EOS
)

printf '%s\n' "$REMOTE" | ssh -i "$KEY" "$HOST" bash -s -- "$CH"
echo "Admin panel → Mahsulotlar → ⋯ → \"Kanalga yuborish\", yoki yangi mahsulotda \"Telegram kanalga yuborish\" belgisi."
