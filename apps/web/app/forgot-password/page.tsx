import type { Metadata } from "next";

import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotForm } from "@/components/auth/forgot-form";

export const metadata: Metadata = { title: "Восстановление пароля — Город-сад" };

export default function ForgotPasswordPage() {
  return (
    <AuthShell title="Восстановление пароля" subtitle="Укажите email — пришлём ссылку для сброса пароля.">
      <ForgotForm />
    </AuthShell>
  );
}
