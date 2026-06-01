"""
Город-сад — API.
"""

import logging
import os
from contextlib import asynccontextmanager
from typing import Any

import httpx
from fastapi import FastAPI, Header, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.services import telegram_bot

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger("gorod-sad")

API_PREFIX = os.getenv("API_PREFIX", "/api/v1")
CORS_ORIGINS = [o.strip() for o in os.getenv("CORS_ORIGINS", "").split(",") if o.strip()]

# AI provider — универсальная OpenAI-совместимая конфигурация.
# Можно указать любой провайдер с этим протоколом: xAI, OpenAI, OpenRouter, Anthropic-via-proxy, Groq, и т.п.
AI_BASE_URL = os.getenv("AI_BASE_URL", "https://api.x.ai/v1").rstrip("/")
AI_API_KEY = (
    os.getenv("AI_API_KEY")
    or os.getenv("XAI_API_KEY")
    or os.getenv("OPENROUTER_API_KEY")
    or ""
).strip()
AI_MODEL = (
    os.getenv("AI_MODEL")
    or os.getenv("XAI_MODEL")
    or os.getenv("OPENROUTER_MODEL")
    or "grok-4-1-fast-reasoning"
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Регистрируем меню команд Telegram (бот покажет их по /)
    try:
        await telegram_bot.register_bot_commands()
    except Exception:
        log.exception("startup: register_bot_commands failed")
    yield


app = FastAPI(
    title="Город-сад API",
    description="Ландшафтное бюро · ИИ-консультант · калькулятор стоимости",
    version="0.2.0",
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
    return {
        "ok": True,
        "service": "gorod-sad-api",
        "version": "0.3.0",
        "ai_configured": bool(AI_API_KEY),
        "ai_model": AI_MODEL,
        "ai_base_url": AI_BASE_URL,
    }


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
        "rate_per_m2": 800,
        "min_rub": 25_000,
        "unit": "м² участка",
    },
    {
        "slug": "paving",
        "title": "Укладка тротуарной плитки",
        "tagline": "Стиль от заказа до обустройства",
        "description": (
            "От подготовки основания до финального шва. Брусчатка, "
            "клинкер, натуральный камень — подбираем под архитектуру дома."
        ),
        "rate_per_m2": 2_500,
        "min_rub": 30_000,
        "unit": "м² мощения",
    },
    {
        "slug": "lawn",
        "title": "Обустройство газонов",
        "tagline": 'Зелёная мягкость "Под ключ"',
        "description": (
            "Рулонный или посевной газон. Полная подготовка почвы, дренаж, "
            "автополив и уход в первый сезон."
        ),
        "rate_per_m2": 1_200,
        "min_rub": 20_000,
        "unit": "м² газона",
    },
    {
        "slug": "lighting",
        "title": "Ландшафтное освещение",
        "tagline": "Свет природы подчеркнёт Ваш вкус",
        "description": (
            "Подсветка деревьев, дорожек, водоёмов. "
            "Энергосберегающие LED-светильники с автоматикой по таймеру и сумеречному датчику."
        ),
        "rate_per_m2": 4_500,
        "min_rub": 40_000,
        "unit": "м² подсветки",
    },
    {
        "slug": "irrigation",
        "title": "Автополив",
        "tagline": "С заботой о каждом растении",
        "description": (
            "Капельный, веерный, скрытый — подбираем под зону. "
            "Управление через смартфон. Учитываем погодные датчики."
        ),
        "rate_per_m2": 1_800,
        "min_rub": 35_000,
        "unit": "м² зоны полива",
    },
    {
        "slug": "topiary",
        "title": "Топиарная стрижка",
        "tagline": "Создание сложных фигур и композиций из растений",
        "description": (
            "Формируем шары, конусы, спирали, живые скульптуры. "
            "Регулярный уход с сохранением заданной формы."
        ),
        "rate_per_m2": 0,
        "min_rub": 8_000,
        "unit": "за одну фигуру",
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
    raise HTTPException(status_code=404, detail="service_not_found")


# --- Калькулятор ----------------------------------------------------


class EstimateRequest(BaseModel):
    service: str
    area_m2: float = 0
    full_cycle: bool = False  # скидка 30% при комплексе работ


@app.post(f"{API_PREFIX}/calculator/estimate")
async def estimate(req: EstimateRequest):
    service = next((s for s in SERVICES if s["slug"] == req.service), None)
    if not service:
        raise HTTPException(status_code=400, detail="unknown_service")

    base = max(service["min_rub"], int(req.area_m2 * service["rate_per_m2"]))

    total = base
    discount_applied = 0
    if req.full_cycle:
        discount_applied = int(total * 0.30)
        total -= discount_applied

    return {
        "service": req.service,
        "service_title": service["title"],
        "unit": service["unit"],
        "area_m2": req.area_m2,
        "rate_per_m2": service["rate_per_m2"],
        "base_rub": base,
        "discount_rub": discount_applied,
        "total_rub": total,
        "note": "Окончательная стоимость уточняется после выезда специалиста (бесплатно).",
    }


# --- ИИ-консультант через OpenRouter --------------------------------


class ChatMessage(BaseModel):
    role: str  # "user" | "assistant"
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]


SYSTEM_PROMPT = """Ты — ИИ-консультант ландшафтного бюро «Город-сад». Бюро работает с 2012 года, более 150 уникальных проектов, основатель Алексей Юрьевич.

Услуги бюро:
1. Ландшафтное проектирование — концепция, дендроплан, визуализация. От 800 ₽/м² участка.
2. Укладка тротуарной плитки — брусчатка, клинкер, камень. От 2 500 ₽/м².
3. Обустройство газонов — рулонный или посевной, с подготовкой почвы. От 1 200 ₽/м².
4. Ландшафтное освещение — LED, автоматика. От 4 500 ₽/м².
5. Автополив — капельный, веерный, скрытый, со смартфон-управлением. От 1 800 ₽/м².
6. Топиарная стрижка — шары, конусы, спирали. От 8 000 ₽ за фигуру.

При заказе комплекса работ — 30% скидка на проектирование.
Выезд для замера и оценки — бесплатный.
Контакты: 8-937-038-83-44, 8-937-450-99-00.

Правила общения:
- Говори живым человеческим языком, без сухости и без впихивания. Будь как опытный садовник-консультант — спокойный, знающий, доброжелательный.
- Если спрашивают про цены — называй ориентиры из услуг выше и уточняй что точная цена после выезда.
- Если вопрос не про сады/ландшафт — мягко возвращай к теме.
- Отвечай кратко (2–5 предложений). Если уместно — предложи перейти к консультации по телефону.
- Не выдумывай услуги, которых нет. Не давай гарантий по срокам без выезда.
"""


# --- Заявки (Leads) -------------------------------------------------

import json
from datetime import datetime, timezone
from pathlib import Path

LEADS_DIR = Path(os.getenv("LEADS_DIR", "/data/leads"))
LEADS_DIR.mkdir(parents=True, exist_ok=True)
LEADS_FILE = LEADS_DIR / "leads.jsonl"


class LeadRequest(BaseModel):
    name: str
    phone: str
    comment: str = ""
    source: str = "form"  # "sandbox" | "ai_dialog" | "form" | "calc"
    total_rub: int = 0
    counts: dict[str, int] | None = None
    plan_svg: str | None = None
    # Доп. поля от sandbox v2 / ИИ-диалога:
    plot_size: str | None = None  # "20×30 м"
    land_conditions: list[str] | None = None
    dialog_summary: str | None = None  # резюме ИИ-диалога


@app.post(f"{API_PREFIX}/leads")
async def create_lead(req: LeadRequest):
    if not req.name.strip() or not req.phone.strip():
        raise HTTPException(status_code=400, detail="name_and_phone_required")

    now = datetime.now(timezone.utc).isoformat()
    # короткий id для удобства показа: 6 последних символов timestamp
    lead_id = now.replace(":", "").replace("-", "").replace(".", "")[:14]

    record: dict[str, Any] = {
        "id": lead_id,
        "created_at": now,
        "status": "new",
        "name": req.name.strip(),
        "phone": req.phone.strip(),
        "comment": req.comment.strip(),
        "source": req.source,
        "total_rub": req.total_rub,
        "counts": req.counts or {},
    }
    if req.plot_size:
        record["plot_size"] = req.plot_size
    if req.land_conditions:
        record["land_conditions"] = req.land_conditions
    if req.dialog_summary:
        record["dialog_summary"] = req.dialog_summary

    # Сохраняем SVG плана отдельным файлом, в jsonl кладём имя
    if req.plan_svg:
        plan_path = LEADS_DIR / f"plan_{lead_id}.svg"
        try:
            plan_path.write_text(req.plan_svg, encoding="utf-8")
            record["plan_file"] = plan_path.name
        except Exception:
            log.exception("failed to save plan svg")

    # Append-only JSONL
    try:
        with LEADS_FILE.open("a", encoding="utf-8") as f:
            f.write(json.dumps(record, ensure_ascii=False) + "\n")
    except Exception:
        log.exception("failed to write lead")
        raise HTTPException(status_code=500, detail="storage_error")

    log.info(
        f"[lead] new id={lead_id} from={req.source} name={record['name']} "
        f"phone={record['phone']} total={record['total_rub']}"
    )

    # Уведомляем Telegram
    try:
        message_id = await telegram_bot.send_lead(record)
        if message_id:
            log.info(f"[lead] tg notify ok message_id={message_id}")
        else:
            log.warning("[lead] tg notify skipped or failed")
    except Exception:
        log.exception("[lead] tg notify exception")

    return {"ok": True, "id": lead_id}


# --- Telegram webhook (приём callback_query и сообщений-ответов) ---

@app.post(f"{API_PREFIX}/telegram/webhook")
async def telegram_webhook(
    request: Request,
    x_telegram_bot_api_secret_token: str | None = Header(default=None),
):
    expected = telegram_bot.TELEGRAM_WEBHOOK_SECRET
    if expected and x_telegram_bot_api_secret_token != expected:
        log.warning("[tg-webhook] bad secret token")
        raise HTTPException(status_code=403, detail="forbidden")

    update = await request.json()

    # Полезная отладка для определения chat_id
    msg = update.get("message") or update.get("edited_message")
    cb = update.get("callback_query")
    chat = None
    if msg:
        chat = msg.get("chat", {})
        text = (msg.get("text") or "")[:80]
        log.info(
            f"[tg-webhook] MESSAGE chat_id={chat.get('id')} "
            f"chat_type={chat.get('type')} title={chat.get('title')!r} text={text!r}"
        )
    elif cb:
        msg2 = cb.get("message", {})
        chat = msg2.get("chat", {})
        log.info(f"[tg-webhook] CALLBACK chat_id={chat.get('id')} data={cb.get('data')}")
    else:
        log.info(f"[tg-webhook] OTHER keys={list(update.keys())}")

    if cb:
        return await telegram_bot.handle_callback(update)
    if "message" in update:
        return await telegram_bot.handle_message(update)
    return {"ok": True}


@app.get(f"{API_PREFIX}/telegram/status")
async def telegram_status():
    return {
        "configured": telegram_bot.is_configured(),
        "chat_id": telegram_bot.TELEGRAM_CHAT_ID if telegram_bot.is_configured() else None,
        "has_webhook_secret": bool(telegram_bot.TELEGRAM_WEBHOOK_SECRET),
    }


@app.post(f"{API_PREFIX}/telegram/test")
async def telegram_test():
    """Создаёт настоящую тестовую заявку в JSONL и шлёт уведомление в группу.
    Кнопки будут работать так же как на реальных заявках."""
    if not telegram_bot.is_configured():
        raise HTTPException(status_code=503, detail="telegram_not_configured")
    test_req = LeadRequest(
        name="🧪 Тестовый клиент",
        phone="+7 (937) 000-00-00",
        comment="Это тестовое уведомление от бота. Можно нажать на кнопки — статус будет меняться, заметки сохраняться.",
        source="form",
        total_rub=123_456,
    )
    return await create_lead(test_req)


@app.get(f"{API_PREFIX}/leads")
async def list_leads(limit: int = 100):
    """Простой просмотр заявок (для разработчика, без авторизации пока).
    На проде стоит закрыть basic-auth или вынести в админ-роут."""
    if not LEADS_FILE.exists():
        return {"items": [], "count": 0}
    lines = LEADS_FILE.read_text(encoding="utf-8").splitlines()
    items = [json.loads(line) for line in lines if line.strip()]
    items.reverse()
    return {"items": items[:limit], "count": len(items)}


# --- ИИ-консультант --------------------------------------------------

@app.post(f"{API_PREFIX}/chat")
async def chat(req: ChatRequest):
    if not AI_API_KEY:
        return {
            "reply": (
                "Здравствуйте! Я ИИ-консультант бюро «Город-сад». "
                "Сейчас я в режиме демо, но скоро отвечу подробно. "
                "Пока — звоните 8-937-038-83-44 или оставьте номер в форме ниже."
            ),
            "model": "stub",
        }

    if not req.messages:
        raise HTTPException(status_code=400, detail="empty_messages")

    payload = {
        "model": AI_MODEL,
        "messages": [{"role": "system", "content": SYSTEM_PROMPT}]
        + [m.model_dump() for m in req.messages],
        "temperature": 0.6,
        "max_tokens": 600,
    }

    headers = {
        "Authorization": f"Bearer {AI_API_KEY}",
        "Content-Type": "application/json",
    }

    url = f"{AI_BASE_URL}/chat/completions"
    log.info(f"[chat] -> {url} model={AI_MODEL} msgs={len(req.messages)}")
    try:
        async with httpx.AsyncClient(timeout=120) as client:
            resp = await client.post(url, headers=headers, json=payload)
        if resp.status_code != 200:
            body_preview = resp.text[:600]
            log.warning(f"[chat] upstream non-200 status={resp.status_code} body={body_preview}")
            return {
                "reply": (
                    "Сейчас модель занята. Попробуйте через минуту или позвоните "
                    "8-937-038-83-44 — там вам всегда ответят."
                ),
                "model": AI_MODEL,
                "error": f"upstream_{resp.status_code}",
                "upstream_body": body_preview,
            }
        data = resp.json()
        try:
            reply = data["choices"][0]["message"]["content"].strip()
        except (KeyError, IndexError) as parse_err:
            log.warning(f"[chat] bad upstream shape: {data}")
            return {
                "reply": "Извините, ответ пришёл в неожиданном виде. Позвоните 8-937-038-83-44.",
                "model": AI_MODEL,
                "error": f"parse_error: {parse_err}",
                "upstream_raw": str(data)[:600],
            }
        log.info(f"[chat] <- ok len={len(reply)}")
        return {"reply": reply, "model": AI_MODEL}
    except httpx.TimeoutException:
        log.warning("[chat] timeout 120s")
        return {
            "reply": "Модель отвечает дольше обычного. Попробуйте чуть позже или позвоните 8-937-038-83-44.",
            "model": AI_MODEL,
            "error": "timeout",
        }
    except Exception as e:
        log.exception("[chat] exception")
        return {
            "reply": "Извините, связь с консультантом временно прервалась. Позвоните 8-937-038-83-44.",
            "model": AI_MODEL,
            "error": f"{type(e).__name__}: {str(e)[:200]}",
        }
