#!/usr/bin/env bash
# Claude API kalitini (AKBW yordamchi uchun) server.env ga yozadi va serverni qayta ishga tushiradi.
# Root sifatida:  bash /opt/akbw/deploy/set-anthropic.sh
# Kalit ekranga chiqmaydi va loglanmaydi.
set -euo pipefail
ENV=/opt/akbw-env/server.env

read -rsp "Anthropic API kalit (sk-ant-..., ko'rinmaydi): " KEY; echo
[ -n "$KEY" ] || { echo "Bo'sh — bekor qilindi."; exit 1; }

echo "== Kalit tekshirilmoqda (pulsiz so'rov)…"
code=$(curl -s -o /dev/null -w '%{http_code}' https://api.anthropic.com/v1/models \
  -H "x-api-key: $KEY" -H "anthropic-version: 2023-06-01")
if [ "$code" != "200" ]; then
  echo "XATO: kalit qabul qilinmadi (HTTP $code). server.env o'zgarmadi."
  exit 1
fi
echo "Kalit: OK"

ANTHROPIC_API_KEY="$KEY" python3 - "$ENV" <<'PY'
import os, sys
p = sys.argv[1]
want = {"ANTHROPIC_API_KEY": os.environ["ANTHROPIC_API_KEY"]}
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
chmod 600 "$ENV"; chown deploy:deploy "$ENV"
echo "server.env yangilandi."
cd /opt/akbw/deploy && docker compose up -d --force-recreate server >/dev/null 2>&1
sleep 12
docker compose ps server --format '{{.Service}}: {{.Status}}'
echo "TAYYOR. Saytda pastki o'ng burchakdagi 'AKBW yordamchi' ni oching."
