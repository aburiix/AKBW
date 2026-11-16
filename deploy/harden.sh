#!/usr/bin/env bash
# AKBW serverini bir martalik sozlash (Ubuntu 20.04/22.04/24.04, root sifatida).
# Ishlatish: DEPLOY_PUBKEY="ssh-ed25519 AAAA... akbw-github-actions" bash harden.sh
set -euo pipefail
export DEBIAN_FRONTEND=noninteractive

: "${DEPLOY_PUBKEY:?DEPLOY_PUBKEY berilishi kerak (GitHub Actions uchun ochiq kalit)}"

echo "== 1. Tizimni yangilash va paketlar"
apt-get update -y
apt-get -o Dpkg::Options::=--force-confold upgrade -y
apt-get install -y ufw fail2ban unattended-upgrades apt-listchanges \
  nginx rsync git curl ca-certificates gnupg htop snapd

# certbot: apt'dagisi 20.04 da eski — snap orqali
if ! command -v certbot >/dev/null; then
  snap install core && snap refresh core
  snap install --classic certbot
  ln -sf /snap/bin/certbot /usr/bin/certbot
fi

timedatectl set-timezone Asia/Tashkent || true

echo "== 2. Swap (4 GB) — Next.js build uchun"
if ! swapon --show | grep -q /swapfile; then
  fallocate -l 4G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  grep -q '/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi
sysctl -w vm.swappiness=10 >/dev/null

echo "== 3. Docker"
if ! command -v docker >/dev/null; then
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
  chmod a+r /etc/apt/keyrings/docker.asc
  . /etc/os-release
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu ${VERSION_CODENAME} stable" \
    > /etc/apt/sources.list.d/docker.list
  apt-get update -y
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
fi
mkdir -p /etc/docker
cat > /etc/docker/daemon.json <<'JSON'
{
  "log-driver": "json-file",
  "log-opts": { "max-size": "10m", "max-file": "3" },
  "live-restore": true,
  "no-new-privileges": true
}
JSON
systemctl enable --now docker
systemctl restart docker

echo "== 4. deploy foydalanuvchisi (GitHub Actions shu bilan kiradi)"
id deploy >/dev/null 2>&1 || adduser --disabled-password --gecos "" deploy
usermod -aG docker deploy
install -d -m 700 -o deploy -g deploy /home/deploy/.ssh
echo "$DEPLOY_PUBKEY" > /home/deploy/.ssh/authorized_keys
chown deploy:deploy /home/deploy/.ssh/authorized_keys
chmod 600 /home/deploy/.ssh/authorized_keys
passwd -l deploy >/dev/null

install -d -o deploy -g deploy -m 755 /opt/akbw
install -d -o deploy -g deploy -m 700 /opt/akbw-env

echo "== 5. SSH: faqat kalit bilan"
cat > /etc/ssh/sshd_config.d/00-akbw-hardening.conf <<'CONF'
PasswordAuthentication no
KbdInteractiveAuthentication no
PermitEmptyPasswords no
PubkeyAuthentication yes
PermitRootLogin prohibit-password
MaxAuthTries 3
LoginGraceTime 30
X11Forwarding no
AllowAgentForwarding no
AllowUsers root deploy
ClientAliveInterval 300
ClientAliveCountMax 2
CONF
sshd -t
systemctl reload ssh || systemctl reload sshd

echo "== 6. Firewall (UFW): 22, 80, 443"
ufw default deny incoming
ufw default allow outgoing
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

echo "== 7. fail2ban (SSH brute-force)"
cat > /etc/fail2ban/jail.local <<'JAIL'
[DEFAULT]
bantime = 1h
findtime = 10m
maxretry = 5
backend = systemd

[sshd]
enabled = true
mode = aggressive

[nginx-limit-req]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log
backend = auto
JAIL
systemctl enable --now fail2ban
systemctl restart fail2ban

echo "== 8. Avtomatik xavfsizlik yangilanishlari"
cat > /etc/apt/apt.conf.d/20auto-upgrades <<'APT'
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
APT::Periodic::AutocleanInterval "7";
APT
systemctl enable --now unattended-upgrades

echo "== 9. Kernel/tarmoq sozlamalari"
cat > /etc/sysctl.d/99-akbw.conf <<'SYS'
vm.swappiness = 10
net.ipv4.tcp_syncookies = 1
net.ipv4.conf.all.rp_filter = 1
net.ipv4.conf.default.rp_filter = 1
net.ipv4.conf.all.accept_redirects = 0
net.ipv4.conf.default.accept_redirects = 0
net.ipv6.conf.all.accept_redirects = 0
net.ipv4.conf.all.send_redirects = 0
net.ipv4.conf.all.accept_source_route = 0
net.ipv4.icmp_echo_ignore_broadcasts = 1
kernel.kptr_restrict = 2
kernel.dmesg_restrict = 1
SYS
sysctl --system >/dev/null

echo "== 10. Nginx"
rm -f /etc/nginx/sites-enabled/default
sed -i 's/# server_tokens off;/server_tokens off;/' /etc/nginx/nginx.conf
systemctl enable --now nginx

echo "== TAYYOR"

# Nginx: proksi javoblarini ham siqish (API JSON 10-17 barobar kichrayadi)
sed -i -E "s/^\t# (gzip_vary on;)/\t\1/; s/^\t# (gzip_proxied any;)/\t\1/; s/^\t# gzip_comp_level 6;/\tgzip_comp_level 5;/; s/^\t# (gzip_buffers 16 8k;)/\t\1/; s/^\t# (gzip_http_version 1.1;)/\t\1/; s#^\t\# gzip_types .*#\tgzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml application/rss+xml image/svg+xml;#" /etc/nginx/nginx.conf
# certbot'dan keyin HTTP/2: sed -i -E 's/listen (\[::\]:)?443 ssl(;| ipv6only)/listen \1443 ssl http2\2/' /etc/nginx/sites-available/akbw.conf

