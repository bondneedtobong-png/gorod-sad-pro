"""
Telegram-бот для приёма заявок.

- Уведомления приходят в группу с inline-кнопками для смены статусов
- Команды /start, /help, /leads, /lead_<id>
- Автоматический закреп со списком активных заявок (обновляется сам)
- Заметки менеджера через reply на сообщение бота
"""

import json
import logging
import os
import re
from pathlib import Path
from typing import Any

import httpx

log = logging.getLogger("gorod-sad")

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "").strip()
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "").strip()
TELEGRAM_WEBHOOK_SECRET = os.getenv("TELEGRAM_WEBHOOK_SECRET", "").strip()

TG_API = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}"

LEADS_DIR = Path(os.getenv("LEADS_DIR", "/data/leads"))
LEADS_DIR.mkdir(parents=True, exist_ok=True)
LEADS_FILE = LEADS_DIR / "leads.jsonl"
MSG_MAP_FILE = LEADS_DIR / "tg_message_map.json"
PIN_FILE = LEADS_DIR / "tg_pinned_message.json"


# --- Карта lead_id <-> tg_message_id ---

def _load_msg_map() -> dict[str, int]:
    if not MSG_MAP_FILE.exists():
        return {}
    try:
        return json.loads(MSG_MAP_FILE.read_text(encoding="utf-8"))
    except Exception:
        return {}


def _save_msg_map(m: dict[str, int]) -> None:
    MSG_MAP_FILE.write_text(json.dumps(m), encoding="utf-8")


def _load_pin() -> dict[str, Any]:
    if not PIN_FILE.exists():
        return {}
    try:
        return json.loads(PIN_FILE.read_text(encoding="utf-8"))
    except Exception:
        return {}


def _save_pin(d: dict[str, Any]) -> None:
    PIN_FILE.write_text(json.dumps(d), encoding="utf-8")


# --- Заявки в JSONL ---

def read_leads() -> list[dict[str, Any]]:
    if not LEADS_FILE.exists():
        return []
    out = []
    for line in LEADS_FILE.read_text(encoding="utf-8").splitlines():
        if line.strip():
            try:
                out.append(json.loads(line))
            except Exception:
                pass
    return out


def write_leads(items: list[dict[str, Any]]) -> None:
    with LEADS_FILE.open("w", encoding="utf-8") as f:
        for item in items:
            f.write(json.dumps(item, ensure_ascii=False) + "\n")


def find_lead(lead_id: str) -> dict[str, Any] | None:
    for item in read_leads():
        if item.get("id") == lead_id:
            return item
    return None


def update_lead_status(lead_id: str, new_status: str, manager: str = "") -> dict[str, Any] | None:
    items = read_leads()
    updated = None
    for item in items:
        if item.get("id") == lead_id:
            item["status"] = new_status
            history = item.setdefault("history", [])
            history.append({"status": new_status, "by": manager})
            updated = item
            break
    if updated:
        write_leads(items)
    return updated


def add_lead_comment(lead_id: str, comment: str, manager: str = "") -> dict[str, Any] | None:
    items = read_leads()
    updated = None
    for item in items:
        if item.get("id") == lead_id:
            comments = item.setdefault("manager_comments", [])
            comments.append({"text": comment, "by": manager})
            updated = item
            break
    if updated:
        write_leads(items)
    return updated


# --- Формирование сообщений ---

STATUS_LABELS = {
    "new": "🟡 Новая",
    "in_work": "🔵 В работе",
    "won": "✅ Успех",
    "lost": "❌ Отказ",
}

STATUS_ORDER = ["new", "in_work", "won", "lost"]


