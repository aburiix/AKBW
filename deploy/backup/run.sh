#!/bin/sh
# AKBW zaxira nusxa: har kuni baza (pg_dump) + yuklangan rasmlar (uploads).
# docker-compose'dagi `backup` servisi ichida ishlaydi. Nusxalar serverda /opt/akbw-backups ga tushadi.
#   BACKUP_HOUR      — soat (UTC), standart 21 (= Toshkent 02:00)
#   BACKUP_KEEP_DAYS — necha kun saqlanadi, standart 14
#   BACKUP_ONCE=1    — bir marta olib chiqib ketish (qo'lda tekshirish uchun)
set -eu

OUT=/backups
KEEP="${BACKUP_KEEP_DAYS:-14}"
HOUR="${BACKUP_HOUR:-21}"
export PGPASSWORD="${POSTGRES_PASSWORD:?POSTGRES_PASSWORD kerak (db.env)}"

take() {
  ts=$(date -u +%Y%m%d_%H%M%S)
  mkdir -p "$OUT"
  tmp="$OUT/.akbw_db_$ts.dump.part"
  # -Fc: siqilgan format, pg_restore bilan qisman tiklash ham mumkin
  if pg_dump -h db -U postgres -d akbw -Fc -f "$tmp"; then
    mv "$tmp" "$OUT/akbw_db_$ts.dump"
  else
    rm -f "$tmp"
    echo "[backup] XATO: pg_dump muvaffaqiyatsiz $(date -u)" >&2
    return 1
  fi
  if [ -d /uploads ]; then
    tar -czf "$OUT/akbw_uploads_$ts.tar.gz.part" -C /uploads . && mv "$OUT/akbw_uploads_$ts.tar.gz.part" "$OUT/akbw_uploads_$ts.tar.gz"
  fi
  find "$OUT" -maxdepth 1 -name 'akbw_*' -type f -mtime +"$KEEP" -delete
  # Bo'sh yoki juda kichik nusxa — signal
  size=$(wc -c < "$OUT/akbw_db_$ts.dump")
  [ "$size" -gt 1024 ] || echo "[backup] OGOHLANTIRISH: baza nusxasi juda kichik ($size bayt)" >&2
  date -u +%s > "$OUT/LAST_OK"
  echo "[backup] tayyor: akbw_db_$ts.dump ($size bayt) $(date -u)"
}

if [ "${BACKUP_ONCE:-0}" = "1" ]; then take; exit $?; fi

echo "[backup] ishga tushdi: har kuni soat $HOUR:00 UTC, $KEEP kun saqlanadi"
# Konteyner ishga tushganda bugun nusxa yo'q bo'lsa — darhol bittasini olamiz
if ! find "$OUT" -maxdepth 1 -name LAST_OK -mmin -1440 2>/dev/null | grep -q .; then take || true; fi
while true; do
  now_h=$(date -u +%H | sed 's/^0//'); now_m=$(date -u +%M | sed 's/^0//')
  # keyingi HOUR:00 gacha kutish
  secs=$(( ( (HOUR - ${now_h:-0} + 24) % 24 ) * 3600 - ${now_m:-0} * 60 ))
  [ "$secs" -le 0 ] && secs=$(( secs + 86400 ))
  sleep "$secs"
  take || true
done
