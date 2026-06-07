import { NextResponse } from "next/server";

/**
 * POST /api/v1/chat — ИИ-консультант через OpenRouter (OpenAI-совместимый API).
 *
 * Режимы:
 *   1) Нет OPENROUTER_API_KEY → изящная заглушка (виджет не выглядит сломанным).
 *   2) Есть ключ → реальный ответ бесплатной модели OpenRouter.
 *
 * Модель меняется через OPENROUTER_MODEL. По умолчанию — быстрая и умная
 * бесплатная модель. Свежий список бесплатных моделей: openrouter.ai/models (фильтр Free).
 */

export const dynamic = "force-dynamic";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = "google/gemma-4-26b-a4b-it:free";

const SYSTEM_PROMPT = `Ты — ИИ-консультант ландшафтного бюро «Город-сад» (Ульяновск). Бюро работает с 2012 года, более 150 проектов, основатель Алексей Юрьевич.

Услуги и ориентиры цен:
1. Ландшафтное проектирование — концепция, дендроплан, визуализация. От 800 ₽/м² участка.
2. Укладка тротуарной плитки — брусчатка, клинкер, камень. От 2 500 ₽/м².
3. Обустройство газонов — рулонный или посевной. От 1 200 ₽/м².
4. Ландшафтное освещение — LED, автоматика. От 4 500 ₽/м².
5. Автополив — капельный, веерный, скрытый. От 1 800 ₽/м².
6. Топиарная стрижка — шары, конусы, спирали. От 8 000 ₽ за фигуру.

При заказе комплекса работ — скидка 30% на проектирование. Бесплатный выезд для замера по Ульяновску и области. Телефоны: 8-937-038-83-44, 8-937-450-99-00.

Правила: отвечай прямо, тепло и по-деловому, как живой консультант бюро. Не оправдывайся, не отвечай защитно и никогда не говори, что пользователь тебя с кем-то перепутал — ты ИИ-консультант «Город-сад» и спокойно помогаешь. Про цены называй ориентиры выше и уточняй, что точная цена — после выезда. Если вопрос совсем не про сады/ландшафт — мягко и дружелюбно возвращай к теме. Отвечай кратко (2–5 предложений). Не выдумывай услуги. Когда уместно — предложи бесплатную консультацию или выезд.`;

const STUB_REPLY =
  "Здравствуйте! Я ИИ-консультант бюро «Город-сад». Сейчас я в демо-режиме — " +
  "полноценно отвечу совсем скоро. Пока оставьте телефон в форме ниже или " +
  "позвоните 8-937-038-83-44, и Алексей Юрьевич бесплатно проконсультирует вас.";

const FALLBACK_REPLY =
  "Извините, сейчас не получается ответить. Позвоните 8-937-038-83-44 — там вам всегда помогут.";

interface IncomingMessage {
  role: string;
  content: string;
}

export async function POST(req: Request) {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();

  let body: { messages?: IncomingMessage[] } = {};
  try {
    body = await req.json();
  } catch {
    /* пустое/битое тело */
  }
  const incoming = Array.isArray(body.messages) ? body.messages : [];

  // Режим 1 — заглушка.
  if (!apiKey) {
    return NextResponse.json({ reply: STUB_REPLY, model: "stub" });
  }

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...incoming
      .map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: String(m.content ?? ""),
      }))
      .filter((m) => m.content.trim().length > 0),
  ];
  if (messages.length <= 1) {
    return NextResponse.json({ reply: STUB_REPLY, model: "stub" });
  }

  const model = process.env.OPENROUTER_MODEL || DEFAULT_MODEL;

  // Режим 2 — реальный ответ через OpenRouter.
  try {
    const resp = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
        // OpenRouter рекомендует указывать источник.
        // ВАЖНО: значения HTTP-заголовков должны быть ASCII/Latin-1 — без кириллицы,
        // иначе fetch бросает «invalid header value».
        "HTTP-Referer": process.env.OPENROUTER_SITE_URL || "https://gorod-sad.pro",
        "X-Title": "Gorod-Sad",
      },
      body: JSON.stringify({ model, messages, temperature: 0.6, max_tokens: 600 }),
    });

    if (!resp.ok) {
      const detail = (await resp.text()).slice(0, 300);
      return NextResponse.json({
        reply:
          "Сейчас консультант занят. Попробуйте через минуту или позвоните 8-937-038-83-44.",
        model,
        error: `upstream_${resp.status}`,
        detail,
      });
    }

    const data = await resp.json();
    const reply =
      typeof data?.choices?.[0]?.message?.content === "string"
        ? data.choices[0].message.content.trim()
        : FALLBACK_REPLY;
    return NextResponse.json({ reply, model: data?.model ?? model });
  } catch (e) {
    return NextResponse.json({
      reply: FALLBACK_REPLY,
      model,
      error: "exception",
      detail: String(e instanceof Error ? e.message : e).slice(0, 300),
    });
  }
}
