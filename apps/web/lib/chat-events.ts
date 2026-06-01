/**
 * Лёгкий мост к ИИ-чату через window-событие — чтобы из любого места
 * (например со страницы растения) открыть виджет и подставить вопрос.
 * Без глобального стейта/контекста: виджет в layout слушает это событие.
 */
export const CHAT_PREFILL_EVENT = "gorod-sad:chat-prefill";

export interface ChatPrefillDetail {
  text: string;
  /** сразу отправить или только подставить (по умолчанию — подставить). */
  send?: boolean;
}

export function askAiAbout(text: string, send = false) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<ChatPrefillDetail>(CHAT_PREFILL_EVENT, { detail: { text, send } }),
  );
}
