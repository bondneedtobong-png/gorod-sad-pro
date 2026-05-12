# Город-сад

Сайт-визитка v2 ландшафтного бюро **Город-сад** с интерактивными услугами,
калькулятором стоимости и ИИ-консультантом.

## Стек

- **Frontend**: Next.js 14 (App Router) + Tailwind + lucide-react
- **Backend**: FastAPI + SQLAlchemy 2 (async) + Postgres
- **ИИ**: Claude API через `anthropic` SDK
- **Деплой**: docker-compose + Nginx + Certbot на Ubuntu VPS

## Структура

```
gorod-sad-pro/
├── docker-compose.yml      # production stack: postgres + api + web
├── .env.example
├── apps/
│   ├── api/                # FastAPI
│   │   ├── Dockerfile
│   │   ├── requirements.txt
│   │   └── app/
│   │       └── main.py     # health, /services, /calculator, /chat
│   └── web/                # Next.js
│       ├── Dockerfile
│       ├── package.json
│       └── app/
│           ├── layout.tsx
│           ├── page.tsx    # главная
│           └── globals.css
├── nginx/
│   └── gorod-sad.conf      # reverse proxy
├── scripts/
│   ├── setup-vps.ps1       # one-shot bootstrap нового сервера
│   └── deploy.sh           # обновления / логи / SSL
└── .deploy-info            # создаётся setup-vps.ps1, в .gitignore
```

## Деплой с нуля

### 1. Подготовить VPS

В PowerShell (от обычного пользователя):

```powershell
cd C:\Users\bond\Desktop\gorod-sad-pro
PowerShell -ExecutionPolicy Bypass -File .\scripts\setup-vps.ps1
```

Скрипт:
- сделает SSH-ключ `~/.ssh/gorod-sad`,
- скопирует его на VPS (пароль введёшь один раз),
- поставит nginx, certbot, ufw, swap,
- создаст `/opt/gorod-sad` на сервере,
- предложит отключить вход по паролю.

После — у тебя будет alias `ssh gorod-sad`.

### 2. Создать GitHub-репозиторий

1. Зайди на https://github.com/new
2. Имя репо: `gorod-sad-pro` (или как хочешь)
3. Приватный или публичный — на твой выбор
4. **Не** добавляй README/gitignore — у нас уже есть
5. После создания скопируй URL вида `git@github.com:bondneedtobong-png/gorod-sad-pro.git`

Затем локально:

```powershell
cd C:\Users\bond\Desktop\gorod-sad-pro
git init
git add .
git commit -m "init: gorod-sad v2 skeleton"
git branch -M main
git remote add origin git@github.com:bondneedtobong-png/gorod-sad-pro.git
git push -u origin main
```

### 3. Настроить DNS

У регистратора домена (Beget / reg.ru / namecheap):

| Тип | Имя | Значение            |
|-----|-----|---------------------|
| A   | @   | 46.173.28.247       |
| A   | www | 46.173.28.247       |

Обновление DNS — от 5 минут до пары часов. Проверить:

```bash
nslookup gorod-sad.pro
```

### 4. Первый деплой на сервер

В PowerShell:

```powershell
# Подключиться по SSH-alias
ssh gorod-sad

# На сервере:
cd /opt/gorod-sad
git clone git@github.com:bondneedtobong-png/gorod-sad-pro.git .
cp .env.example .env
nano .env   # заполнить POSTGRES_PASSWORD, ANTHROPIC_API_KEY
docker compose up -d --build

# Подключить nginx:
cp nginx/gorod-sad.conf /etc/nginx/sites-available/gorod-sad
ln -sf /etc/nginx/sites-available/gorod-sad /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
```

### 5. Выпустить SSL

С твоей машины (когда DNS уже распространился):

```bash
bash scripts/deploy.sh ssl
```

Готово — сайт открывается на `https://gorod-sad.pro`.

## Будущие обновления

После любых правок локально:

```powershell
git add .
git commit -m "что-то полезное"
git push

# Применить на сервере:
bash scripts/deploy.sh
```

Другие команды:

```bash
bash scripts/deploy.sh logs      # логи в реалтайме
bash scripts/deploy.sh ps        # статус контейнеров
bash scripts/deploy.sh restart   # рестарт без пересборки
```

## Локальная разработка (опционально)

Когда поставишь Docker на Windows:

```bash
cp .env.example .env
# заполнить значения для локальной разработки
docker compose up -d --build
```

Открыть:
- Фронт: http://localhost:3000
- API: http://localhost:8000/health
