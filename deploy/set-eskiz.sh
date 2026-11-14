#!/usr/bin/env bash
# Eskiz (SMS) login ma'lumotlarini server.env ga yozadi va serverni qayta ishga tushiradi.
# Root sifatida:  bash /opt/akbw/deploy/set-eskiz.sh
# Qiymatlar ekranga chiqmaydi va hech qayerga loglanmaydi.
set -euo pipefail
ENV=/opt/akbw-env/server.env
BASE=$(grep -E '^ESKIZ_BASE_URL=' "$ENV" | cut -d= -f2- || true)
BASE=${BASE:-https://notify.eskiz.uz/api}

read -rp  "Eskiz email: " EMAIL
read -rsp "Eskiz parol (ko'rinmaydi): " PASS; echo
[ -n "$EMAIL" ] && [ -n "$PASS" ] || { echo "Bo'sh qiymat — bekor qilindi."; exit 1; }

echo "== Eskiz'ga ulanib tekshirilmoqda…"
code=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$BASE/auth/login" \
  --data-urlencode "email=$EMAIL" --data-urlencode "password=$PASS")
if [ "$code" != "200" ]; then
  echo "XATO: Eskiz login qabul qilmadi (HTTP $code). Email/parolni tekshiring. server.env o'zgarmadi."
  exit 1
fi
echo "Eskiz login: OK"

cp "$ENV" "$ENV.bak"
ESKIZ_USERNAME="$EMAIL" ESKIZ_PASSWORD="$PASS" python3 - "$ENV" <<'PY'
import os, sys
p = sys.argv[1]
want = {"ESKIZ_USERNAME": os.environ["ESKIZ_USERNAME"], "ESKIZ_PASSWORD": os.environ["ESKIZ_PASSWORD"]}
lines, seen = [], set()
for line in open(p).read().splitlines():
    k = line.split("=", 1)[0]
    if k in want:
        lines.append(f"{k}={want[k]}"); seen.add(k)
    else:
        lines.append(line)
lines += [f"{k}={v}" for k, v in want.items() if k not in seen]
open(p, "w").write("\n".join(lines) + "\n")
PY
chmod 600 "$ENV"; chown deploy:deploy "$ENV"; rm -f "$ENV.bak"
echo "server.env yangilandi."

echo "== Server qayta ishga tushirilmoqda…"
cd /opt/akbw/deploy && docker compose up -d --force-recreate server >/dev/null 2>&1
sleep 12
docker compose ps server --format '{{.Service}}: {{.Status}}'
echo "TAYYOR. Endi saytda o'z raqamingiz bilan ro'yxatdan o'tib ko'ring."
