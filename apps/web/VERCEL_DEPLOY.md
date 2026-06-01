# Деплой фронтенда на Vercel (бесплатно)

Фронтенд «Город-сад» полностью работает на Vercel **без FastAPI**: услуги,
страницы услуг и калькулятор обслуживаются встроенными Next.js Route Handlers
(`app/api/v1/*`), а ИИ-чат отвечает изящной заглушкой (или реальным Claude — см. ниже).

## Шаги

1. Запушьте репозиторий на GitHub (если ещё нет).
2. На [vercel.com](https://vercel.com) → **Add New… → Project** → импортируйте репозиторий.
3. **Root Directory:** укажите `apps/web` (важно — проект в монорепо).
   Framework Preset определится как **Next.js** автоматически.
4. **Environment Variables** — можно ничего не задавать. Опционально:
   - `NEXT_PUBLIC_API_URL` — **оставьте пустым.** Тогда фронт использует встроенные
     Route Handlers. Задавайте только когда поднимете настоящий FastAPI
     (например `https://api.gorod-sad.pro/api/v1`) — фронт переключится на него.
   - `OPENROUTER_API_KEY` — если задать, ИИ-чат заработает по-настоящему через
     OpenRouter. Без него чат отвечает вежливой заглушкой и не выглядит сломанным.
   - `OPENROUTER_MODEL` — необязательно. По умолчанию `google/gemma-4-26b-a4b-it:free`
     (бесплатная, быстрая, умная). Свежий список бесплатных моделей — на openrouter.ai/models (фильтр Free).
5. **Deploy.** Через ~минуту сайт доступен по `*.vercel.app`. Домен `gorod-sad.pro`
   можно привязать в **Settings → Domains**.

## Что работает на Vercel из коробки

| Функция                | Как обслуживается                                   |
|------------------------|-----------------------------------------------------|
| Главная, услуги        | SSG: данные из `lib/services-data.ts` (без сети)    |
| `/api/v1/services`     | Route Handler                                       |
| `/api/v1/services/:slug` | Route Handler                                     |
| Калькулятор            | `POST /api/v1/calculator/estimate` (Route Handler)  |
| ИИ-чат                 | `POST /api/v1/chat` — заглушка или OpenRouter по ключу |

Цифры калькулятора совпадают с конструктором сада: ставки в `lib/services-data.ts`
синхронизированы с `lib/garden-pricing.ts` и бэкендом `apps/api`.

## Подключение настоящего FastAPI позже

Достаточно задать `NEXT_PUBLIC_API_URL` на адрес API и передеплоить — контракт
запросов одинаковый, код менять не нужно. Route Handlers останутся как запасной
вариант, но фронт начнёт ходить на ваш бэкенд.

## Заметки

- Локальная сборка проверяется так:
  ```bash
  cd apps/web
  npm install
  npm run typecheck
  npm run build
  ```
- `output: "standalone"` в `next.config.mjs` нужен для Docker-флоу и не мешает
  Vercel — оставлен как есть. Docker-деплой (`docker-compose.yml`) продолжает работать.
- Реальные фото/видео подставляются через `lib/media.ts` (см. `public/media/README.md`),
  логотип — `public/logo.svg`.
