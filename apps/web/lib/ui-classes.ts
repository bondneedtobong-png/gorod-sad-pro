// Общие классы (чистые строки, без импортов компонентов — безопасно для клиента и сервера).
// Тёмная тема: поверхности — полупрозрачный белый на pine, акцент — бирюза (aqua).
export const inputClass =
  "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-mist placeholder:text-mist/40 transition focus:border-aqua-400 focus:outline-none focus:ring-2 focus:ring-aqua-400/30";

export const labelClass = "mb-1.5 block text-sm font-medium text-mist/80";

export const primaryBtn =
  "inline-flex items-center justify-center gap-2 rounded-full bg-gs-fresh px-5 py-2.5 text-sm font-semibold text-pine-950 shadow-aqua-glow transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50";

export const outlineBtn =
  "inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-sm font-medium text-mist transition hover:border-aqua-400 hover:text-aqua-400";

export const cardClass =
  "rounded-3xl bg-white/[0.04] p-6 shadow-card ring-1 ring-white/10";
