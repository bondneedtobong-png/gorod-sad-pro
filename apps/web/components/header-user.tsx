"use client";

import { LayoutDashboard, LogOut, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

import { cn } from "@/lib/utils";

/** Блок пользователя в шапке: «Войти» для гостя, «Кабинет»/«Админка» для вошедшего. */
export function HeaderUser() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="h-9 w-16 animate-pulse rounded-full bg-white/10" aria-hidden />;
  }

  if (!session?.user) {
    return (
      <Link
        href="/login"
        className="inline-flex items-center gap-1.5 rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-mist transition hover:border-aqua-400 hover:text-aqua-400"
      >
        Войти
      </Link>
    );
  }

  const isAdmin = session.user.role === "ADMIN";
  const label = session.user.name || session.user.email || "Кабинет";

  return (
    <div className="flex items-center gap-1.5">
      {isAdmin && (
        <Link
          href="/admin"
          className="hidden items-center gap-1.5 rounded-full border border-white/20 px-3 py-2 text-sm font-medium text-mist transition hover:border-aqua-400 hover:text-aqua-400 sm:inline-flex"
          title="Админка"
        >
          <ShieldCheck className="h-4 w-4" /> Админка
        </Link>
      )}
      <Link
        href="/account"
        className={cn(
          "inline-flex items-center gap-2 rounded-full bg-gs-fresh px-4 py-2 text-sm font-semibold text-pine-950 shadow-aqua-glow transition hover:brightness-110",
        )}
      >
        <LayoutDashboard className="h-4 w-4" />
        <span className="max-w-[10rem] truncate">{label}</span>
      </Link>
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/" })}
        aria-label="Выйти"
        className="grid h-9 w-9 place-items-center rounded-full text-mist/60 transition hover:bg-white/10 hover:text-mist"
        title="Выйти"
      >
        <LogOut className="h-4 w-4" />
      </button>
    </div>
  );
}
