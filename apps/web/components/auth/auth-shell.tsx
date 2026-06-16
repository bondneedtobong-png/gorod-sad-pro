import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

/** Общая оболочка страниц авторизации: шапка + центрированная карточка + подвал. */
export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <main className="relative flex min-h-screen flex-col">
      <SiteHeader />
      <section className="relative flex flex-1 items-center justify-center px-4 py-14">
        <div className="leaf-frame w-full max-w-md rounded-3xl bg-paper p-8 shadow-card ring-1 ring-forest-200/70">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-forest-900">
            {title}
          </h1>
          {subtitle && <p className="mt-1.5 text-sm leading-relaxed text-forest-600">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}

export const authInputClass =
  "w-full rounded-xl border border-forest-200 bg-white px-4 py-2.5 text-sm text-forest-900 placeholder:text-forest-500/70 transition focus:border-wheat-500 focus:outline-none focus:ring-2 focus:ring-wheat-500/30";

export const authPrimaryBtn =
  "inline-flex w-full items-center justify-center gap-2 rounded-full bg-wheat-500 px-5 py-3 font-medium text-forest-900 shadow-wheat-glow transition hover:bg-wheat-400 disabled:cursor-not-allowed disabled:opacity-50";
