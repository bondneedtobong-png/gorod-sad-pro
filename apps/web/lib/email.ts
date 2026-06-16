/**
 * Отправка писем через Resend (REST API, без SDK — держим зависимости лёгкими).
 * Если RESEND_API_KEY не задан — письмо не отправляется (в dev ссылку логируем).
 * Кириллица здесь безопасна: она в JSON-теле, а не в HTTP-заголовках.
 */

const FROM = process.env.EMAIL_FROM || "Город-сад <onboarding@resend.dev>";

async function send(to: string, subject: string, html: string): Promise<boolean> {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) {
    console.warn("[email] RESEND_API_KEY не задан — письмо не отправлено:", subject);
    return false;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
      body: JSON.stringify({ from: FROM, to, subject, html }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

function shell(title: string, body: string): string {
  return `<!doctype html><html><body style="margin:0;background:#dee9c2;font-family:Arial,Helvetica,sans-serif;color:#1b2e20">
  <div style="max-width:520px;margin:0 auto;padding:32px 16px">
    <div style="background:#ffffff;border-radius:20px;padding:28px;box-shadow:0 16px 44px -24px rgba(21,40,26,.45)">
      <div style="font-size:13px;letter-spacing:.18em;text-transform:uppercase;color:#9a8748;font-weight:700">Город-сад</div>
      <h1 style="font-size:22px;margin:8px 0 16px;color:#14241a">${title}</h1>
      ${body}
    </div>
    <div style="text-align:center;color:#356b47;font-size:12px;margin-top:16px">
      Ландшафтное бюро «Город-сад» · Ульяновск · 8-937-038-83-44
    </div>
  </div></body></html>`;
}

export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[email] ссылка для сброса пароля (dev):", resetUrl);
  }
  const html = shell(
    "Восстановление пароля",
    `<p style="line-height:1.6;color:#2a523a">Вы запросили сброс пароля. Нажмите кнопку ниже — ссылка действует 1 час. Если это были не вы, просто проигнорируйте письмо.</p>
     <p style="margin:24px 0"><a href="${resetUrl}" style="display:inline-block;background:#e3c878;color:#14241a;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:999px">Задать новый пароль</a></p>
     <p style="font-size:12px;color:#6fa683;word-break:break-all">${resetUrl}</p>`,
  );
  return send(to, "Восстановление пароля — Город-сад", html);
}
