"use client";

import { SessionProvider } from "next-auth/react";

/** Клиентский провайдер сессии Auth.js (для useSession в шапке/формах). */
export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
