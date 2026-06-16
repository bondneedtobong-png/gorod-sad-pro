"use client";

import { LayoutDashboard, LogOut, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

import { cn } from "@/lib/utils";

/** Блок пользователя в шапке: «Войти» для гостя, «Кабинет»/«Админка» для вошедшего. */
export function HeaderUser() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="h-9 w-16 animate-pulse rounded-full bg-forest-100" aria-hidden />;
  }

  if (!session?.user) {
    return (
      <Link
        href="/login"
        className="inline-flex items-center gap-1.5 rounded-full border border-forest-300 px-4 py-2 text-sm font-medium text-forest-800 transition hover:border-wheat-600 hover:text-wheat-700"
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
          className="hidden items-center gap-1.5 rounded-full border border-forest-300 px-3 py-2 text-sm font-medium text-forest-800 transition hover:border-wheat-600 hover:text-wheat-700 sm:inline-flex"
          title="Админка"
        >
          <ShieldCheck className="h-4 w-4" /> Админка
        </Link>
      )}
      <Link
        href="/account"
        className={cn(
          "inline-flex items-center gap-2 rounded-full bg-wheat-500 px-4 py-2 text-sm font-medium text-forest-900 shadow-wheat-glow transition hover:bg-wheat-400",
        )}
      >
        <LayoutDashboard className="h-4 w-4" />
        <span className="max-w-[10rem] truncate">{label}</span>
      </Link>
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/" })}
        aria-label="Выйти"
        className="grid h-9 w-9 place-items-center rounded-full text-forest-600 transition hover:bg-forest-100 hover:text-forest-900"
        title="Выйти"
      >
        <LogOut className="h-4 w-4" />
      </button>
    </div>
  );
}
