"use client";

import { ClipboardList, Heart, LayoutGrid, LogOut, ShieldCheck, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

import { cn } from "@/lib/utils";

const items = [
  { href: "/account", label: "Профиль", icon: User, exact: true },
  { href: "/account/deals", label: "Мои заявки", icon: ClipboardList, exact: false },
  { href: "/account/projects", label: "Мои проекты", icon: LayoutGrid, exact: false },
  { href: "/account/favorites", label: "Избранное", icon: Heart, exact: false },
];

export function AccountNav({ isAdmin, name }: { isAdmin: boolean; name: string }) {
  const pathname = usePathname();
  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <nav className="space-y-1 lg:sticky lg:top-24">
      <div className="mb-4 px-3">
        <div className="text-xs uppercase tracking-[0.18em] text-forest-500">Кабинет</div>
        <div className="mt-0.5 truncate font-display text-lg text-forest-900">{name}</div>
      </div>

      {items.map(({ href, label, icon: Icon, exact }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
            isActive(href, exact)
              ? "bg-wheat-500/20 font-medium text-forest-900"
              : "text-forest-700 hover:bg-forest-100",
          )}
        >
          <Icon className="h-4 w-4" /> {label}
        </Link>
      ))}

      {isAdmin && (
        <Link
          href="/admin"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-forest-700 transition hover:bg-forest-100"
        >
          <ShieldCheck className="h-4 w-4" /> Админка
        </Link>
      )}

      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/" })}
        className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-forest-600 transition hover:bg-forest-100"
      >
        <LogOut className="h-4 w-4" /> Выйти
      </button>
    </nav>
  );
}
