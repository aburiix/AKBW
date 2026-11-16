#!/bin/sh
# Oxirgi zaxira nusxani VAQTINCHA bazaga tiklab ko'radi (production bazaga TEGMAYDI).
# Serverda: sudo sh /opt/akbw/deploy/backup/restore-test.sh
set -eu
DIR=/opt/akbw-backups
LAST=$(ls -1t "$DIR"/akbw_db_*.dump 2>/dev/null | head -1)
[ -n "$LAST" ] || { echo "Nusxa topilmadi: $DIR"; exit 1; }
echo "Tekshirilmoqda: $LAST"
docker run --rm -d --name akbw-restore-test -e POSTGRES_PASSWORD=test postgres:15-alpine >/dev/null
trap 'docker rm -f akbw-restore-test >/dev/null 2>&1' EXIT
until docker exec akbw-restore-test pg_isready -U postgres >/dev/null 2>&1; do sleep 1; done
docker exec akbw-restore-test createdb -U postgres akbw
docker cp "$LAST" akbw-restore-test:/tmp/db.dump
docker exec akbw-restore-test pg_restore -U postgres -d akbw --no-owner /tmp/db.dump
docker exec akbw-restore-test psql -U postgres -d akbw -tAc \
  'select '"'"'users='"'"'||(select count(*) from "User")||'"'"' orders='"'"'||(select count(*) from "Orders")||'"'"' products='"'"'||(select count(*) from "Products")'
echo "OK: nusxa tiklanadi."