def _format_lead_message(lead: dict[str, Any]) -> str:
    status = lead.get("status", "new")
    lines = [
        f"<b>{STATUS_LABELS.get(status, status)}</b>",
        f"#{lead.get('id', '?')}",
        "",
        f"👤 <b>{lead.get('name', '—')}</b>",
        f"📞 {lead.get('phone', '—')}",
    ]
    src = lead.get("source", "form")
    src_label = {
        "sandbox": "🌱 Конструктор сада",
        "ai_dialog": "🤖 ИИ-диалог",
        "form": "📝 Форма",
        "calc": "🧮 Калькулятор",
    }.get(src, src)
    lines.append(f"📍 Источник: {src_label}")

    if lead.get("total_rub"):
        lines.append(f"💰 Ориентир: <b>{lead['total_rub']:,} ₽</b>".replace(",", " "))
    if lead.get("counts"):
        counts = lead["counts"]
        if counts:
            parts = []
            labels = {
                "lawn": "газон", "path": "плитка", "water": "водоём",
                "tree": "дерев", "conifer": "хвойн", "bush": "куст",
                "flowerbed": "клумб", "lamp": "фонар", "bench": "скамеек",
                "fountain": "фонтан",
            }
            for k, v in counts.items():
                if v > 0:
                    parts.append(f"{labels.get(k, k)} ×{v}")
            if parts:
                lines.append(f"📋 План: {', '.join(parts)}")

    if lead.get("plot_size"):
        lines.append(f"📐 Участок: {lead['plot_size']}")
    if lead.get("land_conditions"):
        lines.append(f"🌍 Условия: {', '.join(lead['land_conditions'])}")

    if lead.get("comment"):
        lines.append("")
        lines.append(f"💬 {lead['comment']}")

    if lead.get("dialog_summary"):
        lines.append("")
        lines.append(f"📝 Резюме диалога:\n<i>{lead['dialog_summary']}</i>")

    comments = lead.get("manager_comments", [])
    if comments:
        lines.append("")
        lines.append("📌 <b>Заметки менеджера:</b>")
        for c in comments[-5:]:
            lines.append(f"• {c.get('text', '')}")

    return "\n".join(lines)


def _keyboard_for_status(lead_id: str, status: str) -> dict:
    buttons = []
    row1 = []
    if status != "in_work":
        row1.append({"text": "🔵 В работу", "callback_data": f"l:{lead_id}:s:in_work"})
    if status != "won":
        row1.append({"text": "✅ Успех", "callback_data": f"l:{lead_id}:s:won"})
    if status != "lost":
        row1.append({"text": "❌ Отказ", "callback_data": f"l:{lead_id}:s:lost"})
    if row1:
        buttons.append(row1)
    if status != "new":
        buttons.append([{"text": "↺ Вернуть в Новые", "callback_data": f"l:{lead_id}:s:new"}])
    if lead_id:
        buttons.append([{"text": "💬 Добавить заметку", "callback_data": f"l:{lead_id}:c"}])
    return {"inline_keyboard": buttons}


def _format_active_list(leads: list[dict[str, Any]]) -> tuple[str, dict]:
    """Список активных заявок + клавиатура с кнопками 'Открыть #id'."""
    active = [l for l in leads if l.get("status", "new") in ("new", "in_work")]
    active.sort(key=lambda l: l.get("created_at", ""), reverse=True)

    if not active:
        return (
            "📋 <b>Активные заявки</b>\n\n"
            "<i>Все заявки обработаны. Жду новых.</i>\n\n"
            "<i>Команды:</i>\n"
            "/leads — обновить этот список\n"
            "/all — показать все заявки\n"
            "/help — справка",
            {"inline_keyboard": []},
        )

    lines = [f"📋 <b>Активные заявки</b> ({len(active)})", ""]
    buttons = []
    for lead in active[:15]:
        status_icon = "🟡" if lead.get("status", "new") == "new" else "🔵"
        title = lead.get("name", "?")[:25]
        amount = ""
        if lead.get("total_rub"):
            amount = f" · {lead['total_rub']:,} ₽".replace(",", " ")
        lines.append(f"{status_icon} <code>#{lead.get('id', '?')}</code> · {title}{amount}")
        buttons.append([{
            "text": f"📂 Открыть {lead.get('name','?')[:20]}",
            "callback_data": f"l:{lead.get('id','')}:o",
        }])

    lines.append("")
    lines.append("<i>/leads — обновить · /all — все заявки</i>")
    return "\n".join(lines), {"inline_keyboard": buttons}


# --- HTTP-вызовы Telegram API ---

def is_configured() -> bool:
    return bool(TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID)


async def _tg_post(method: str, json_payload: dict, files: dict | None = None) -> dict:
    async with httpx.AsyncClient(timeout=15) as client:
        if files:
            resp = await client.post(f"{TG_API}/{method}", data=json_payload, files=files)
        else:
            resp = await client.post(f"{TG_API}/{method}", json=json_payload)
    return resp.json()


