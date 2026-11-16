#!/usr/bin/env bash
# Admin panel uchun birinchi (SuperAdmin) akkauntni yaratadi yoki parolini yangilaydi.
# Root sifatida:  bash /opt/akbw/deploy/set-admin.sh
# Parol ekranga chiqmaydi va loglanmaydi.
set -euo pipefail
ENV=/opt/akbw-env/server.env

read -rp  "Admin ismi (masalan: Abdulloh): " NAME
read -rp  "Admin telefoni (+998 90 123 45 67): " PHONE_RAW
DIGITS=$(printf '%s' "$PHONE_RAW" | tr -cd '0-9')
[ ${#DIGITS} -eq 9 ] && DIGITS="998$DIGITS"
if [ ${#DIGITS} -ne 12 ] || [ "${DIGITS:0:3}" != "998" ]; then
  echo "XATO: telefon raqami noto'g'ri. Masalan: +998 90 123 45 67"; exit 1
fi
PHONE="+$DIGITS"

read -rsp "Parol (kamida 10 belgi, ko'rinmaydi): " P1; echo
read -rsp "Parolni qayta kiriting: " P2; echo
[ "$P1" = "$P2" ] || { echo "XATO: parollar mos emas."; exit 1; }
[ ${#P1} -ge 10 ] || { echo "XATO: parol kamida 10 belgi bo'lsin."; exit 1; }

ADMIN_NAME="${NAME:-Admin}" ADMIN_PHONE="$PHONE" ADMIN_PASSWORD="$P1" python3 - "$ENV" <<'PY'
import os, sys
p = sys.argv[1]
want = {k: os.environ[k] for k in ("ADMIN_NAME", "ADMIN_PHONE", "ADMIN_PASSWORD")}
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

echo "== Server qayta ishga tushirilmoqda…"
cd /opt/akbw/deploy && docker compose up -d --force-recreate server >/dev/null 2>&1
sleep 15
if docker compose logs --since 1m server 2>&1 | grep -qE "First admin created|Admin password synced"; then
  echo "Admin akkaunt tayyor."
else
  echo "Diqqat: tasdiq logda topilmadi — 'docker compose logs server' ni tekshiring."
fi
echo
echo "TAYYOR. Kirish: https://admin.akbw.uz"
echo "  Telefon: $PHONE   (aynan shu ko'rinishda, bo'shliqsiz yozing)"
echo "  Parol:   hozir kiritgan parolingiz"
