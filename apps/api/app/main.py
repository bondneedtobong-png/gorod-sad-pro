"""
Город-сад — API.

Точка входа FastAPI. Пока — health + заглушки под:
- /services        — список услуг
- /calculator/*    — расчёт стоимости
- /chat            — ИИ-консультант
"""

import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

API_PREFIX = os.getenv("API_PREFIX", "/api/v1")
CORS_ORIGINS = [o.strip() for o in os.getenv("CORS_ORIGINS", "").split(",") if o.strip()]


@asynccontextmanager
async def lifespan(app: FastAPI):
    # На старте/остановке — место для миграций, прогрева кэша, и т.п.
    yield


app = FastAPI(
    title="Город-сад API",
    description="Ландшафтное бюро · ИИ-консультант · калькулятор стоимости",
    version="0.1.0",
    lifespan=lifespan,
)

if CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


@app.get("/health")
@app.get(f"{API_PREFIX}/health")
async def health():
    return {"ok": True, "service": "gorod-sad-api", "version": "0.1.0"}


# --- Услуги ---------------------------------------------------------

SERVICES = [
    {
        "slug": "landscape-design",
        "title": "Ландшафтное проектирование",
        "tagline": "С учётом всех пожеланий",
        "description": (
            "Создаём проект участка с нуля: концепция, дендроплан, разбивочный чертёж, "
            "визуализация. Учитываем рельеф, инсоляцию, потоки воды и ваши пожелания."
        ),
    },
    {
        "slug": "paving",
        "title": "Укладка тротуарной плитки",
        "tagline": "Стиль от заказа до обустройства",
        "description": (
            "От подготовки основания до финального шва. Брусчатка, "
            "клинкер, натуральный камень — подбираем под архитектуру дома."
        ),
    },
    {
        "slug": "lawn",
        "title": "Обустройство газонов",
        "tagline": 'Зелёная мягкость "Под ключ"',
        "description": (
            "Рулонный или посевной газон. Полная подготовка почвы, дренаж, "
            "автополив и уход в первый сезон."
        ),
    },
    {
        "slug": "lighting",
        "title": "Ландшафтное освещение",
        "tagline": "Свет природы подчеркнёт Ваш вкус",
        "description": (
            "Подсветка деревьев, дорожек, водоёмов. "
            "Энергосберегающие LED-светильники с автоматикой по таймеру и сумеречному датчику."
        ),
    },
    {
        "slug": "irrigation",
        "title": "Автополив",
        "tagline": "С заботой о каждом растении",
        "description": (
            "Капельный, веерный, скрытый — подбираем под зону. "
            "Управление через смартфон. Учитываем погодные датчики."
        ),
    },
    {
        "slug": "topiary",
        "title": "Топиарная стрижка",
        "tagline": "Создание сложных фигур и композиций из растений",
        "description": (
            "Формируем шары, конусы, спирали, живые скульптуры. "
            "Регулярный уход с сохранением заданной формы."
        ),
    },
]


@app.get(f"{API_PREFIX}/services")
async def list_services():
    return {"items": SERVICES, "count": len(SERVICES)}


@app.get(f"{API_PREFIX}/services/{{slug}}")
async def get_service(slug: str):
    for s in SERVICES:
        if s["slug"] == slug:
            return s
    return {"error": "not_found"}, 404


# --- Калькулятор (заглушка, будет расширяться) ----------------------

@app.post(f"{API_PREFIX}/calculator/estimate")
async def estimate(payload: dict):
    """
    Пока упрощённо: считаем по площади × ставка услуги.
    Расширим в следующих итерациях — правила из БД, разные тарифы и т.д.
    """
    service_slug = payload.get("service")
    area = float(payload.get("area_m2", 0))

    rates = {
        "landscape-design": 800,
        "paving": 2_500,
        "lawn": 1_200,
        "lighting": 4_500,
        "irrigation": 1_800,
        "topiary": 0,  # отдельный прайс
    }
    rate = rates.get(service_slug)
    if rate is None:
        return {"error": "unknown_service"}, 400

    total = int(area * rate)
    return {
        "service": service_slug,
        "area_m2": area,
        "rate_per_m2": rate,
        "total_rub": total,
        "note": "Окончательная стоимость уточняется после выезда специалиста (бесплатно).",
    }


# --- ИИ-консультант (заглушка под Claude API) -----------------------

@app.post(f"{API_PREFIX}/chat")
async def chat(payload: dict):
    """
    Заглушка ИИ-чата. На следующем этапе подключим Claude API через anthropic SDK
    с системным промптом "ты консультант ландшафтного бюро Город-сад".
    """
    message = payload.get("message", "")
    if not message:
        return {"error": "empty_message"}, 400

    return {
        "reply": (
            "Здравствуйте! Я ИИ-консультант ландшафтного бюро Город-сад. "
            "Скоро я смогу подробно отвечать на ваши вопросы — пока пилот настраивается. "
            "Опишите задачу, и мы свяжемся с вами в ближайшее время."
        ),
        "message_echo": message,
    }