async def send_lead(lead: dict[str, Any]) -> int | None:
    if not is_configured():
        log.warning("[tg] not configured, skip send")
        return None

    text = _format_lead_message(lead)
    keyboard = _keyboard_for_status(lead.get("id", ""), lead.get("status", "new"))

    try:
        data = await _tg_post("sendMessage", {
            "chat_id": TELEGRAM_CHAT_ID,
            "text": text,
            "parse_mode": "HTML",
            "reply_markup": keyboard,
            "disable_web_page_preview": True,
        })
        if not data.get("ok"):
            log.warning(f"[tg] sendMessage failed: {data}")
            return None
        message_id = data["result"]["message_id"]

        m = _load_msg_map()
        m[lead.get("id", "?")] = message_id
        _save_msg_map(m)

        plan_file = lead.get("plan_file")
        if plan_file:
            plan_path = LEADS_DIR / plan_file
            if plan_path.exists():
                try:
                    async with httpx.AsyncClient(timeout=15) as client:
                        with plan_path.open("rb") as fh:
                            files = {"document": (plan_path.name, fh, "image/svg+xml")}
                            await client.post(
                                f"{TG_API}/sendDocument",
                                data={
                                    "chat_id": TELEGRAM_CHAT_ID,
                                    "reply_to_message_id": message_id,
                                    "caption": "📐 План участка",
                                },
                                files=files,
                            )
                except Exception:
                    log.exception("[tg] failed to send plan")

        # Обновляем закреп со списком
        await refresh_pinned_list()

        return message_id
    except Exception:
        log.exception("[tg] send_lead exception")
        return None


async def edit_lead_message(lead: dict[str, Any]) -> None:
    if not is_configured():
        return
    m = _load_msg_map()
    message_id = m.get(lead.get("id", "?"))
    if not message_id:
        log.warning(f"[tg] no message_id for lead {lead.get('id')}, sending new")
        await send_lead(lead)
        return

    text = _format_lead_message(lead)
    keyboard = _keyboard_for_status(lead.get("id", ""), lead.get("status", "new"))

    data = await _tg_post("editMessageText", {
        "chat_id": TELEGRAM_CHAT_ID,
        "message_id": message_id,
        "text": text,
        "parse_mode": "HTML",
        "reply_markup": keyboard,
        "disable_web_page_preview": True,
    })
    if not data.get("ok"):
        log.warning(f"[tg] editMessageText failed: {data}")
    else:
        await refresh_pinned_list()


async def refresh_pinned_list() -> None:
    """Обновляет (или создаёт) закреплённое сообщение со списком активных заявок."""
    if not is_configured():
        return
    leads = read_leads()
    text, keyboard = _format_active_list(leads)

    pin = _load_pin()
    pinned_id = pin.get("message_id")

    try:
        if pinned_id:
            data = await _tg_post("editMessageText", {
                "chat_id": TELEGRAM_CHAT_ID,
                "message_id": pinned_id,
                "text": text,
                "parse_mode": "HTML",
                "reply_markup": keyboard,
                "disable_web_page_preview": True,
            })
            if data.get("ok"):
                return
            err = (data.get("description") or "").lower()
            if "message is not modified" in err:
                return  # ничего не изменилось — нормально
            log.warning(f"[tg] edit pinned failed, recreating: {data}")
            pinned_id = None

        # Создаём новое сообщение и закрепляем
        data = await _tg_post("sendMessage", {
            "chat_id": TELEGRAM_CHAT_ID,
            "text": text,
            "parse_mode": "HTML",
            "reply_markup": keyboard,
            "disable_web_page_preview": True,
            "disable_notification": True,
        })
        if not data.get("ok"):
            log.warning(f"[tg] pin sendMessage failed: {data}")
            return
        new_id = data["result"]["message_id"]
        pin_resp = await _tg_post("pinChatMessage", {
            "chat_id": TELEGRAM_CHAT_ID,
            "message_id": new_id,
            "disable_notification": True,
        })
        if pin_resp.get("ok"):
            _save_pin({"message_id": new_id})
        else:
            log.warning(f"[tg] pin failed: {pin_resp}")
            _save_pin({"message_id": new_id})  # сохраним id чтобы хоть редактировать
    except Exception:
        log.exception("[tg] refresh_pinned_list exception")


