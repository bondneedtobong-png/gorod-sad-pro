import type { Metadata } from "next";

import { AuthShell } from "@/components/auth/auth-shell";
import { ResetForm } from "@/components/auth/reset-form";

export const metadata: Metadata = { title: "Новый пароль — Город-сад" };
export const dynamic = "force-dynamic";

export default function ResetPasswordPage() {
  return (
    <AuthShell title="Новый пароль" subtitle="Придумайте надёжный пароль для входа.">
      <ResetForm />
    </AuthShell>
  );
}
