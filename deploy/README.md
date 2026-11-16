# AKBW — serverga chiqarish (VPS: 45.138.159.81, Ubuntu 20.04)

## Tuzilma (serverda)
| Yo'l | Nima |
|---|---|
| `/opt/akbw/` | Kod (GitHub Actions rsync qiladi) — `akbw-main/{client,server,admin,bot}`, `akbw-design/shop-bot`, `deploy/` |
| `/opt/akbw-env/*.env` | Maxfiy qiymatlar (faqat serverda, `chmod 600`). Kod yangilanganda tegilmaydi |
| `/etc/nginx/sites-available/akbw.conf` | Nginx (`deploy/nginx/akbw.conf` dan) |

Konteynerlar (`deploy/docker-compose.yml`): `db` (Postgres 15), `server` (API, 127.0.0.1:8000),
`client` (sayt, 127.0.0.1:3000), `admin` (127.0.0.1:3001), `bot`, `shop-bot`.
Portlar faqat 127.0.0.1 ga ochiq — tashqaridan faqat Nginx 80/443 orqali.

## Kirish
```bash
ssh -i ~/.ssh/akbw_vps root@45.138.159.81      # administrator
ssh -i ~/.ssh/akbw_ci deploy@45.138.159.81     # deploy (GitHub Actions ham shu kalit bilan)
```
Parol bilan kirish o'chirilgan.

## Xavfsizlik (`deploy/harden.sh`)
- SSH: faqat kalit, root faqat kalit bilan, `AllowUsers root deploy`, MaxAuthTries 3
- UFW: faqat 22, 80, 443
- fail2ban: sshd + nginx-limit-req
- unattended-upgrades (avtomatik xavfsizlik yangilanishlari), sysctl tarmoq himoyasi
- Docker log rotatsiyasi, `no-new-privileges`, 4 GB swap
- Nginx: `server_tokens off`, IP orqali kirish yopiq (444), API'da rate-limit

## Env fayllarni to'ldirish
```bash
ssh -i ~/.ssh/akbw_vps root@45.138.159.81
nano /opt/akbw-env/server.env     # to'lov, SMS (Eskiz), BTS, ADMIN_* ...
nano /opt/akbw-env/bot.env        # TELEGRAM_BOT_TOKEN
nano /opt/akbw-env/shop-bot.env   # SHOP_BOT_TOKEN
sudo -u deploy bash /opt/akbw/deploy/deploy.sh
```
`DATABASE_URL`, `JWT_SECRET`, `POSTGRES_PASSWORD` serverda tasodifiy yaratilgan — o'zgartirmang.
Tokeni bo'sh bot ishga tushirilmaydi.

## SSL (DNS 45.138.159.81 ga yo'naltirilgandan keyin)
```bash
certbot --nginx -d akbw.uz -d www.akbw.uz -d api.akbw.uz -d admin.akbw.uz --redirect -m <email> --agree-tos
```

## CI/CD (GitHub Actions — `.github/workflows/deploy.yml`)
`main` ga push → TypeScript tekshiruvi → rsync → `deploy.sh` (build xato bo'lsa eski versiya ishlab turadi).
Repo → Settings → Secrets and variables → Actions:
- `SSH_HOST` = `45.138.159.81`
- `SSH_PRIVATE_KEY` = `~/.ssh/akbw_ci` fayl mazmuni
- `SSH_KNOWN_HOSTS` = `ssh-keyscan -t ed25519 45.138.159.81` natijasi

## Foydali buyruqlar
```bash
cd /opt/akbw/deploy
docker compose ps
docker compose logs -f server
docker compose exec db pg_dump -U postgres akbw > /root/akbw-$(date +%F).sql   # zaxira
```

## Zaxira nusxa (backup)

`backup` servisi (docker-compose) har kuni Toshkent vaqti bilan 02:00 da baza (`pg_dump -Fc`) va yuklangan rasmlarni
`/opt/akbw-backups` ga yozadi va 14 kun saqlaydi. `deploy.sh` oxirida oxirgi nusxa qachon olinganini ko'rsatadi.

- Qo'lda nusxa olish: `docker compose run --rm -e BACKUP_ONCE=1 backup`
- Tiklanishini tekshirish (production'ga tegmaydi): `sudo sh /opt/akbw/deploy/backup/restore-test.sh`
- **Serverdan tashqariga ko'chirish (majburiy tavsiya):** `backup/offsite.sh` — rclone bilan Backblaze B2 / Cloudflare R2 / Google Drive.
  Sozlash yo'riqnomasi fayl boshida.