async def answer_callback(callback_id: str, text: str = "") -> None:
    if not is_configured():
        return
    try:
        await _tg_post("answerCallbackQuery", {
            "callback_query_id": callback_id, "text": text,
        })
    except Exception:
        log.exception("[tg] answer_callback exception")


# --- Обработка callback_query ---

async def handle_callback(update: dict[str, Any]) -> dict[str, Any]:
    cb = update.get("callback_query")
    if not cb:
        return {"ok": True}

    cb_id = cb.get("id")
    data = cb.get("data", "")
    user = cb.get("from", {})
    manager = user.get("username") or user.get("first_name", "manager")

    parts = data.split(":")
    if len(parts) < 3 or parts[0] != "l":
        await answer_callback(cb_id, "Неизвестное действие")
        return {"ok": True}

    lead_id = parts[1]

    if parts[2] == "s" and len(parts) >= 4:
        new_status = parts[3]
        if new_status not in STATUS_LABELS:
            await answer_callback(cb_id, "Неизвестный статус")
            return {"ok": True}
        updated = update_lead_status(lead_id, new_status, manager)
        if updated:
            await edit_lead_message(updated)
            await answer_callback(cb_id, f"Статус: {STATUS_LABELS[new_status]}")
        else:
            await answer_callback(cb_id, "Заявка не найдена")
    elif parts[2] == "c":
        msg = cb.get("message", {})
        msg_id = msg.get("message_id")
        try:
            await _tg_post("sendMessage", {
                "chat_id": TELEGRAM_CHAT_ID,
                "reply_to_message_id": msg_id,
                "text": f"💬 Напишите заметку для заявки #{lead_id}\n(ответьте на это сообщение)",
                "reply_markup": {"force_reply": True, "selective": True},
            })
        except Exception:
            log.exception("[tg] failed to ask for comment")
        await answer_callback(cb_id, "Ответьте на сообщение бота")
    elif parts[2] == "o":
        # Открыть заявку — отправим её снова с актуальными кнопками
        lead = find_lead(lead_id)
        if not lead:
            await answer_callback(cb_id, "Заявка не найдена")
            return {"ok": True}
        text = _format_lead_message(lead)
        keyboard = _keyboard_for_status(lead_id, lead.get("status", "new"))
        await _tg_post("sendMessage", {
            "chat_id": TELEGRAM_CHAT_ID,
            "text": text,
            "parse_mode": "HTML",
            "reply_markup": keyboard,
            "disable_web_page_preview": True,
        })
        await answer_callback(cb_id, "Заявка показана ниже")
    return {"ok": True}


# --- Команды ---

HELP_TEXT = (
    "🤖 <b>Бот Город-сад · Заявки</b>\n\n"
    "Я принимаю заявки с сайта и помогаю их вести.\n\n"
    "<b>Команды:</b>\n"
    "/leads — список активных заявок (новые + в работе)\n"
    "/all — все заявки\n"
    "/help — эта справка\n\n"
    "<b>На каждой заявке:</b>\n"
    "🔵 В работу — взять в работу\n"
    "✅ Успех — клиент согласен\n"
    "❌ Отказ — клиент отказался\n"
    "💬 Заметка — добавить комментарий\n\n"
    "<i>Закреплённое сообщение со списком активных заявок всегда сверху.</i>"
)


async def register_bot_commands() -> None:
    """Регистрирует команды в Telegram, чтобы появлялось меню по /"""
    if not is_configured():
        return
    try:
        await _tg_post("setMyCommands", {
            "commands": [
                {"command": "leads", "description": "📋 Активные заявки"},
                {"command": "all", "description": "📊 Все заявки"},
                {"command": "help", "description": "❓ Справка"},
            ],
        })
    except Exception:
        log.exception("[tg] setMyCommands failed")


async def send_help() -> None:
    await _tg_post("sendMessage", {
        "chat_id": TELEGRAM_CHAT_ID,
        "text": HELP_TEXT,
        "parse_mode": "HTML",
    })


