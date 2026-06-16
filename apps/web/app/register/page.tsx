import type { Metadata } from "next";

import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = { title: "Регистрация — Город-сад" };

export default function RegisterPage() {
  return (
    <AuthShell title="Регистрация" subtitle="Создайте аккаунт, чтобы сохранять проекты и отслеживать заявки.">
      <RegisterForm />
    </AuthShell>
  );
}
