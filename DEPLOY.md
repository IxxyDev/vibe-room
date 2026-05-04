# Deploy на VPS (Timeweb / Selectel / любой Linux)

## 0. Что нужно

- VPS Ubuntu 22.04 / Debian 12, **2 GB RAM**, 20 GB SSD (Timeweb Cloud / Selectel / Aeza)
- Домен, A-запись которого указывает на IP сервера
- SSH-доступ под root или sudo-юзером

## 1. Подготовка сервера

```sh
ssh root@SERVER_IP
apt update && apt upgrade -y
apt install -y docker.io docker-compose-v2 git ufw
ufw allow OpenSSH && ufw allow 80 && ufw allow 443 && ufw enable
systemctl enable --now docker
```

## 2. Код

```sh
mkdir -p /opt && cd /opt
git clone <YOUR_REPO_URL> vibe-room
cd vibe-room
```

## 3. Конфигурация

```sh
cp .env.production.example .env
nano .env
```

Сгенерировать секрет:

```sh
openssl rand -base64 48
```

Заполнить `.env`:

```
PAYLOAD_SECRET=<сгенерированный_секрет>
DOMAIN=vibe-room.ru
ACME_EMAIL=you@vibe-room.ru
```

## 4. Первый запуск (HTTP only, для получения сертификата)

```sh
docker compose build
docker compose up -d cms nginx
docker compose logs -f cms
```

Когда увидишь `✓ Ready` — открой `http://SERVER_IP/admin`, создай первого пользователя.

## 5. HTTPS через Let's Encrypt

Активировать HTTPS-конфиг (заменив домен):

```sh
sed "s/__DOMAIN__/vibe-room.ru/g" nginx/default.https.conf > nginx/default.conf.new
```

Получить сертификат (заменив домен и email):

```sh
docker compose run --rm --entrypoint "certbot certonly --webroot -w /var/www/certbot \
  --email you@vibe-room.ru --agree-tos --no-eff-email \
  -d vibe-room.ru -d www.vibe-room.ru" certbot
```

Подменить конфиг и перезапустить nginx:

```sh
mv nginx/default.conf.new nginx/default.conf
docker compose up -d --force-recreate nginx certbot
```

Проверить: `https://vibe-room.ru` и `https://vibe-room.ru/admin`.

## 6. Деплой обновлений

```sh
cd /opt/vibe-room
git pull
docker compose build cms
docker compose up -d cms
```

После запуска контейнер сам пересобирает Astro-фронт перед стартом Next. При изменениях в CMS-админке хук `triggerRebuild` пересобирает дист на лету.

## 7. Бэкапы

```sh
sh scripts/backup.sh /opt/backups
```

Положить в cron (`crontab -e`):

```
0 4 * * * cd /opt/vibe-room && sh scripts/backup.sh /opt/backups >> /var/log/vibe-backup.log 2>&1
```

Хранится последние 14 бэкапов. Слить на S3 (Selectel/Yandex) — `aws s3 cp` или `rclone`.

## 8. Что в каких volume

| Volume       | Содержимое              | Путь в контейнере         |
|--------------|-------------------------|---------------------------|
| `vibe-data`  | SQLite-файл             | `/app/apps/cms/data`      |
| `vibe-media` | Загруженные изображения | `/app/apps/cms/media`     |
| `vibe-dist`  | Сгенерированный сайт    | `/app/apps/web/dist`      |

## 9. Полезное

```sh
docker compose logs -f cms             # логи CMS
docker compose exec cms sh             # shell внутрь
docker compose restart cms             # перезапуск CMS
docker compose down && docker compose up -d   # полный рестарт
docker compose exec cms sqlite3 /app/apps/cms/data/vibe-room.db .tables   # инспект БД
```

## 10. Авто-деплой через GitHub Actions

Workflow `.github/workflows/deploy.yml` делает `git pull && docker compose build cms && up -d` при push в `main`.

**Один раз на сервере** создай deploy-юзера и SSH-ключ:

```sh
adduser --disabled-password --gecos "" deploy
usermod -aG docker deploy
mkdir -p /home/deploy/.ssh && chmod 700 /home/deploy/.ssh
chown -R deploy:deploy /opt/vibe-room
```

На локальной машине сгенерируй ключ:

```sh
ssh-keygen -t ed25519 -C "github-deploy" -f ~/.ssh/vibe_deploy -N ""
ssh-copy-id -i ~/.ssh/vibe_deploy.pub deploy@SERVER_IP
```

**В репозитории на GitHub** → Settings → Secrets and variables → Actions → New repository secret:

| Имя        | Значение                            |
|------------|-------------------------------------|
| `SSH_HOST` | IP сервера                          |
| `SSH_USER` | `deploy`                            |
| `SSH_KEY`  | содержимое `~/.ssh/vibe_deploy`     |
| `SSH_PORT` | `22` (опционально)                  |

После этого каждый push в `main` запускает деплой. Можно дёрнуть вручную: вкладка Actions → Deploy → Run workflow.

## 11. Стоимость (ориентир)

- VPS Timeweb Cloud 2 CPU / 2 GB / 20 GB SSD: ~450 ₽/мес
- Домен `.ru` (reg.ru / beget): ~250 ₽/год
- SSL: бесплатно (Let's Encrypt)
- **Итого:** ~470 ₽/мес