async def send_active_list_message() -> None:
    leads = read_leads()
    text, keyboard = _format_active_list(leads)
    await _tg_post("sendMessage", {
        "chat_id": TELEGRAM_CHAT_ID,
        "text": text,
        "parse_mode": "HTML",
        "reply_markup": keyboard,
        "disable_web_page_preview": True,
    })


async def send_all_leads_list() -> None:
    leads = read_leads()
    leads.sort(key=lambda l: l.get("created_at", ""), reverse=True)
    if not leads:
        await _tg_post("sendMessage", {
            "chat_id": TELEGRAM_CHAT_ID,
            "text": "<i>Заявок пока нет.</i>",
            "parse_mode": "HTML",
        })
        return
    lines = [f"📊 <b>Все заявки</b> (всего {len(leads)})", ""]
    counts = {"new": 0, "in_work": 0, "won": 0, "lost": 0}
    for lead in leads[:30]:
        st = lead.get("status", "new")
        counts[st] = counts.get(st, 0) + 1
        icon = {"new": "🟡", "in_work": "🔵", "won": "✅", "lost": "❌"}.get(st, "•")
        title = lead.get("name", "?")[:25]
        amount = ""
        if lead.get("total_rub"):
            amount = f" · {lead['total_rub']:,} ₽".replace(",", " ")
        lines.append(f"{icon} <code>#{lead.get('id', '?')}</code> · {title}{amount}")
    lines.append("")
    lines.append(
        f"🟡 {counts['new']}  ·  🔵 {counts['in_work']}  ·  "
        f"✅ {counts['won']}  ·  ❌ {counts['lost']}"
    )
    await _tg_post("sendMessage", {
        "chat_id": TELEGRAM_CHAT_ID,
        "text": "\n".join(lines),
        "parse_mode": "HTML",
    })


# --- Обработка входящих сообщений (команды + reply для заметок) ---

async def handle_message(update: dict[str, Any]) -> dict[str, Any]:
    msg = update.get("message")
    if not msg:
        return {"ok": True}

    text_raw = (msg.get("text") or "").strip()

    # --- Команды ---
    if text_raw.startswith("/"):
        # /command или /command@botname → нормализуем
        first = text_raw.split()[0]
        command = first.split("@")[0].lower()

        if command in ("/start", "/help"):
            await send_help()
            return {"ok": True}
        if command == "/leads":
            await send_active_list_message()
            return {"ok": True}
        if command == "/all":
            await send_all_leads_list()
            return {"ok": True}
        # /lead_<id> или /lead <id>
        m = re.match(r"^/lead[_\s](\S+)$", text_raw)
        if m:
            lead_id = m.group(1)
            lead = find_lead(lead_id)
            if not lead:
                await _tg_post("sendMessage", {
                    "chat_id": TELEGRAM_CHAT_ID,
                    "text": f"❓ Заявка #{lead_id} не найдена",
                })
                return {"ok": True}
            text = _format_lead_message(lead)
            keyboard = _keyboard_for_status(lead_id, lead.get("status", "new"))
            await _tg_post("sendMessage", {
                "chat_id": TELEGRAM_CHAT_ID,
                "text": text,
                "parse_mode": "HTML",
                "reply_markup": keyboard,
                "disable_web_page_preview": True,
            })
            return {"ok": True}
        return {"ok": True}

    # --- Reply-as-comment ---
    reply_to = msg.get("reply_to_message")
    if not reply_to:
        return {"ok": True}
    reply_text = reply_to.get("text", "")
    match = re.search(r"для заявки #(\S+)", reply_text)
    if not match:
        return {"ok": True}
    lead_id = match.group(1).rstrip(",.!?)")

    user = msg.get("from", {})
    manager = user.get("username") or user.get("first_name", "manager")
    comment_text = text_raw
    if not comment_text:
        return {"ok": True}

    updated = add_lead_comment(lead_id, comment_text, manager)
    if updated:
        await edit_lead_message(updated)
        try:
            await _tg_post("sendMessage", {
                "chat_id": TELEGRAM_CHAT_ID,
                "reply_to_message_id": msg.get("message_id"),
                "text": "✓ Заметка сохранена",
            })
        except Exception:
            pass
    return {"ok": True}
