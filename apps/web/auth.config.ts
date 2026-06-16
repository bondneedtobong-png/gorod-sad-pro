import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe базовая конфигурация Auth.js — без Prisma/bcrypt.
 * Используется и в middleware (Edge), и расширяется в auth.ts (Node).
 */
export default {
  pages: { signIn: "/login" },
  providers: [], // реальные провайдеры добавляются в auth.ts (Node-рантайм)
  trustHost: true,
  callbacks: {
    // Защита маршрутов в middleware: /account и /admin — только для вошедших.
    // Роль ADMIN для /admin дополнительно проверяется на сервере (layout админки).
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = Boolean(auth?.user);
      const p = nextUrl.pathname;
      if (p.startsWith("/account") || p.startsWith("/admin")) return isLoggedIn;
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.uid = user.id;
        token.role = (user as { role?: "USER" | "ADMIN" }).role ?? "USER";
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        if (typeof token.uid === "string") session.user.id = token.uid;
        session.user.role = (token.role as "USER" | "ADMIN" | undefined) ?? "USER";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
