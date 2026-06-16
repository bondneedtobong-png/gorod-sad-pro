import type { Metadata } from "next";

import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Вход — Город-сад" };
export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <AuthShell title="Вход" subtitle="Войдите, чтобы видеть заявки, сохранённые проекты и избранное.">
      <LoginForm />
    </AuthShell>
  );
}
