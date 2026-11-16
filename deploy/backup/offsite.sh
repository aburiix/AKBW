#!/bin/sh
# Nusxalarni serverdan TASHQARIGA ko'chirish (VPS buzilsa ham ma'lumot qoladi).
# Bir martalik sozlash (serverda): apt install rclone && rclone config   → masalan "akbw-offsite" nomli remote
# (Backblaze B2 / Cloudflare R2 / Google Drive). Keyin root crontab'ga:
#   30 22 * * * OFFSITE_REMOTE=akbw-offsite:akbw-backups sh /opt/akbw/deploy/backup/offsite.sh >> /var/log/akbw-offsite.log 2>&1
set -eu
: "${OFFSITE_REMOTE:?OFFSITE_REMOTE berilmagan, masalan akbw-offsite:akbw-backups}"
command -v rclone >/dev/null || { echo "rclone o'rnatilmagan"; exit 1; }
rclone copy /opt/akbw-backups "$OFFSITE_REMOTE" --include 'akbw_*' --max-age 48h
rclone delete "$OFFSITE_REMOTE" --min-age 60d
echo "offsite OK $(date -u)"
